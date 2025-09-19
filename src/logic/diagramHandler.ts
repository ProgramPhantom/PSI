import { Rect, Svg } from "@svgdotjs/svg.js";
import { PointBind } from "../features/canvas/LineTool";
import Channel, { IChannel } from "./channel";
import SchemeManager from "./default";
import Diagram, { AllStructures, IDiagram } from "./diagram";
import LabelGroup, { ILabelGroup } from "./labelGroup";
import Line, { ILine } from "./line";
import logger, { Operations } from "./log";
import { IMountConfig } from "./mountable";
import { ID } from "./point";
import RectElement, { IRectElement, } from "./rectElement";
import Sequence from "./sequence";
import SVGElement, { ISVGElement, } from "./svgElement";
import { FillObject, instantiateByType, RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";



// All component types
export type AllComponentTypes = UserComponentType | AbstractComponentTypes 

// The types of component 
export type UserComponentType = DrawComponent | "label-group" | "label" | "text" | "line" | "channel" | "sequence" | "diagram" ; 
export type DrawComponent = "svg" | "rect" | "space"

// Abstract component types (have no visual content)
export type AbstractComponentTypes = "aligner" | "collection" | "lower-abstract" | "visual"


// All
export type AllElementIdentifiers = AllStructures | AllComponentTypes






export default class DiagramHandler {


    diagram: Diagram;
    surface?: Svg;
    schemeManager: SchemeManager;

    get id(): string {
        var id: string = "";
        this.diagram.components.sequences.forEach((s) => {
            Object.keys(s.allElements).forEach((k) => {
                id += k;
            })
        })
        return id;
    }
    syncExternal: () => void;

    get sequences(): Sequence[] {return this.diagram.components.sequences}
    hasSequence(name: string): boolean {return this.diagram.sequenceIDs.includes(name)}

    get allElements(): Record<ID, Visual> {
        return this.diagram.allElements
    }

    constructor(surface: Svg, emitChange: () => void, schemeManager: SchemeManager) {
        this.syncExternal = emitChange;


        this.diagram = new Diagram({});
        
        
        this.schemeManager = schemeManager;
        this.surface = surface;
    }

    // TODO: forced index for channel addition
    channel(parameters: IChannel,  index?: number): Visual {
        if (parameters.sequenceID === undefined) {
            throw new Error(`No sequence id on channel ${parameters.ref}`)
        }
        
        var newChannel = new Channel(parameters);
        
        var sequence: Sequence | undefined = this.diagram.sequenceDict[parameters.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence of ID ${parameters.sequenceID}`)
        }

        sequence.addChannel(newChannel);
        this.draw()

        return newChannel
    }

    draw() {
        if (!this.surface) {
            throw new Error("Svg surface not attached!")
        }

        this.surface.add(new Rect().move(0, 0).id("diagram-root"))

        this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`)
        this.diagram.draw(this.surface);
        this.syncExternal();
    }

    // ----- Construct diagram from state ------
    public constructDiagram(state: IDiagram): Diagram {
        var newDiagram: Diagram = new Diagram(state);
        this.diagram = newDiagram;

        state.sequences.forEach((s) => {
            s.channels.forEach((c) => {
                c.mountedElements.forEach((m) => {
                    if (m.type === undefined) {
                        console.warn(`Element data is missing type: ${m.ref}`)
                    }
                    this.createElement(m, m.type as AllComponentTypes);
                })
            })
        })

        this.draw();
        return newDiagram
    }

    // ---- Form interfaces ----
    public submitElement(parameters: IVisual, type: AllComponentTypes): Visual {

        var element: Visual | undefined;
        switch (type) {
            case "channel":
                (parameters as IChannel).sequenceID = this.diagram.sequenceIDs[0];
                element = this.channel(parameters as IChannel);
                break;
            case "rect":
            case "svg":
            case "label-group":
                if (parameters.mountConfig !== undefined) {
                    parameters.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
                }
                
                element = this.createElement(parameters, type)
                return element
                break;
            default:
                throw new Error(`Unexpected element type "${type}"`)
        }

        if (element === undefined) {
            throw new Error(`Cannot create element ${parameters.ref}`)
        }
        return element
    }

    public submitModifyElement(parameters: IVisual, type: AllComponentTypes, target: Visual): Visual {
        var mountConfigCopy: IMountConfig | undefined = target.mountConfig;
        // Delete element
        this.deleteElement(target, false)

        // Copy hidden parameter channelID (this shouldn't be needed as it should take the state
        // from the form. The hidden values should still be in the form.)
        if (mountConfigCopy !== undefined && parameters.mountConfig !== undefined) {
            parameters.mountConfig.channelID = mountConfigCopy.channelID;
            parameters.mountConfig.index = mountConfigCopy.index;
        }

        var element: Visual = this.submitElement(parameters, type);

        return element;
    }

    public submitDeleteElement(target: Visual, type: AllComponentTypes) {
        switch (type) {
            case "rect":
            case "svg":
            case "label-group":
                this.deleteElement(target);
                break;
            case "channel":
                this.deleteChannel(target as Channel);
                break;
            default:
                throw new Error(`Cannot delete component of type ${type}`);
        }
    }
    // ------------------------


    public createElement(parameters: IVisual, type: AllComponentTypes): Visual {
        var element: Visual;

        // NECESSARY to make element accept binding changes. X, Y persists when changing into a label
        // so if this isn't done, element might not carry changes and update label position.
        parameters.x = undefined;
        parameters.y = undefined;

        switch (type) {
            case "svg":
                element = new SVGElement(parameters as ISVGElement);
                break;
            case "rect":
                element = new RectElement(parameters as IRectElement);
                break;
            case "label-group":
                element = new LabelGroup(parameters as ILabelGroup);
                break;
            default:
                throw new Error(`Cannot create requested element type ${type}`)
        }

        
        if (element.mountConfig !== undefined) {
            this.mountElement(element, false)
        } else {
            this.diagram.addElement(element);
        }

        return element;
    }

    public addElementFromTemplate(pParameters: RecursivePartial<IVisual & ILabelGroup>, elementRef: string) {
        var elementType: UserComponentType = this.schemeManager.elementTypes[elementRef];

        var element: Visual;

        // Temporary
        if (pParameters.mountConfig !== undefined) {
            pParameters.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
        }


        switch (elementType) {
            case "svg":
                element = new SVGElement(pParameters, elementRef)
                
                if (pParameters.labels !== undefined) {
                    element = new LabelGroup<SVGElement>(pParameters, element as SVGElement) 
                }

                break;
            case "rect":
                element = new RectElement(pParameters, elementRef)
                if (pParameters.labels !== undefined) {
                    element = new LabelGroup<RectElement>(pParameters, element as RectElement) 
                }
                break;
            default:
                throw new Error(`Not added ability to add ${elementType} via template`)
        }

        
        this.addElement(element);
    }

    public moveElement(element: Visual, x: number, y: number) {
        element.x = x;
        element.y = y;

        this.diagram.computeBoundary();
        this.draw();
    }

    public replaceElement(target: Visual, newElement: Visual): void {
        if (target.isMountable) {
            this.replaceMountable(target, newElement)
        } else {
            throw new Error("not implemented")
        }
    }

    public deleteElement(target: Visual, removeColumn?: boolean) {
        if (target.isMountable) {
            this.deleteMountedElement(target, removeColumn);
        }
    }

    public deleteElementByID(targetId: ID) {
        var target: Visual | undefined = this.identifyElement(targetId);
        if (target === undefined) {
            return
        }
        this.deleteElement(target);
    }

    public deleteChannel(target: Channel) {
        var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find channel with ID: ${target.sequenceID}`);
        }

        sequence.deleteChannel(target);
        this.draw();
    }

    public identifyElement(id: string): Visual | undefined {
        var element: Visual | undefined = undefined;

        element = this.allElements[id]

        if (element === undefined) {
            console.warn(`Cannot find element "${id}"`);
            return undefined;
        } else {
            return element;
        }
    }

    public addElement(element: Visual) {
        if (element.isMountable === true) {
            this.mountElement(element, false);
            return
        } 


        this.diagram.add(element);
        this.diagram.computeBoundary();
        this.draw();
    }

    public createArrow(pParams: RecursivePartial<ILine>, startBinds: PointBind, endBinds: PointBind) {
        var newArrow: Line = new Line(pParams);

        startBinds["x"].anchorObject.bind(newArrow, "x", startBinds["x"].bindingRule.anchorSiteName, "here");
        startBinds["y"].anchorObject.bind(newArrow, "y", startBinds["y"].bindingRule.anchorSiteName, "here");
        startBinds["x"].anchorObject.enforceBinding();
        startBinds["y"].anchorObject.enforceBinding();

        endBinds["x"].anchorObject.bind(newArrow, "x", endBinds["x"].bindingRule.anchorSiteName, "far");
        endBinds["y"].anchorObject.bind(newArrow, "y", endBinds["y"].bindingRule.anchorSiteName, "far");
        endBinds["x"].anchorObject.enforceBinding()
        endBinds["y"].anchorObject.enforceBinding()

        this.diagram.addFreeArrow(newArrow);
        this.draw()
    }


    /* Interaction commands:
    Add a positional element by providing elementName, channel name, and partial positional interface.
    Function uses element name to lookup default parameters and replaces with those provided */
    
    public mountElementFromTemplate(pParameters: RecursivePartial<IVisual & ILabelGroup>, elementRef: string, insert: boolean=false) {
        var elementType: UserComponentType | undefined = this.schemeManager.elementTypes[elementRef];

        if (elementType === undefined) {
            throw new Error(`Template for element ${elementRef} not found`)
        }

        var element: Visual;

        pParameters.x = undefined;
        pParameters.y = undefined;

        // Temporary
        if (pParameters.mountConfig !== undefined) {
            pParameters.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
        }


        var parameters;

        switch (elementType) {
            case "svg":
                parameters = FillObject(pParameters as IVisual, this.schemeManager.internalScheme.svgElements[elementRef])
                element = new SVGElement(parameters)
                
                if (pParameters.labels !== undefined) {
                    element = new LabelGroup<SVGElement>(parameters, element as SVGElement) 
                }
                break;
            case "rect":
                parameters = FillObject(pParameters as IVisual, this.schemeManager.internalScheme.rectElements[elementRef])
                element = new RectElement(parameters);

                if (pParameters.labels !== undefined) {
                    element = new LabelGroup<RectElement>(parameters, element as RectElement) 
                }
                break;
            case "label-group":
                parameters = FillObject(pParameters as ILabelGroup, this.schemeManager.internalScheme.labelGroupElements[elementRef])
                
                var child: Visual = instantiateByType(parameters.coreChild, parameters.coreChildType);

                element = new LabelGroup(parameters, child);
                break;
            default:
                throw new Error(`Not added ability to add component of type ${elementType} via template`)
        }

        
        this.diagram.mountElement(element, insert);
    }

    // @isMountable
    public mountElement(target: Visual, insert: boolean=true) {
        // Temporary
        if (target.mountConfig !== undefined) {
            target.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
        }

        this.diagram.mountElement(target, insert);
        this.draw();
    }

    private deleteMountedElement(target: Visual, removeColumn: boolean=true): boolean {
        logger.operation(Operations.DELETE, `${target}`)

        var columnRemoved: boolean = false;
        // Find which channel owns this element:
        
        columnRemoved = this.diagram.deleteMountedElement(target, removeColumn);

        logger.operation(Operations.DELETE, `COMPLETE DELETE`);
        this.draw();
        return columnRemoved;
    }

    private replaceMountable(target: Visual,  newElement: Visual) {
        logger.operation(Operations.MODIFY, `${target} -> ${newElement}`)

        this.deleteMountedElement(target, false);

        this.diagram.mountElement(newElement, false);
     
        this.draw();
    }

    // @isMountable
    // For inserting
    public shiftMountedElement(target: Visual, newMountConfig: IMountConfig): void {
        var deleted: boolean = this.deleteMountedElement(target, true);

        if (deleted && target.mountConfig!.index+target.mountConfig!.noSections === newMountConfig.index) {
            newMountConfig.index -= target.mountConfig!.noSections
        }

        target.mountConfig = newMountConfig;
        this.mountElement(target, true);
    }

    // For moving to another mount
    public moveMountedElement(target: Visual, newMountConfig: IMountConfig) {
        var removeCol: boolean = true;
        if (target.mountConfig!.index === newMountConfig.index) {  // Moving to the same column (for intra-channel movement)
            removeCol = false
        }
        var deleted: boolean = this.deleteMountedElement(target, removeCol);

        if (deleted && target.mountConfig!.index + target.mountConfig!.noSections < newMountConfig.index) {
            newMountConfig.index -= 1
        }
        

        target.mountConfig = newMountConfig;
        this.mountElement(target, false);
    }
}