import { Svg } from "@svgdotjs/svg.js";
import { myToaster } from "../App";
import SchemeManager, { IUserSchemeData, SVGDict } from "./default";
import { IDiagram } from "./diagram";
import DiagramHandler from "./diagramHandler";
import LabelGroup, { ILabelGroup } from "./labelGroup";
import RectElement, { IRectElement } from "./rectElement";
import SVGElement, { ISVGElement } from "./svgElement";
import { instantiateByType } from "./util";
import { Visual } from "./visual";

export interface SchemeSingletonStore {
    RECT_TEMPLATES: RectElement[] 
    SVG_TEMPLATES: SVGElement[]
    LABELGROUP_TEMPLATES: LabelGroup[]
}
export type SingletonStorage = Record<string, SchemeSingletonStore>

class ENGINE {
    static listeners: (() => void)[] = []
    static currentImageName: string = "newPulseImage.svg"
    static StateName: string = "diagram-state";
    static STATE: string | null = localStorage.getItem(ENGINE.StateName);
    static schemeManager: SchemeManager;
    static singletons: SingletonStorage;

    static set surface(s: Svg) {
        ENGINE._surface = s;
        ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange, this.schemeManager)
        console.log("SURFACE ATTACHED")
    }
    static get surface(): Svg {
        return ENGINE._surface;
    }
    private static _surface: Svg;

    static initialiseSchemeManager() {
        ENGINE.schemeManager = new SchemeManager(ENGINE.emitChange);
    }


    static get handler(): DiagramHandler {
        if (ENGINE._handler === undefined) {
            throw new Error("Handler has not been created")
        }
        return ENGINE._handler;
    }
    private static _handler: DiagramHandler;

    static subscribe(listener: () => void) {
        ENGINE.listeners = [...ENGINE.listeners, listener];
        return (() => {
            ENGINE.listeners = ENGINE.listeners.filter((l => l !== listener))
        }).bind(ENGINE)
    }
    static getSnapshot() {
        return ENGINE.handler.id + ENGINE.schemeManager.id;
    }
    static emitChange() {
        ENGINE.listeners.forEach((l) => {
            l();
        })
    }
    static loadDiagramState() {
        var stateObj: IDiagram | undefined = undefined; 
        if (this.STATE !== null) {
            try {
                stateObj = JSON.parse(this.STATE) as IDiagram;
            } catch(error) {
                myToaster.show({
                    message: "Invalid state",
                    intent: "danger"
                })
            }
        }

        if (stateObj !== undefined) {
            try {
                this.handler.constructDiagram(stateObj);
            } catch(error) {
                console.warn(error)
            }
        }
    }
    static async loadSVGData() {
        await this.schemeManager.loadSVGs();
    }
    static save() {
        var stateObject: IDiagram = ENGINE.handler.diagram.state
        var stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);
    }

    static createSingletons() {
        var singletonCollections: SingletonStorage = {};
        
        for (var [schemeName, scheme] of Object.entries(this.schemeManager.allSchemes)) {
            var rectSingletons: RectElement[] = [];
            var svgSingletons: SVGElement[] = [];
            var labelGroupSingletons: LabelGroup[] = [];


            Object.values(scheme.rectElements ?? {}).forEach((t) => {
                rectSingletons.push(new RectElement(t as IRectElement))
            })
            Object.values(scheme.svgElements ?? {}).forEach((t) => {
                svgSingletons.push(new SVGElement(t as ISVGElement));
            })
            Object.values(scheme.labelGroupElements ?? {}).forEach((t) => {
                labelGroupSingletons.push(new LabelGroup(t as ILabelGroup))
            })

            singletonCollections[schemeName] = {
                RECT_TEMPLATES: rectSingletons,
                SVG_TEMPLATES: svgSingletons,
                LABELGROUP_TEMPLATES: labelGroupSingletons
            }
        }

        this.singletons = singletonCollections;
    }


    static addSVGSingleton(data: ISVGElement, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.addSVGData(data, schemeName);

        this.singletons[schemeName].SVG_TEMPLATES.push(new SVGElement(data));
    }
    static addRectSingleton(data: IRectElement, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.addRectData(data, schemeName)

        this.singletons[schemeName].RECT_TEMPLATES.push(new RectElement(data));
    }
    static addLabelGroupSingleton(data: ILabelGroup, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.addLabelGroupData(data, schemeName);

        this.singletons[schemeName].LABELGROUP_TEMPLATES.push(new LabelGroup(data));
    }

    static removeSVGSingleton(data: ISVGElement, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.removeSVGData(data, schemeName);

        this.singletons[schemeName].SVG_TEMPLATES = this.singletons[schemeName].SVG_TEMPLATES.filter(singleton => singleton.ref !== data.ref);
        this.emitChange();
    }
    static removeRectSingleton(data: IRectElement, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.removeRectData(data, schemeName)

        this.singletons[schemeName].RECT_TEMPLATES = this.singletons[schemeName].RECT_TEMPLATES.filter(singleton => singleton.ref !== data.ref);
        this.emitChange();
    }
    static removeLabelGroupSingleton(data: ILabelGroup, schemeName: string=SchemeManager.InternalSchemeName) {
        this.schemeManager.removeLabelGroupData(data, schemeName);

        this.singletons[schemeName].LABELGROUP_TEMPLATES = this.singletons[schemeName].LABELGROUP_TEMPLATES.filter(singleton => singleton.ref !== data.ref);
        this.emitChange();
    }


    static addBlankScheme(name: string) {
        ENGINE.singletons[name] = {RECT_TEMPLATES: [], SVG_TEMPLATES: [], LABELGROUP_TEMPLATES: []};
        ENGINE.schemeManager.setUserScheme(name.trim(), {});
    }

    static addScheme(name: string, data: IUserSchemeData) {
        ENGINE.schemeManager.setUserScheme(name, data);
        ENGINE.createSingletons();
    }

    static removeScheme(name: string) {
        delete ENGINE.singletons[name]
        ENGINE.schemeManager.deleteUserScheme(name);
    }

    static get SVG_STRINGS(): Record<string, SVGDict> {return this.schemeManager.allSVGData}
    // Temp
    static get AllSvgStrings(): SVGDict {
        var svgs: Record<string, string> = {};
        for (var [schemeName, svgDict] of Object.entries(this.SVG_STRINGS)) {
            for (var [svgRef, svgStr] of Object.entries(svgDict)) {
                svgs[svgRef] = svgStr
            }
        }
        return svgs
    }   
}


export default ENGINE