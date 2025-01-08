import { debug } from "console"
import Sequence from "./vanilla/sequence"
import SequenceHandler from "./vanilla/sequenceHandler"
import PaddedBoxDebug from "./debug/PaddedBox"

interface IDebug {
    sequenceHandler: SequenceHandler
}

const Debug: React.FC<IDebug> = (props) => {
    var seq: Sequence = props.sequenceHandler.sequence
    console.log("rendering debug")

    return (
        <>
        
        {
            seq.channels.map((c) => {
                return (c.positionalElements.map((e) => {
                    return (<PaddedBoxDebug element={e.element}></PaddedBoxDebug>)
                }))
            })
        }
        </>
    )
}

export default Debug