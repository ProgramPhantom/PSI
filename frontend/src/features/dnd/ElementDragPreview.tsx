import { Colors } from "@blueprintjs/core";
import type { FC } from "react";
import { memo, useEffect, useRef } from "react";
import Visual from "../../logic/visual";

export interface IElementDragPreviewProps {
	element: Visual;
}

/* This is the custom drag preview. It is what you see while you are dragging. */
export const ElementDragPreview: FC<IElementDragPreviewProps> = memo(function ElementDragPreview(
	props: IElementDragPreviewProps
) {
	if (props.element === undefined) return null;
	var visual = props.element.getInternalRepresentation()!.show();
	const visualRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (visualRef.current) {
			visualRef.current.replaceChildren();
			visualRef.current.appendChild(visual.node);
		}
	}, [props.element]);

	return (
		<div style={{
			display: "block",
			zIndex: 15000,
			position: "relative",
			width: props.element.width,
			height: props.element.height
		}}>
			<svg ref={visualRef} style={{ overflow: "visible", position: "absolute", top: props.element.padding[0], left: props.element.padding[3] }}></svg>
			<svg
				style={{
					width: props.element.drawWidth,
					height: props.element.drawHeight,
					position: "absolute",
					top: props.element.padding[0],
					left: props.element.padding[3],
					pointerEvents: "none"
				}}>
				<rect
					style={{
						stroke: `${Colors.BLUE3}`,
						width: "100%",
						height: "100%",
						strokeWidth: "1px",
						fill: `${Colors.BLUE5}`,
						fillOpacity: "10%",
						strokeDasharray: "1 1"
					}}></rect>
			</svg>
		</div>
	);
});
