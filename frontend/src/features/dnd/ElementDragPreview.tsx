import { Colors } from "@blueprintjs/core";
import type { FC } from "react";
import { memo, useEffect, useRef } from "react";
import Visual from "../../logic/visual";

export interface IElementDragPreviewProps {
	element: Visual;
	allElements?: Visual[];
}

interface ISingleElementPreviewProps {
	element: Visual;
	relX: number;
	relY: number;
}

const SingleElementPreview: FC<ISingleElementPreviewProps> = ({ element, relX, relY }) => {
	const visualRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (visualRef.current) {
			const rep = element.getInternalRepresentation()?.show();
			visualRef.current.replaceChildren();
			if (rep) {
				visualRef.current.appendChild(rep.node);
			}
		}
	}, [element]);

	return (
		<div
			style={{
				position: "absolute",
				left: relX,
				top: relY,
				width: element.drawWidth,
				height: element.drawHeight,
				pointerEvents: "none"
			}}
		>
			<svg
				ref={visualRef}
				style={{
					overflow: "visible",
					position: "absolute",
					top: element.padding[0],
					left: element.padding[3]
				}}
			/>
			<svg
				style={{
					width: element.drawContentWidth,
					height: element.drawContentHeight,
					position: "absolute",
					top: element.padding[0],
					left: element.padding[3],
					pointerEvents: "none"
				}}
			>
				<rect
					style={{
						stroke: `${Colors.BLUE3}`,
						width: "100%",
						height: "100%",
						strokeWidth: "1px",
						fill: `${Colors.BLUE5}`,
						fillOpacity: "10%",
						strokeDasharray: "1 1"
					}}
				/>
			</svg>
		</div>
	);
};

/* This is the custom drag preview. It is what you see while you are dragging. */
export const ElementDragPreview: FC<IElementDragPreviewProps> = memo(function ElementDragPreview(
	props: IElementDragPreviewProps
) {
	if (props.element === undefined) return null;

	const elements = (props.allElements && props.allElements.length > 0)
		? props.allElements
		: [props.element];

	const lead = props.element;

	return (
		<div
			style={{
				display: "block",
				zIndex: 15000,
				position: "relative",
				width: lead.drawWidth,
				height: lead.drawHeight
			}}
		>
			{elements.map((el) => {
				const relX = el.drawX - lead.drawX;
				const relY = el.drawY - lead.drawY;
				return (
					<SingleElementPreview
						key={el.id}
						element={el}
						relX={relX}
						relY={relY}
					/>
				);
			})}
		</div>
	);
});

