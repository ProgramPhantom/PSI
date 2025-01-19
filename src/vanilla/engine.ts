import { Svg } from "@svgdotjs/svg.js";
import RectElement from "./rectElement";
import SequenceHandler from "./sequenceHandler";
import SVGElement from "./svgElement";


class ENGINE {
    static listeners: (() => void)[] = []

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
        console.log("------- EMITTING CHANGE --------")
        ENGINE.listeners.forEach((l) => {
            l();
        })
    }

    static PULSE90 = new RectElement({}, "pulse90");
    static PULSE180 = new RectElement({}, "pulse180");

    static P180 = new SVGElement({}, "180");
    static AMP = new SVGElement({}, "amp");
    static ACQUIRE = new SVGElement({}, "acquire");
    static CHIRPHILO = new SVGElement({}, "chirphilo");
    static CHIRPLOHI = new SVGElement({}, "chirplohi");
}


export default ENGINE