import { CSSProperties } from "react"
import PaddedBox, { IPaddedBox } from "../vanilla/paddedBox"
import Spacial, { Dimensions } from "../vanilla/spacial"
import SVGElement from "../vanilla/svgElement"
import Aligner from "../vanilla/aligner"
import PaddedBoxDebug, { IPaddedBoxDebug } from "./PaddedBox"
import Point from "../vanilla/point"
import { Icon } from "@blueprintjs/core"

interface IBindings {
    element: Spacial,
}

const BindingsDebug: React.FC<IBindings> = (props) => {
    return (
        <>
        {
        props.element.bindings.map((bind) => {
            var mainAxis = bind.bindingRule.dimension
            var crossAxis: Dimensions = mainAxis === "x" ? "y" : "x" ;
            
            var getter = props.element.AnchorFunctions[bind.bindingRule.anchorSiteName as keyof typeof props.element.AnchorFunctions].get;
            var bindAxisValue = getter(bind.bindingRule.dimension, bind.bindToContent) ?? 0;

            var crossAxisValue: number = 0;
            
            if (bind.targetObject instanceof Spacial) {
                crossAxisValue = (bind.targetObject as Spacial).getCentre(crossAxis) ?? 0;
            } 

            var coords: [number, number] = mainAxis === "x" ? [bindAxisValue, crossAxisValue] : [crossAxisValue, bindAxisValue]
            
            if (props.element instanceof SVGElement) {
                
            }

            return (<div style={{position: "absolute", left: coords[0], top: coords[1], fontSize: "5px",
                    margin: "0px", textAlign: "center", zIndex: 2000,
                    transform: `translate(-50%, -50%)` }} title={bind.hint}><Icon icon="plus" color="green" size={5}></Icon></div>)
        })           
        }
        {
            props.element.bindingsToThis.map((bind) => {
            var mainAxis = bind.bindingRule.dimension
            var crossAxis: Dimensions = mainAxis === "x" ? "y" : "x" ;
            
            var getter = props.element.AnchorFunctions[bind.bindingRule.anchorSiteName as keyof typeof props.element.AnchorFunctions].get;
            var bindAxisValue = getter(bind.bindingRule.dimension, bind.bindToContent) ?? 0;

            var crossAxisValue: number = 0;
            
            if (bind.targetObject instanceof Spacial) {
                crossAxisValue = (bind.targetObject as Spacial).getCentre(crossAxis) ?? 0;
            } 

            var coords: [number, number] = mainAxis === "x" ? [bindAxisValue, crossAxisValue] : [crossAxisValue, bindAxisValue]
            
            if (props.element instanceof SVGElement) {
                
            }

            return (<div style={{position: "absolute", left: coords[0], top: coords[1], fontSize: "5px",
                    margin: "0px", textAlign: "center", zIndex: 2000,
                    transform: `translate(-50%, -50%)` }} title={bind.hint}><Icon icon="selection-box-add" color="purple" size={5}></Icon></div>)
            })
        }
        </>
    )
}

export default BindingsDebug