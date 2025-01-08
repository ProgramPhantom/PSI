import { debug } from "console"
import Sequence from "./vanilla/sequence"
import SequenceHandler from "./vanilla/sequenceHandler"
import PaddedBoxDebug from "./debug/PaddedBox"
import AlignerDebug from "./debug/Aligner"

interface IDebug {
    sequenceHandler: SequenceHandler
}

const Debug: React.FC<IDebug> = (props) => {
    var seq: Sequence = props.sequenceHandler.sequence
    console.log("rendering debug")

    return (
        <>
            {/*{
                seq.channels.map((c) => {
                    return (c.positionalElements.map((e) => {
                        return (<PaddedBoxDebug element={e.element}></PaddedBoxDebug>)
                    }))
                })
            } 
            <AlignerDebug element={seq.positionalColumns}></AlignerDebug>
            <PaddedBoxDebug element={seq} contentColour={"none"} padColour="yellow"></PaddedBoxDebug>
              
            <PaddedBoxDebug element={seq.channelColumn}></PaddedBoxDebug>
            
            <AlignerDebug element={seq.positionalColumns}></AlignerDebug>

            {
                seq.channels[0] ? (
                    <AlignerDebug element={seq.channels[0].upperAligner}></AlignerDebug>
                ) : <></>
            }*/}
            
        </>
    )
}

export default Debug