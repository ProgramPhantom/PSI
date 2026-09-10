import { useEffect, type CSSProperties, type FC } from "react";
import type { XYCoord } from "react-dnd";
import { useDragLayer } from "react-dnd";
import { CanvasDraggableElementPayload } from "./CanvasDraggableElement";
import { ElementDragPreview } from "./ElementDragPreview";
import { DragElementTypes } from "./CanvasDropContainer";
import { snapBox, SnapStore } from "../../logic/snapping";

const layerStyles: CSSProperties = {
	position: "fixed",
	pointerEvents: "none",
	zIndex: 100,
	left: 0,
	top: 0,
	width: "100%",
	height: "100%"
};

function getItemStyles(
	initialOffset: XYCoord | null,
	currentOffset: XYCoord | null,
	scale: number,
	snapOffset: { dx: number; dy: number } = { dx: 0, dy: 0 }
) {
	if (!initialOffset || !currentOffset) {
		// If not dragging don't show
		return {
			display: "none"
		};
	}

	const x = currentOffset.x + snapOffset.dx * scale;
	const y = currentOffset.y + snapOffset.dy * scale;

	const transform = `translate(${x}px, ${y}px) `;
	const s = `scale(${scale})`;
	return {
		transform: transform + s,
		WebkitTransform: transform + s
	};
}

export interface CustomDragLayerProps {
	scale: number;
}

// Custom drag layer (for displaying drag preview)
export const CanvasDragLayer: FC<CustomDragLayerProps> = (props) => {
	const { itemType, isDragging, item, initialOffset, currentOffset, clientOffset } = useDragLayer((monitor) => ({
		item: monitor.getItem() as CanvasDraggableElementPayload,
		itemType: monitor.getItemType(),
		initialOffset: monitor.getInitialSourceClientOffset(),
		currentOffset: monitor.getSourceClientOffset(),
		clientOffset: monitor.getClientOffset(),
		isDragging: monitor.isDragging()
	}));

	useEffect(() => {
		if (!isDragging) {
			SnapStore.clear();
		}
	}, [isDragging]);

	useEffect(() => {
		return () => {
			SnapStore.clear();
		};
	}, []);

	let snapOffset = { dx: 0, dy: 0 };
	if (isDragging && item?.element) {
		const drawDiv = document.getElementById("diagram-root") as HTMLElement | null;
		if (drawDiv) {
			const drawDivRect = drawDiv.getBoundingClientRect();
			const activeOffset = itemType === DragElementTypes.ATOMIC_PREFAB ? clientOffset : currentOffset;
			if (activeOffset) {
				const elemX = (activeOffset.x - drawDivRect.left) / props.scale;
				const elemY = (activeOffset.y - drawDivRect.top) / props.scale;
				const elemWidth = item.element.drawWidth || item.element.width || item.element.contentWidth || 20;
				const elemHeight = item.element.drawHeight || item.element.height || item.element.contentHeight || 20;

				const res = snapBox({
					left: elemX,
					top: elemY,
					width: elemWidth,
					height: elemHeight,
					element: item.element,
					scale: props.scale
				});

				snapOffset = { dx: res.dx, dy: res.dy };
				SnapStore.setGuides(res.guides, snapOffset);
			}
		}
	}

	function renderItem() {
		return <ElementDragPreview element={item.element} allElements={item.allElements} />;
	}

	let css;
	if (itemType === DragElementTypes.ATOMIC_PREFAB) {
		css = getItemStyles(initialOffset, clientOffset, props.scale, snapOffset);
	} else {
		css = getItemStyles(initialOffset, currentOffset, props.scale, snapOffset);
	}

	if (!isDragging) {
		return null;
	}
	return (
		<div style={layerStyles}>
			<div style={{ ...css, transformOrigin: "top left" }}>{renderItem()}</div>
		</div>
	);
};

