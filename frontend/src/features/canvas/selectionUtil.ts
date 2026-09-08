import Spacial from "../../logic/spacial";
import Visual from "../../logic/visual";
import LineLike from "../../logic/lineLike";

/**
 * Checks whether an element is eligible for multi-selection.
 * Any selectable Visual element (excluding container/structure types diagram, sequence-aligner, sequence, channel, and subgrid) is eligible.
 */
export function isEligibleForMultiSelect(element?: Spacial | null): element is Visual {
	if (!element || !(element instanceof Visual)) {
		return false;
	}
	if (
		element.type === "diagram" ||
		element.type === "sequence-aligner" ||
		element.type === "sequence" ||
		element.type === "channel" ||
		element.type === "subgrid"
	) {
		return false;
	}
	return element.placementMode?.type === "free" || element.placementMode.type === "binds" || element.placementMode.type === "sequenceBind";
}

/**
 * Calculates the exact geometric center of an element in canvas coordinates.
 */
export function getElementCenter(element: Visual): { x: number; y: number } {
	if (element instanceof LineLike) {
		const sx = element.startX ?? element.x ?? 0;
		const sy = element.startY ?? element.y ?? 0;
		const ex = element.endX ?? sx;
		const ey = element.endY ?? sy;
		return {
			x: (sx + ex) / 2,
			y: (sy + ey) / 2
		};
	}
	const width = element.drawContentWidth > 0 ? element.drawContentWidth : (element.width || 0);
	const height = element.drawContentHeight > 0 ? element.drawContentHeight : (element.height || 0);
	const cx = typeof element.drawCX === "number" && !isNaN(element.drawCX) ? element.drawCX : (element.x || 0);
	const cy = typeof element.drawCY === "number" && !isNaN(element.drawCY) ? element.drawCY : (element.y || 0);
	return {
		x: cx + width / 2,
		y: cy + height / 2
	};
}

export interface BoundingBox {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/**
 * Tests whether a point lies within a bounding box.
 */
export function isPointInBox(pt: { x: number; y: number }, box: BoundingBox): boolean {
	return pt.x >= box.minX && pt.x <= box.maxX && pt.y >= box.minY && pt.y <= box.maxY;
}
