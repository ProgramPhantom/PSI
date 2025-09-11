import { Colors } from "@blueprintjs/core"
import { AllElementIdentifiers } from "../../logic/diagramHandler"
import ENGINE from "../../logic/engine"
import { Visual } from "../../logic/visual"
import CollectionDebug from "./Collection"
import PaddedBoxDebug from "./PaddedBox"

interface IDebug {
    debugGroupSelection: Record<AllElementIdentifiers, boolean>;
    debugSelection: Visual[];
}

const Debug: React.FC<IDebug> = (props) => {

    return (
        <>
        {Object.entries(props.debugGroupSelection).map(([componentType, visible]) => {
            if (!visible) {return}
            switch (componentType) {
                case "element":
                    return ENGINE.handler.diagram.allPulseElements.map((e) => {
                        return <PaddedBoxDebug element={e}></PaddedBoxDebug>
                    })
                    break;
                case "pulse columns":
                    return <CollectionDebug element={ENGINE.handler.diagram.sequences[0].pulseColumns}></CollectionDebug>
                case "label column":
                    return <CollectionDebug element={ENGINE.handler.diagram.sequences[0].labelColumn}></CollectionDebug>
                case "channel":
                    return ENGINE.handler.diagram.channels.map((c) => {
                        return <PaddedBoxDebug element={c} contentColour={Colors.BLUE4}></PaddedBoxDebug>
                    })
                case "upper aligner":
                    return ENGINE.handler.diagram.channels.map((c) => {
                        return <PaddedBoxDebug element={c.topAligner} contentColour={Colors.VIOLET3}></PaddedBoxDebug>
                    })
                case "lower aligner":
                    return ENGINE.handler.diagram.channels.map((c) => {
                        return <PaddedBoxDebug element={c.bottomAligner} contentColour={Colors.GREEN5}></PaddedBoxDebug>
                    })
                case "sequence":
                    return ENGINE.handler.sequences.map((s) => {
                        return <PaddedBoxDebug element={s} contentColour={Colors.LIME2}></PaddedBoxDebug>
                    })
                case "diagram":
                    return <PaddedBoxDebug element={ENGINE.handler.diagram} contentColour={Colors.CERULEAN1}></PaddedBoxDebug>
                
            }
        })}
        </>
    )
}

export default Debug