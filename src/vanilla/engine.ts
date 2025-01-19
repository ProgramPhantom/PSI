import RectElement from "./rectElement";
import SequenceHandler from "./sequenceHandler";


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
}


export default ENGINE