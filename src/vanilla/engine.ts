import RectElement from "./rectElement";
import SequenceHandler from "./sequenceHandler";
import SVGElement from "./svgElement";


class ENGINE {
    static listeners: (() => void)[] = []
    static handler: SequenceHandler = new SequenceHandler(ENGINE.emitChange);

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