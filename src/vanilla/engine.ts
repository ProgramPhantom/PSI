import { Svg } from "@svgdotjs/svg.js";
import RectElement from "./rectElement";
import SequenceHandler from "./sequenceHandler";
import SVGElement from "./svgElement";


class ENGINE {
    static listeners: (() => void)[] = []
    static currentImageName: string = "newPulseImage.svg"

    static set surface(s: Svg) {
        ENGINE._handler = new SequenceHandler(s, ENGINE.emitChange)
        ENGINE._surface = s;
        console.log("SURFACE ATTACHED")
    }
    static get surface(): Svg {
        return ENGINE._surface;
    }
    private static _surface: Svg;


    static get handler(): SequenceHandler {
        if (ENGINE._handler === undefined) {
            throw new Error("Handler has not been created")
        }
        return ENGINE._handler;
    }
    private static _handler: SequenceHandler;

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

    static PULSE90 = new RectElement({ref: "pulse90"}, "pulse90");
    static PULSE180 = new RectElement({ref: "pulse180"}, "pulse180");

    static P180 = new SVGElement({ref: "180"}, "180");
    static AMP = new SVGElement({ref: "amp"}, "amp");
    static ACQUIRE = new SVGElement({ref: "acquire"}, "acquire");
    static CHIRPHILO = new SVGElement({ref: "chirphilo"}, "chirphilo");
    static CHIRPLOHI = new SVGElement({ref: "chirplohi"}, "chirplohi");
}


export default ENGINE