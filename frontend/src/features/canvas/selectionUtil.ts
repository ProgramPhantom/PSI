import Spacial from "../../logic/spacial";
import Visual from "../../logic/visual";
import LineLike from "../../logic/lineLike";
import ENGINE from "../../logic/engine";

/**
 * Checks whether an element is eligible for multi-selection.
 * 
 * Requirements:
 * 1. Must be an instance of Visual.
 * 2. Cannot be structural containers like diagram, sequence-aligner, sequence, channel, subgrid.
 * 3. Must have a supported placement mode ("free", "binds", "sequenceBind").
 * 4. If currentSelection is non-empty, the candidate element MUST belong to the exact same
 *    parent container (same level / layer) as the elements in the active selection.
 */
export function isEligibleForMultiSelect(
	element?: Spacial | null,
	currentSelection?: Array<string | Visual>
): element is Visual {
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
	if (
		element.placementMode?.type !== "free" &&
		element.placementMode?.type !== "binds" &&
		element.placementMode?.type !== "sequenceBind"
	) {
		return false;
	}

	const diagramId = ENGINE.handler?.diagram?.id ?? "";
	const elementParentId = element.parentId || diagramId;

	if (currentSelection && currentSelection.length > 0) {
		const isAlreadySelected = currentSelection.some((item) =>
			typeof item === "string" ? item === element.id : item.id === element.id
		);
		if (isAlreadySelected) {
			return true;
		}

		let activeParentId: string | null = null;
		for (const item of currentSelection) {
			const selectedVisual = typeof item === "string" ? ENGINE.handler?.identifyElement(item) : item;
			if (selectedVisual) {
				activeParentId = selectedVisual.parentId || diagramId;
				break;
			}
		}

		if (activeParentId !== null && elementParentId !== activeParentId) {
			return false;
		}
	}

	return true;
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
