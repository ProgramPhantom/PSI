import { debug } from "console"
import Sequence from "./vanilla/sequence"
import SequenceHandler, { DiagramComponent } from "./vanilla/sequenceHandler"
import PaddedBoxDebug from "./debug/PaddedBox"
import CollectionDebug from "./debug/Collection"
import BindingsDebug from "./debug/Bindings"
import PaddedBox from "./vanilla/paddedBox"
import Labellable from "./vanilla/labellable"
import { Visual } from "./vanilla/visual"
import ENGINE from "./vanilla/engine"
import { Colors } from "@blueprintjs/core"

interface IDebug {
    debugGroupSelection: Record<DiagramComponent, boolean>;
    debugSelection: Visual[];
}

const Debug: React.FC<IDebug> = (props) => {

    return (
        <>
        {Object.entries(props.debugGroupSelection).map(([componentType, visible]) => {
            if (!visible) {return}
            switch (componentType) {
                case "element":
                    return ENGINE.handler.sequence.allPulseElements.map((e) => {
                        return <PaddedBoxDebug element={e}></PaddedBoxDebug>
                    })
                    break;
                case "pulse columns":
                    return <CollectionDebug element={ENGINE.handler.sequence.pulseColumns}></CollectionDebug>
                case "label column":
                    return <CollectionDebug element={ENGINE.handler.sequence.labelColumn}></CollectionDebug>
                case "channel":
                    return ENGINE.handler.sequence.channels.map((c) => {
                        return <PaddedBoxDebug element={c} contentColour={Colors.BLUE4}></PaddedBoxDebug>
                    })
                case "upper aligner":
                    return ENGINE.handler.sequence.channels.map((c) => {
                        return <PaddedBoxDebug element={c.topAligner} contentColour={Colors.VIOLET3}></PaddedBoxDebug>
                    })
                case "lower aligner":
                    return ENGINE.handler.sequence.channels.map((c) => {
                        return <PaddedBoxDebug element={c.bottomAligner} contentColour={Colors.GREEN5}></PaddedBoxDebug>
                    })
                case "sequence":
                    return <PaddedBoxDebug element={ENGINE.handler.sequence} contentColour={Colors.LIME2}></PaddedBoxDebug>
                    
                
            }
        })}
        </>
    )
}

export default Debug