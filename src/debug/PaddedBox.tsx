import { CSSProperties } from "react"
import PaddedBox, { IPaddedBox } from "../vanilla/paddedBox"

interface IPaddedBoxDebug {
    element: PaddedBox
}

var globalStyle: CSSProperties = {
    position: "absolute",
    pointerEvents: "none"
}

const PaddedBoxDebug: React.FC<IPaddedBoxDebug> = (props) => {
    var paddingStyle: CSSProperties = {
        background: "orange",
        opacity: 0.5,

        ...globalStyle
    }

    var contentStyle: CSSProperties =  {
        background: "red",
        opacity: 0.7,

        ...globalStyle
    }

    var boundaryStyle: CSSProperties = {
        border: "dashed",
        strokeOpacity: 1,
        borderWidth: "1px",
        opacity: 0.4,
        fill: "none",
        ...globalStyle
    }

    var x1 = props.element.x;
    var y1 = props.element.y;
    var cx = props.element.contentX;
    var cy = props.element.contentY;

    var width = props.element.width;
    var height = props.element.height;

    var contentWidth = props.element.contentWidth !== undefined ? props.element.contentWidth : 0;
    var contentHeight = props.element.contentHeight !== undefined ? props.element.contentHeight : 0;

    var padding = props.element.padding

    
    return (
        <>
            {/* Padding top */}
            <div style={{left: x1, top: y1, width: width, height: padding[0], ...paddingStyle}}></div>

            {/* Content */}
            <div style={{left: cx, top: cy, width: contentWidth, height: contentHeight, ...contentStyle}}></div>

            {/* Padding Left */}
            <div style={{left: x1, top: cy, width: padding[3], height: contentHeight, ...paddingStyle}}></div>

            {/* Padding Right */}
            <div style={{left: cx + contentWidth, top: cy, width: padding[1], height: contentHeight, ...paddingStyle}}></div>

            {/* Padding Bottom */}
            <div style={{left: x1, top: cy + contentHeight, width: width, height: padding[2], ...paddingStyle}}></div>

            {/* Boundary 
           <div style={{left: x1, top: y1, width: width, height: height, ...boundaryStyle}}></div>*/}
        </>
    )
}

export default PaddedBoxDebug