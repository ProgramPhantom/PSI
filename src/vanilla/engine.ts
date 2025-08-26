import { Svg } from "@svgdotjs/svg.js";
import RectElement from "./rectElement";
import DiagramHandler from "./diagramHandler";
import SVGElement from "./svgElement";
import { myToaster } from "../App";
import { IDiagram } from "./diagram";


class ENGINE {
    static listeners: (() => void)[] = []
    static currentImageName: string = "newPulseImage.svg"
    static StateName: string = "diagram-state";
    static STATE: string | null = localStorage.getItem(ENGINE.StateName);

    static set surface(s: Svg) {
        ENGINE._surface = s;
        ENGINE._handler = new DiagramHandler(s, ENGINE.emitChange)
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
        // localStorage.setItem("diagram-state", JSON.stringify(this.handler.diagram.state));
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
            this.handler.constructDiagram(stateObj);
        }
    }
    static save() {
        var stateObject: IDiagram = ENGINE.handler.diagram.state
        var stateString = JSON.stringify(stateObject, undefined, 4);
        localStorage.setItem(ENGINE.StateName, stateString);
    }

    static PULSE90 = new RectElement({ref: "90-pulse"}, "90-pulse");
    static PULSE180 = new RectElement({ref: "180-pulse"}, "180-pulse");

    static P180 = new SVGElement({ref: "180"}, "180");
    static AMP = new SVGElement({ref: "amp"}, "amp");
    static ACQUIRE = new SVGElement({ref: "acquire"}, "acquire");
    static CHIRPHILO = new SVGElement({ref: "chirphilo"}, "chirphilo");
    static CHIRPLOHI = new SVGElement({ref: "chirplohi"}, "chirplohi");
}


export default ENGINE