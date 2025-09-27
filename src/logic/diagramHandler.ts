import { Rect, Svg } from "@svgdotjs/svg.js";
import { PointBind } from "../features/canvas/LineTool";
import Channel, { IChannel } from "./hasComponents/channel";
import SchemeManager from "./default";
import Diagram, { AllStructures, IDiagram } from "./hasComponents/diagram";
import LabelGroup, { ILabelGroup } from "./hasComponents/labelGroup";
import Line, { ILine } from "./line";
import logger, { Operations } from "./log";
import { IMountConfig } from "./mountable";
import { ID } from "./point";
import RectElement, { IRectElement, } from "./rectElement";
import Sequence from "./hasComponents/sequence";
import SVGElement, { ISVGElement, } from "./svgElement";
import { FillObject, instantiateByType, RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";
import ENGINE from "./engine";



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
    private _diagram: Diagram;
    public get diagram(): Diagram {
        return this._diagram;
    }
    public set diagram(val: Diagram) {
        val.ownershipType = "component";
        this._diagram = val;
    }

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



    draw() {
        if (!this.surface) {
            throw new Error("Svg surface not attached!")
        }

        this.surface.add(new Rect().move(0, 0).id("diagram-root"))

        this.surface.size(`${this.diagram.width}px`, `${this.diagram.height}px`)
        this.diagram.draw(this.surface);
        this.syncExternal();
    }

    // ---------- Element identification ----------
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

    // ----- Construct diagram from state ------
    public constructDiagram(state: IDiagram): Diagram {
        var newDiagram: Diagram = new Diagram(state);
        this.diagram = newDiagram;

        // Create and mount pulses.
        state.sequences.forEach((s) => {
            s.channels.forEach((c) => {
                c.mountedElements.forEach((m) => {
                    if (m.type === undefined) {
                        console.warn(`Element data is missing type: ${m.ref}`)
                    }
                    this.createVisual(m, m.type as AllComponentTypes);
                })
            })
        })

        this.draw();
        return newDiagram
    }

    // ---- Form interfaces ----
    public submitVisual(parameters: IVisual, type: AllComponentTypes): Visual {

        var element: Visual | undefined;
        switch (type) {
            case "channel":
                (parameters as IChannel).sequenceID = this.diagram.sequenceIDs[0];
                element = this.submitChannel(parameters as IChannel);
                break;
            case "rect":
            case "svg":
            case "label-group":
                if (parameters.mountConfig !== undefined) {
                    parameters.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
                }
                
                element = this.createVisual(parameters, type)
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

    public submitModifyVisual(parameters: IVisual, type: AllComponentTypes, target: Visual): Visual {
        var mountConfigCopy: IMountConfig | undefined = target.mountConfig;
        // Delete element
        this.deleteVisual(target, false)

        // Copy hidden parameter channelID (this shouldn't be needed as it should take the state
        // from the form. The hidden values should still be in the form.)
        if (mountConfigCopy !== undefined && parameters.mountConfig !== undefined) {
            parameters.mountConfig.channelID = mountConfigCopy.channelID;
            parameters.mountConfig.index = mountConfigCopy.index;
        }

        var element: Visual = this.submitVisual(parameters, type);

        return element;
    }

    public submitDeleteVisual(target: Visual, type: AllComponentTypes) {
        switch (type) {
            case "rect":
            case "svg":
            case "label-group":
                this.deleteVisual(target);
                break;
            case "channel":
                this.deleteChannel(target as Channel);
                break;
            default:
                throw new Error(`Cannot delete component of type ${type}`);
        }
    }

    public submitChannel(parameters: IChannel): Visual {
        if (parameters.sequenceID === undefined) {
            throw new Error(`No sequence id on channel ${parameters.ref}`)
        }
        
        var newChannel = new Channel(parameters);
        
        this.addChannel(newChannel)

        return newChannel
    }

    // ------------------------


    // ---------- Visual interaction (generic) -----------
    public addElement(element: Visual) {
        if (element.isMountable === true) {
            this.mountVisual(element, false);
            return
        } 

        this.diagram.add(element);
        this.diagram.computeBoundary();
        this.draw();
    }
    public createVisual(parameters: IVisual, type: AllComponentTypes): Visual {
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
            this.mountVisual(element, false)
        } else {
            this.diagram.addElement(element);
        }

        return element;
    }
    public replaceVisual(target: Visual, newElement: Visual): void {
        if (target.isMountable) {
            this.replaceMountable(target, newElement)
        } else {
            throw new Error("not implemented")
        }
    }
    public moveVisual(element: Visual, x: number, y: number) {
        element.x = x;
        element.y = y;

        this.diagram.computeBoundary();
        this.draw();
    }
    public deleteVisual(target: Visual, removeColumn?: boolean) {
        if (target.isMountable) {
            this.deleteMountedVisual(target, removeColumn);
        }
    }
    public deleteVisualByID(targetId: ID) {
        var target: Visual | undefined = this.identifyElement(targetId);
        if (target === undefined) {
            return
        }
        this.deleteVisual(target);
    }

    public deleteFreeVisual(target: Visual) {
        if (!this.diagram.userChildren.includes(target)) {
            throw new Error(`Cannot remove controlled element ${target.ref} with this method`)
        }

        this.diagram.remove(target);
        this.draw();
    }
    public deleteFreeVisualByID(id: ID) {
        var target: Visual | undefined = this.identifyElement(id);
        if (target === undefined) {
            throw new Error(`Cannot find element with ID ${id}`);
        }

        if (!this.diagram.userChildren.includes(target)) {
            throw new Error(`Cannot remove controlled element ${target.ref} with this method`)
        }

        this.diagram.remove(target);
        this.draw();
    }
    // ----------------------------


    // ------- Channel stuff ---------
    public addChannel(element: Channel) {
        var sequence: Sequence | undefined = this.diagram.sequenceDict[element.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence of ID ${element.sequenceID}`)
        }

        sequence.addChannel(element);
        this.draw()
    }

    public deleteChannel(target: Channel) {
        var sequence: Sequence | undefined = this.diagram.sequenceDict[target.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find channel with ID: ${target.sequenceID}`);
        }

        sequence.deleteChannel(target);
        this.draw();
    }

    // ----------- Annotation stuff ------------------
    public createLine(pParams: RecursivePartial<ILine>, startBinds: PointBind, endBinds: PointBind) {
        var newArrow: Line = new Line(pParams);

        startBinds["x"].anchorObject.bind(newArrow, "x", startBinds["x"].bindingRule.anchorSiteName, "here", undefined, undefined, false);
        startBinds["y"].anchorObject.bind(newArrow, "y", startBinds["y"].bindingRule.anchorSiteName, "here", undefined, undefined, false);
        startBinds["x"].anchorObject.enforceBinding();
        startBinds["y"].anchorObject.enforceBinding();

        endBinds["x"].anchorObject.bind(newArrow, "x", endBinds["x"].bindingRule.anchorSiteName, "far", undefined, undefined, false);
        endBinds["y"].anchorObject.bind(newArrow, "y", endBinds["y"].bindingRule.anchorSiteName, "far", undefined, undefined, false);
        endBinds["x"].anchorObject.enforceBinding()
        endBinds["y"].anchorObject.enforceBinding()

        this.diagram.addFreeArrow(newArrow);
        this.draw();
    }

    // -------------- Mounted visual interactions ----------------
    // @isMountable
    public mountVisual(target: Visual, insert: boolean=true) {
        // Temporary
        if (target.mountConfig !== undefined) {
            target.mountConfig.sequenceID = this.diagram.sequenceIDs[0];
        }

        this.diagram.mountElement(target, insert);
        this.draw();
    }

    private deleteMountedVisual(target: Visual, removeColumn: boolean=true): boolean {
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

        this.deleteMountedVisual(target, false);

        this.diagram.mountElement(newElement, false);
     
        this.draw();
    }

    // For inserting
    // @isMountable
    public shiftMountedVisual(target: Visual, newMountConfig: IMountConfig): void {
        var deleted: boolean = this.deleteMountedVisual(target, true);

        if (deleted && target.mountConfig!.index+target.mountConfig!.noSections === newMountConfig.index) {
            newMountConfig.index -= target.mountConfig!.noSections
        }

        target.mountConfig = newMountConfig;
        this.mountVisual(target, true);
    }

    // For moving to another mount
    public moveMountedVisual(target: Visual, newMountConfig: IMountConfig) {
        var removeCol: boolean = true;
        if (target.mountConfig!.index === newMountConfig.index) {  // Moving to the same column (for intra-channel movement)
            removeCol = false
        }
        var deleted: boolean = this.deleteMountedVisual(target, removeCol);

        if (deleted && target.mountConfig!.index + target.mountConfig!.noSections < newMountConfig.index) {
            newMountConfig.index -= 1
        }
        

        target.mountConfig = newMountConfig;
        this.mountVisual(target, false);
    }
    // ------------------------------------------------------------
}