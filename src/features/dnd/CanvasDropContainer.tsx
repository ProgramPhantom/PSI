import type { FC, ReactNode } from "react";
import { useDrop } from "react-dnd";
import { PulseDropResultType } from "./ChannelInsertArea";
import { GridDropResultType } from "./GridInsertArea";


export interface IDirectCanvasDropResult {
	x: number;
	y: number;
}
type CanvasDropResultType = {type: "canvas", data: IDirectCanvasDropResult}


export type AllDropResultTypes = CanvasDropResultType | PulseDropResultType | GridDropResultType

export const DragElementTypes = {
	ATOMIC_PREFAB: "prefab",
	SUBSEQUENCE: "sub-sequence",
	PULSE: "pulse",
	OTHER: "other",
	FREE: "free",
	FIXED: "fixed"
}


export interface ICanvasContainerProps {
	children: ReactNode[];
	scale: number;
}

/* This is a drop target that covers the entire canvas for collecting drops that are intended
for movements of elements. */
export const CanvasDropContainer: FC<ICanvasContainerProps> = (props) => {
	const [, drop] = useDrop(
		() => ({
			accept: [DragElementTypes.PULSE, DragElementTypes.FREE, DragElementTypes.ATOMIC_PREFAB],
			drop(item: IDirectCanvasDropResult, monitor) {
				// Allow drop to be handled by insertAreas
				const didDrop = monitor.didDrop();
				if (didDrop) {
					return undefined;
				}

				// Get the client offset (absolute position) where the drop occurred
				const clientOffset = monitor.getClientOffset();
				if (!clientOffset) {
					return { dropEffect: "move", x: 0, y: 0 };
				}

				// Get the drawDiv element which contains the actual image content
				const drawDiv = document.getElementById("diagram-root") as HTMLElement;
				if (!drawDiv) {
					return { dropEffect: "move", x: clientOffset.x, y: clientOffset.y };
				}

				const drawDivRect = drawDiv.getBoundingClientRect();

				// Calculate coordinates relative to the diagram root
				// The getBoundingClientRect() already accounts for transformations (scale, pan, etc.)
				// So we subtract the root's position and then divide by scale to get diagram coordinates
				const relativeX = (clientOffset.x - drawDivRect.left) / props.scale;
				const relativeY = (clientOffset.y - drawDivRect.top) / props.scale;

				return { type: "canvas", data: {x: relativeX, y: relativeY }} as CanvasDropResultType;
			}
		}),
		[props.scale]
	);

	return (
		<div ref={drop} style={{
			width: "100%",
			height: "100%",
			position: "relative"
		}} data-canvas-container>
			{props.children}
		</div>
	);
};
