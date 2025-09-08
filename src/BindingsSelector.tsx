import { Colors } from "@blueprintjs/core";
import ENGINE from "./vanilla/engine";
import Spacial, { Dimensions, IBindingPayload, SiteNames } from "./vanilla/spacial";

interface IBindings {
    element: Spacial,

    selectedStart: PointBind | undefined
    selectedEnd: PointBind | undefined
    setStart: React.Dispatch<React.SetStateAction<PointBind | undefined>>
    setEnd: React.Dispatch<React.SetStateAction<PointBind | undefined>>
}

export type PointBind = Record<Dimensions, IBindingPayload> 

const AnchorLocations: SiteNames[] = ["here", "centre", "far"]

const BindingsSelector: React.FC<IBindings> = (props) => {

    function createArrow(startBind: PointBind, endBind: PointBind) {
        ENGINE.handler.createArrow(startBind, endBind);
    }

    function select(bindX: IBindingPayload, bindY: IBindingPayload) {
        if (props.selectedStart === undefined) {
            props.setStart({"x": bindX, "y": bindY});
            console.log("Set start");
        } else {
            props.setEnd({"x": bindX, "y": bindY});
            console.log("Set end");
            
            if (props.selectedStart !== undefined) {
                createArrow(props.selectedStart, {"x": bindX, "y": bindY});
            }

            props.setStart(undefined);
            props.setEnd(undefined);
        }
    }

    return (
        <>
        { AnchorLocations.map((xAnchor) => {
            return AnchorLocations.map((yAnchor) => {
                var x = props.element.AnchorFunctions[xAnchor].get("x");
                var y = props.element.AnchorFunctions[yAnchor].get("y");
                var bindingPayloadX: IBindingPayload = {
                    bindingRule: {
                        anchorSiteName: xAnchor,
                        targetSiteName: "here",
                        dimension: "x"
                    },
                    anchorObject: props.element
                }
                var bindingPayloadY: IBindingPayload = {
                    bindingRule: {
                        anchorSiteName: yAnchor,
                        targetSiteName: "here",
                        dimension: "y"
                    },
                    anchorObject: props.element
                }

                return (<div 
                        style={{position: "absolute", left: x, top: y, backgroundColor: Colors.BLUE5,
                        width: "2px", height: "2px",
                        transform: `translate(-50%, -50%)` }} 
                        onClick={(e) => {select(bindingPayloadX, bindingPayloadY)}} onMouseOver={(e) => e.stopPropagation()} >

                    
                    </div>)
            })
        })}
        </>
    )
}

export default BindingsSelector