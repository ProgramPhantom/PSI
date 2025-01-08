import { CSSProperties } from "react"
import PaddedBox, { IPaddedBox } from "../vanilla/paddedBox"
import Spacial, { Dimensions } from "../vanilla/spacial"
import Positional from "../vanilla/positional"
import SVGElement from "../vanilla/svgElement"
import Aligner from "../vanilla/aligner"
import PaddedBoxDebug, { IPaddedBoxDebug } from "./PaddedBox"
import BindingsDebug from "./Bindings"

interface IAlignerDebug extends IPaddedBoxDebug {
    element: Aligner,
    headColour?: string
}

var globalStyle: CSSProperties = {
    position: "absolute",
    pointerEvents: "none"
}


const AlignerDebug: React.FC<IAlignerDebug> = (props) => {
    var childStyle: CSSProperties = {
        border: "dotted",
        strokeOpacity: 0.3,
        borderWidth: "1px",
        opacity: 0.4,
        fill: "none",

        ...globalStyle
    }

    var headStyle: CSSProperties = {
        ...childStyle,
        background: "none",
        opacity: 0.4
    }
    
    return (
        <>
        {props.element.children.map((c, i) => {
            var x1 = c.x;
            var y1 = c.y;
            var width = c.width;
            var height = c.height;

            if (i == 0) {
                return (
                    <>
                    <div style={{position: "absolute", left: x1, top: y1, fontSize: "3px",
                        margin: "0px", textAlign: "center"}}>{i}</div>
                    <div style={{left: x1, top: y1, width: width, height: height, ...headStyle}}></div>
                    </>
                )
            } else {
                return (
                    <>
                        <div style={{position: "absolute", left: x1, top: y1, fontSize: "3px",
                            margin: "0px", textAlign: "center"}}>{i}</div>
                        <div style={{left: x1, top: y1, width: width, height: height, ...childStyle}}></div>
                    </>
                )
            }
            
        })}
        {props.element.children.map((c) => {
            return <BindingsDebug element={c}></BindingsDebug>
        })}
        
        </>
    )
}

export default AlignerDebug