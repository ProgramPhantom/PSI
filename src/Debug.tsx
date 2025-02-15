import { debug } from "console"
import Sequence from "./vanilla/sequence"
import SequenceHandler from "./vanilla/sequenceHandler"
import PaddedBoxDebug from "./debug/PaddedBox"
import CollectionDebug from "./debug/Collection"
import BindingsDebug from "./debug/Bindings"
import PaddedBox from "./vanilla/paddedBox"
import Labellable from "./vanilla/labellable"
import { Visual } from "./vanilla/visual"

interface IDebug {
    sequenceHandler: SequenceHandler
}

const Debug: React.FC<IDebug> = (props) => {
    var seq: Sequence = props.sequenceHandler.sequence
    

    return (
        <>
            {/*{
                seq.channels.map((c) => {
                    return (c.positionalElements.map((e) => {
                        return (<PaddedBoxDebug element={e.element} padColour="purple"></PaddedBoxDebug>)
                    }))
                })
            } 
            
            <PaddedBoxDebug element={seq} contentColour={"none"} padColour="yellow"></PaddedBoxDebug>
              
            <PaddedBoxDebug element={seq.channelColumn}></PaddedBoxDebug>
            
            <AlignerDebug element={seq.positionalColumns}></AlignerDebug>
            
            {
                seq.channels[0] ? (
                    
                    <PaddedBoxDebug element={seq.channels[0]}></PaddedBoxDebug>
                ) : <></>
            }*/}
        {/* <AlignerDebug element={seq.channels[0].upperAligner}></AlignerDebug> 

        
        <PaddedBoxDebug element={seq} contentColour="none"></PaddedBoxDebug>
        */}
            {
            seq.channels.map((c) => {
                return c.mountedElements.map((e) => {
                    return <>
                    <PaddedBoxDebug element={(e as Labellable<Visual>).parentElement} contentColour="yellow"></PaddedBoxDebug>
                    <PaddedBoxDebug element={(e as Labellable<Visual>).labelMap["top"]!} contentColour="purple" padColour="purple"></PaddedBoxDebug>
                    <PaddedBoxDebug element={e} contentColour="grey" padColour="purple"></PaddedBoxDebug></>
                    
                })
            })
            } 

            {/* <PaddedBoxDebug element={seq} contentColour="blue"></PaddedBoxDebug> */}

        </>
    )
}

export default Debug