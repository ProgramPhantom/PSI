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
	var visual = props.element.getInternalRepresentation()!;
	const visualRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (visualRef.current) {
			visualRef.current.appendChild(visual.node);
		}
	}, [props.element]);

	return (
		<div style={{display: "inline-block", zIndex: 15000}} ref={visualRef}>
			<svg
				style={{
					width: props.element.contentWidth,
					height: props.element.contentHeight,
					position: "absolute",
					top: 0,
					left: 0
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
