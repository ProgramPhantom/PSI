import { Path } from "@svgdotjs/svg.js";
import { useEffect, useRef, useState } from "react";
import { ILine, ILineStyle } from "../../logic/line";
import ENGINE from "../../logic/engine";
import { Dimensions, IBindingPayload } from "../../logic/spacial";
import { Visual } from "../../logic/visual";
import BindingsSelector from "./BindingsSelector";
import { IToolConfig } from "../../app/App";



interface IDrawArrowProps {
    hoveredElement: Visual | undefined;
    config: IDrawArrowConfig
}

export interface IDrawArrowConfig extends IToolConfig {
    lineStyle: ILineStyle
}


export type PointBind = Record<Dimensions, IBindingPayload> 


export function DrawArrow(props: IDrawArrowProps) {
    const [startCoords, setStartCoords] = useState<[number, number] | undefined>(undefined)

    const start = useRef<PointBind | undefined>(undefined);
    const end = useRef<PointBind | undefined>(undefined);
    const [arrowIndicator, setArrowIndicator] = useState<Path | undefined>(undefined);
    const [previewPathSvg, setPreviewPathSvg] = useState<string | undefined>(undefined);
    const overlaySvgRef = useRef<SVGSVGElement | null>(null);


    const createArrow = (startBind: PointBind, endBind: PointBind) => {
        ENGINE.handler.createArrow({lineStyle: props.config.lineStyle}, startBind, endBind);
    }


    function selectBind(bindX: IBindingPayload, bindY: IBindingPayload) {
        if (start.current === undefined) {
            start.current = {"x": bindX, "y": bindY};
            var startX = bindX.anchorObject.getCoordinateFromBindRule(bindX.bindingRule);
            var startY = bindY.anchorObject.getCoordinateFromBindRule(bindY.bindingRule);
            setStartCoords([startX, startY]);
            
            const p = new Path().attr({
                strokeWidth: props.config.lineStyle.thickness,
                stroke: props.config.lineStyle.stroke,
                d: `M ${startX} ${startY} L ${startX} ${startY}`,
                "stroke-dasharray": `${props.config.lineStyle.dashing[0]} ${props.config.lineStyle.dashing[1]}`,
            });
            
            setArrowIndicator(p);
            setPreviewPathSvg(p.svg());
        } else {
            end.current = {"x": bindX, "y": bindY};
            
            if (start.current !== undefined) {
                createArrow(start.current, {"x": bindX, "y": bindY});
            }

            start.current = undefined;
            end.current = undefined;
            setStartCoords(undefined);
            setArrowIndicator(undefined);
            setPreviewPathSvg(undefined);
        }
    }


    useEffect(() => {
        if (!startCoords || !arrowIndicator) { return }

        const handleWindowMouseMove = (e: MouseEvent) => {
            const svg = overlaySvgRef.current;
            if (!svg) { return }

            const point: DOMPoint = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const ctm: DOMMatrix | null = svg.getScreenCTM();
            if (ctm) {
                const inv: DOMMatrix = ctm.inverse();
                const loc:DOMPoint = point.matrixTransform(inv);
                arrowIndicator.attr({ d: `M ${startCoords[0]} ${startCoords[1]} L ${loc.x} ${loc.y}` });
                setPreviewPathSvg(arrowIndicator.svg());
            } else {
                const rect: DOMRect = svg.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                arrowIndicator.attr({ d: `M ${startCoords[0]} ${startCoords[1]} L ${x} ${y}` });
                setPreviewPathSvg(arrowIndicator.svg());
            }
        }


        window.addEventListener('mousemove', handleWindowMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
        }
    }, [startCoords, arrowIndicator])

    return (
        <>
            {props.hoveredElement ? <BindingsSelector element={props.hoveredElement} selectBind={selectBind}></BindingsSelector> : <></>}
            
            {startCoords !== undefined && previewPathSvg !== undefined ? 
                <svg key="annotation-preview-layer"
                    ref={overlaySvgRef}
                    style={{position: "absolute", left: 0, top: 0, pointerEvents: "none"}} 
                    width={ENGINE.handler.diagram.width} 
                    height={ENGINE.handler.diagram.height}
                >
                    <g dangerouslySetInnerHTML={{ __html: previewPathSvg }} />
                </svg>
            : <></>}
        </>
    )
}