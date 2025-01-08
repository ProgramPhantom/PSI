import { CSSProperties } from "react"
import PaddedBox, { IPaddedBox } from "../vanilla/paddedBox"
import Spacial, { Dimensions } from "../vanilla/spacial"
import Positional from "../vanilla/positional"
import SVGElement from "../vanilla/svgElement"
import Aligner from "../vanilla/aligner"
import PaddedBoxDebug, { IPaddedBoxDebug } from "./PaddedBox"
import Point from "../vanilla/point"

interface IBindings {
    element: Spacial,
}

const BindingsDebug: React.FC<IBindings> = (props) => {
    return (
        <>
        {
            props.element.bindings.map((bind) => {
                var mainAxis = bind.bindingRule.dimension
                var crossAxis = mainAxis === Dimensions.X ? Dimensions.Y : Dimensions.X ;

                
                var getter = props.element.AnchorFunctions[bind.bindingRule.anchorSiteName as keyof typeof props.element.AnchorFunctions].get;
                var bindAxisValue = getter(bind.bindingRule.dimension, bind.bindToContent);

                var crossAxisValue: number = 0;
                
                if (bind.targetObject instanceof Spacial) {
                    crossAxisValue = (bind.targetObject as Spacial).getCentre(crossAxis);
                } 

                var coords: [number, number] = mainAxis === Dimensions.X ? [bindAxisValue, crossAxisValue] : [crossAxisValue, bindAxisValue]
                
                if (props.element instanceof SVGElement) {
                    console.log(`Coords: ${coords[0]}, ${coords[1]}`)
                }

                return (<div style={{position: "absolute", left: coords[0], top: coords[1], fontSize: "5px",
                     margin: "0px", textAlign: "center", 
                     transform: `translate(-50%, -50%)` }} title={bind.hint}>+</div>)
            })
        }
        </>
    )
}

export default BindingsDebug