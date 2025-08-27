import { Svg } from "@svgdotjs/svg.js";
import RectElement from "./rectElement";
import DiagramHandler from "./diagramHandler";
import SVGElement from "./svgElement";
import { myToaster } from "../App";
import { IDiagram } from "./diagram";
import { IScheme, schemeData } from "./default";
import { defaults } from "@svgdotjs/svg.js";
import Labellable from "./labellable";


class ENGINE {
    static listeners: (() => void)[] = []
    static currentImageName: string = "newPulseImage.svg"
    static StateName: string = "diagram-state";
    static STATE: string | null = localStorage.getItem(ENGINE.StateName);
    static Scheme: IScheme;

    static set surface(s: Svg) {
        this.Scheme = schemeData["default"];
        this.loadTemplates()
        
        ENGINE._surface = s;
        ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange, this.Scheme)
        console.log("SURFACE ATTACHED")
    }
    static get surface(): Svg {
        return ENGINE._surface;
    }
    private static _surface: Svg;


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
        return ENGINE.handler.id;
    }
    static emitChange() {
        ENGINE.listeners.forEach((l) => {
            l();
        })
    }
    static load() {
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
    static save() {
        var stateObject: IDiagram = ENGINE.handler.diagram.state
        var stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);
    }

    static loadTemplates() {
        Object.values(this.Scheme.rectElements).forEach((t) => {
            this.RECTSINGLETONS.push(new RectElement(t))
        })
        Object.values(this.Scheme.svgElements).forEach((t) => {
            this.SVGSINGLETONS.push(new SVGElement(t));
        })
        Object.values(this.Scheme.labellableElements).forEach((t) => {
            this.LABELLABLESINGLETONS.push()
            // TODO: implement
        })
    }

    static RECTSINGLETONS: RectElement[] = [];
    static SVGSINGLETONS: SVGElement[] = [];
    static LABELLABLESINGLETONS: Labellable[] = [];
}


export default ENGINE