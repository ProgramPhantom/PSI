import type { FC, ReactNode } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { PulseDropResultType } from "./PulseInsertArea";
import { GridDropResultType } from "./GridInsertArea";
import { LabelGroupDropResultType } from "./LabelGroupDropArea";
import { SnapStore } from "../../logic/snapping";
import { IPulseData } from "../../logic/pulseData";


export interface IDirectCanvasDropResult {
	x: number;
	y: number;
}
type CanvasDropResultType = { type: "canvas", data: IDirectCanvasDropResult }

export interface ISchemeDropResult {
	schemeId: string;
	filter?: string;
	pulseData?: IPulseData;
}
export type SchemeDropResultType = { type: "scheme", data: ISchemeDropResult };

export type AllDropResultTypes = CanvasDropResultType | PulseDropResultType | GridDropResultType | LabelGroupDropResultType | SchemeDropResultType

export const DragElementTypes = {
	ATOMIC_PREFAB: "prefab",
	SUBGRID: "subgrid",
	PULSE: "pulse",
	OTHER: "other",
	FREE: "free",
	FIXED: "fixed"
}


export interface ICanvasContainerProps {
	children: ReactNode[];
	scale: number;
	onFileDrop?: (file: File, coords: { x: number; y: number }) => void;
}

/* This is a drop target that covers the entire canvas for collecting drops that are intended
for movements of elements and dropping SVG files. */
export const CanvasDropContainer: FC<ICanvasContainerProps> = (props) => {
	const [, drop] = useDrop(
		() => ({
			accept: [DragElementTypes.PULSE, DragElementTypes.FREE, DragElementTypes.ATOMIC_PREFAB, NativeTypes.FILE],
			drop(item: any, monitor) {
				const itemType = monitor.getItemType();
				if (itemType === NativeTypes.FILE) {
					if (!props.onFileDrop) {
						return undefined;
					}

					const clientOffset = monitor.getClientOffset();
					const files: File[] = item?.files ? Array.from(item.files) : [];
					const svgFile = files.find(f => f.name?.toLowerCase().endsWith(".svg") || f.type === "image/svg+xml");
					if (!svgFile) {
						return undefined;
					}

					const drawDiv = document.getElementById("diagram-root") as HTMLElement;
					let relativeX = clientOffset ? clientOffset.x : 0;
					let relativeY = clientOffset ? clientOffset.y : 0;
					if (drawDiv && clientOffset) {
						const drawDivRect = drawDiv.getBoundingClientRect();
						relativeX = (clientOffset.x - drawDivRect.left) / props.scale;
						relativeY = (clientOffset.y - drawDivRect.top) / props.scale;
					}

					props.onFileDrop(svgFile, { x: relativeX, y: relativeY });
					return undefined;
				}

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
				const snapOffset = SnapStore.getActiveSnapOffset();
				const relativeX = (clientOffset.x - drawDivRect.left) / props.scale + snapOffset.dx;
				const relativeY = (clientOffset.y - drawDivRect.top) / props.scale + snapOffset.dy;
				SnapStore.clear();

				return { type: "canvas", data: { x: relativeX, y: relativeY } } as CanvasDropResultType;
			}
		}),
		[props.scale, props.onFileDrop]
	);

	return (
		<div
			ref={drop}
			style={{
				width: "100%",
				height: "100%",
				position: "relative"
			}}
			data-canvas-container
		>
			{props.children}
		</div>
	);
};
