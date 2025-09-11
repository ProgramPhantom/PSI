import { useRef, useState } from "react";
import { SelectionMode } from "../../app/App"
import BindingsSelector from "./BindingsSelector";
import { Visual } from "../../logic/visual";
import { Dimensions, IBindingPayload } from "../../logic/spacial";
import ENGINE from "../../logic/engine";
import { Path } from "@svgdotjs/svg.js";


interface IAnnotatorProps {
    hoveredElement: Visual | undefined;
}


export type PointBind = Record<Dimensions, IBindingPayload> 


export function DrawArrow(props: IAnnotatorProps) {
    const [startCoords, setStartCoords] = useState<[number, number] | undefined>(undefined)

    const start = useRef<PointBind | undefined>(undefined);
    const end = useRef<PointBind | undefined>(undefined);

    const arrowIndicator = useState<Path | undefined>();

    const createArrow = (startBind: PointBind, endBind: PointBind) => {
        ENGINE.handler.createArrow(startBind, endBind);
    }

    function select(bindX: IBindingPayload, bindY: IBindingPayload) {
        if (start.current === undefined) {
            start.current = {"x": bindX, "y": bindY};
            var startX = bindX.anchorObject.getCoordinateFromBindRule(bindX.bindingRule);
            var startY = bindY.anchorObject.getCoordinateFromBindRule(bindY.bindingRule);
            setStartCoords([startX, startY]);
        } else {
            end.current = {"x": bindX, "y": bindY};
            
            if (start.current !== undefined) {
                createArrow(start.current, {"x": bindX, "y": bindY});
            }

            start.current = undefined;
            end.current = undefined;
        }
    }

    return (
        <>
            {props.hoveredElement ? <BindingsSelector element={props.hoveredElement} selectBind={select}></BindingsSelector> : <></>}
        </>
    )
}