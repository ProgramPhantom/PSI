import { useRef, useState } from "react";
import { SelectionMode } from "../../app/App"
import BindingsSelector from "./BindingsSelector";
import { Visual } from "../../logic/visual";
import { Dimensions, IBindingPayload } from "../../logic/spacial";
import ENGINE from "../../logic/engine";


interface IAnnotatorProps {
    hoveredElement: Visual | undefined;
}


export type PointBind = Record<Dimensions, IBindingPayload> 


export function DrawArrow(props: IAnnotatorProps) {
    const start = useRef<PointBind | undefined>(undefined);
    const end = useRef<PointBind | undefined>(undefined);

    const createArrow = (startBind: PointBind, endBind: PointBind) => {
        ENGINE.handler.createArrow(startBind, endBind);
    }

    function select(bindX: IBindingPayload, bindY: IBindingPayload) {
        if (start.current === undefined) {
            start.current = {"x": bindX, "y": bindY};

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