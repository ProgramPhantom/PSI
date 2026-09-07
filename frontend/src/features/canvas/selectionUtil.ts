import Spacial from "../../logic/spacial";
import Visual from "../../logic/visual";
import LineLike from "../../logic/lineLike";

/**
 * Checks whether an element is eligible for multi-selection.
 * Any selectable Visual element (excluding diagram, sequence-aligner, and sequence) is eligible.
 */
export function isEligibleForMultiSelect(element?: Spacial | null): element is Visual {
	if (!element || !(element instanceof Visual)) {
		return false;
	}
	if (element.type === "diagram" || element.type === "sequence-aligner" || element.type === "sequence") {
		return false;
	}
	return element.placementMode?.type === "free";
}

/**
 * Calculates the exact geometric center of an element in canvas coordinates.
 */
export function getElementCenter(element: Visual): { x: number; y: number } {
	if (element instanceof LineLike) {
		return {
			x: (element.startX + element.endX) / 2,
			y: (element.startY + element.endY) / 2
		};
	}
	const width = element.drawContentWidth > 0 ? element.drawContentWidth : (element.width || 0);
	const height = element.drawContentHeight > 0 ? element.drawContentHeight : (element.height || 0);
	return {
		x: element.drawCX + width / 2,
		y: element.drawCY + height / 2
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
