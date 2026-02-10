import type { CSSProperties, FC } from "react";
import type { XYCoord } from "react-dnd";
import { useDragLayer } from "react-dnd";
import { CanvasDraggableElementPayload } from "./CanvasDraggableElement";
import { ElementDragPreview } from "./ElementDragPreview";
import { DragElementTypes } from "./CanvasDropContainer";

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
	scale: number
) {
	if (!initialOffset || !currentOffset) {
		// If not dragging don't show
		return {
			display: "none"
		};
	}

	let { x, y } = currentOffset;

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

	function renderItem() {
		return <ElementDragPreview element={item.element} />;
	}

	var css;

	if (itemType === DragElementTypes.ATOMIC_PREFAB) {
		css = getItemStyles(initialOffset, clientOffset, props.scale);
	} else {
		css = getItemStyles(initialOffset, currentOffset, props.scale);
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
