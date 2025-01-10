import { debug } from "console"
import Sequence from "./vanilla/sequence"
import SequenceHandler from "./vanilla/sequenceHandler"
import PaddedBoxDebug from "./debug/PaddedBox"
import CollectionDebug from "./debug/Collection"
import BindingsDebug from "./debug/Bindings"
import PaddedBox from "./vanilla/paddedBox"

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
                        return (<PaddedBoxDebug element={e.element} padColour="purple"></PaddedBoxDebug>)
                    }))
                })
            } 
            {/*
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
        
        {
            seq.channels[0] ? (
                <>
                <PaddedBoxDebug element={seq.channels[0]} contentColour="green" padColour="yellow"></PaddedBoxDebug> 
                <PaddedBoxDebug element={seq.channels[0].upperAligner} contentColour="red" ></PaddedBoxDebug>
                <PaddedBoxDebug element={seq.channels[0].lowerAligner} contentColour="red" ></PaddedBoxDebug>

                
                </>
            ) : <></>
            } */}

        <CollectionDebug element={seq.positionalColumns}></CollectionDebug>
        </>
    )
}

export default Debug