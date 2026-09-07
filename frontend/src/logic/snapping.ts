import ENGINE from "./engine";
import Visual from "./visual";

export interface SnapGuide {
	id: string;
	orientation: "vertical" | "horizontal";
	position: number; // x for vertical, y for horizontal
	start: number;    // y1 for vertical, x1 for horizontal
	end: number;      // y2 for vertical, x2 for horizontal
	targetId?: string;
}

export interface SnapOffset {
	dx: number;
	dy: number;
}

export interface SnapBoxResult {
	snappedX: number;
	snappedY: number;
	dx: number;
	dy: number;
	guides: SnapGuide[];
}

export interface SnapResizeBoxResult {
	left: number;
	top: number;
	width: number;
	height: number;
	guides: SnapGuide[];
}

export interface SnapPointResult {
	x: number;
	y: number;
	dx: number;
	dy: number;
	guides: SnapGuide[];
}

export class SnapStore {
	private static guides: SnapGuide[] = [];
	private static activeSnapOffset: SnapOffset = { dx: 0, dy: 0 };
	private static listeners: Set<() => void> = new Set();

	public static getGuides(): SnapGuide[] {
		return SnapStore.guides;
	}

	public static getActiveSnapOffset(): SnapOffset {
		return SnapStore.activeSnapOffset;
	}

	public static setGuides(guides: SnapGuide[], offset: SnapOffset = { dx: 0, dy: 0 }): void {
		SnapStore.guides = guides;
		SnapStore.activeSnapOffset = offset;
		SnapStore.notify();
	}

	public static clear(): void {
		if (SnapStore.guides.length > 0 || SnapStore.activeSnapOffset.dx !== 0 || SnapStore.activeSnapOffset.dy !== 0) {
			SnapStore.guides = [];
			SnapStore.activeSnapOffset = { dx: 0, dy: 0 };
			SnapStore.notify();
		}
	}

	public static subscribe(listener: () => void): () => void {
		SnapStore.listeners.add(listener);
		return () => {
			SnapStore.listeners.delete(listener);
		};
	}

	private static notify(): void {
		SnapStore.listeners.forEach((listener) => listener());
	}
}

/**
 * Returns a Set of IDs to exclude from snapping (the element itself and all its descendants).
 */
export function getElementExclusionIds(element?: Visual | string): Set<string> {
	const ids = new Set<string>();
	if (!element) return ids;

	const visual = typeof element === "string" ? ENGINE.handler.identifyElement(element) : element;
	if (!visual) {
		if (typeof element === "string") ids.add(element);
		return ids;
	}

	ids.add(visual.id);
	if (visual.allElements) {
		for (const id of Object.keys(visual.allElements)) {
			ids.add(id);
		}
	}
	return ids;
}

interface InternalTargetCandidate {
	id: string;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	left: number;
	centerX: number;
	right: number;
	top: number;
	centerY: number;
	bottom: number;
}

/**
 * Helper to query candidate target elements from the R-tree within a given coordinate band.
 */
function queryRTreeTargets(
	minX: number,
	maxX: number,
	minY: number,
	maxY: number,
	excludeIds: Set<string>
): InternalTargetCandidate[] {
	const rTree = ENGINE.handler?.visualRTree;
	if (!rTree) return [];

	const diagramId = ENGINE.handler.diagram?.id;
	const searchResults = rTree.search({ minX, maxX, minY, maxY });

	const targets: InternalTargetCandidate[] = [];
	for (const item of searchResults) {
		if (item.id === diagramId) continue;
		if (excludeIds.has(item.id)) continue;
		if (item.maxX - item.minX <= 0.5 && item.maxY - item.minY <= 0.5) continue;

		targets.push({
			id: item.id,
			minX: item.minX,
			minY: item.minY,
			maxX: item.maxX,
			maxY: item.maxY,
			left: item.minX,
			centerX: (item.minX + item.maxX) / 2,
			right: item.maxX,
			top: item.minY,
			centerY: (item.minY + item.maxY) / 2,
			bottom: item.maxY
		});
	}

	return targets;
}

export interface SnapBoxParams {
	left: number;
	top: number;
	width: number;
	height: number;
	element?: Visual | string;
	excludeIds?: Set<string>;
	scale?: number;
	thresholdPixels?: number;
}

/**
 * Snaps a 2D moving box (left, center, right, top, center, bottom) against all other elements
 * in the R-tree index. Used for dragging canvas elements and template prefabs.
 */
export function snapBox(params: SnapBoxParams): SnapBoxResult {
	const { left, top, width, height, element, scale = 1, thresholdPixels = 6 } = params;
	const effectiveScale = scale > 0 ? scale : 1;
	const threshold = Math.max(1, thresholdPixels / effectiveScale);

	const excludeIds = params.excludeIds ?? getElementExclusionIds(element);

	const boxRight = left + width;
	const boxBottom = top + height;
	const boxCenterX = left + width / 2;
	const boxCenterY = top + height / 2;

	const guides: SnapGuide[] = [];
	let snappedDx = 0;
	let snappedDy = 0;

	// --- X Axis Snapping ---
	const xCandidates = [
		{ value: left, name: "left" },
		{ value: boxCenterX, name: "center" },
		{ value: boxRight, name: "right" }
	];
	const minXSearch = left - threshold;
	const maxXSearch = boxRight + threshold;

	const xTargets = queryRTreeTargets(minXSearch, maxXSearch, -1e7, 1e7, excludeIds);

	let bestDiffX: number | null = null;
	let bestSnapXTarget: number | null = null;
	let alignedTargetsX: InternalTargetCandidate[] = [];

	for (const candidate of xCandidates) {
		for (const target of xTargets) {
			const targetPositions = [target.left, target.centerX, target.right];
			for (const tPos of targetPositions) {
				const diff = tPos - candidate.value;
				if (Math.abs(diff) <= threshold) {
					if (bestDiffX === null || Math.abs(diff) < Math.abs(bestDiffX)) {
						bestDiffX = diff;
						bestSnapXTarget = tPos;
						alignedTargetsX = [target];
					} else if (bestDiffX !== null && Math.abs(diff - bestDiffX) < 0.001) {
						if (!alignedTargetsX.some((t) => t.id === target.id)) {
							alignedTargetsX.push(target);
						}
					}
				}
			}
		}
	}

	if (bestDiffX !== null && bestSnapXTarget !== null) {
		snappedDx = bestDiffX;
		const lineY1 = Math.min(top, ...alignedTargetsX.map((t) => t.minY)) - 4;
		const lineY2 = Math.max(boxBottom, ...alignedTargetsX.map((t) => t.maxY)) + 4;

		guides.push({
			id: `guide-x-${Math.round(bestSnapXTarget)}`,
			orientation: "vertical",
			position: Math.round(bestSnapXTarget),
			start: lineY1,
			end: lineY2,
			targetId: alignedTargetsX[0]?.id
		});
	}

	// --- Y Axis Snapping ---
	const yCandidates = [
		{ value: top, name: "top" },
		{ value: boxCenterY, name: "center" },
		{ value: boxBottom, name: "bottom" }
	];
	const minYSearch = top - threshold;
	const maxYSearch = boxBottom + threshold;

	const yTargets = queryRTreeTargets(-1e7, 1e7, minYSearch, maxYSearch, excludeIds);

	let bestDiffY: number | null = null;
	let bestSnapYTarget: number | null = null;
	let alignedTargetsY: InternalTargetCandidate[] = [];

	for (const candidate of yCandidates) {
		for (const target of yTargets) {
			const targetPositions = [target.top, target.centerY, target.bottom];
			for (const tPos of targetPositions) {
				const diff = tPos - candidate.value;
				if (Math.abs(diff) <= threshold) {
					if (bestDiffY === null || Math.abs(diff) < Math.abs(bestDiffY)) {
						bestDiffY = diff;
						bestSnapYTarget = tPos;
						alignedTargetsY = [target];
					} else if (bestDiffY !== null && Math.abs(diff - bestDiffY) < 0.001) {
						if (!alignedTargetsY.some((t) => t.id === target.id)) {
							alignedTargetsY.push(target);
						}
					}
				}
			}
		}
	}

	if (bestDiffY !== null && bestSnapYTarget !== null) {
		snappedDy = bestDiffY;
		const lineX1 = Math.min(left + snappedDx, ...alignedTargetsY.map((t) => t.minX)) - 4;
		const lineX2 = Math.max(boxRight + snappedDx, ...alignedTargetsY.map((t) => t.maxX)) + 4;

		guides.push({
			id: `guide-y-${Math.round(bestSnapYTarget)}`,
			orientation: "horizontal",
			position: Math.round(bestSnapYTarget),
			start: lineX1,
			end: lineX2,
			targetId: alignedTargetsY[0]?.id
		});
	}

	return {
		snappedX: Math.round(left + snappedDx),
		snappedY: Math.round(top + snappedDy),
		dx: snappedDx,
		dy: snappedDy,
		guides
	};
}

export type ResizeHandleDirection = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface SnapResizeBoxParams {
	direction: ResizeHandleDirection;
	box: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	minWidth?: number;
	minHeight?: number;
	element?: Visual | string;
	excludeIds?: Set<string>;
	scale?: number;
	thresholdPixels?: number;
}

/**
 * Snaps resizing geometry according to the active handle direction.
 */
export function snapResizeBox(params: SnapResizeBoxParams): SnapResizeBoxResult {
	const { direction, box, minWidth = 5, minHeight = 5, element, scale = 1, thresholdPixels = 6 } = params;
	const effectiveScale = scale > 0 ? scale : 1;
	const threshold = Math.max(1, thresholdPixels / effectiveScale);
	const excludeIds = params.excludeIds ?? getElementExclusionIds(element);

	let { left, top, width, height } = box;
	let right = left + width;
	let bottom = top + height;

	const guides: SnapGuide[] = [];

	const movesLeft = direction === "w" || direction === "nw" || direction === "sw";
	const movesRight = direction === "e" || direction === "ne" || direction === "se";
	const movesTop = direction === "n" || direction === "nw" || direction === "ne";
	const movesBottom = direction === "s" || direction === "sw" || direction === "se";

	// Handle X snapping
	if (movesLeft || movesRight) {
		const candidateX = movesLeft ? left : right;
		const targets = queryRTreeTargets(candidateX - threshold, candidateX + threshold, -1e7, 1e7, excludeIds);

		let bestDiff: number | null = null;
		let bestTargetPos: number | null = null;
		let alignedTargets: InternalTargetCandidate[] = [];

		for (const target of targets) {
			const positions = [target.left, target.centerX, target.right];
			for (const tPos of positions) {
				const diff = tPos - candidateX;
				if (Math.abs(diff) <= threshold) {
					if (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff)) {
						bestDiff = diff;
						bestTargetPos = tPos;
						alignedTargets = [target];
					} else if (bestDiff !== null && Math.abs(diff - bestDiff) < 0.001) {
						if (!alignedTargets.some((t) => t.id === target.id)) {
							alignedTargets.push(target);
						}
					}
				}
			}
		}

		if (bestDiff !== null && bestTargetPos !== null) {
			const snappedCoord = Math.round(bestTargetPos);
			if (movesLeft) {
				const newWidth = Math.max(minWidth, right - snappedCoord);
				left = right - newWidth;
				width = newWidth;
			} else {
				width = Math.max(minWidth, snappedCoord - left);
				right = left + width;
			}

			const lineY1 = Math.min(top, ...alignedTargets.map((t) => t.minY)) - 4;
			const lineY2 = Math.max(bottom, ...alignedTargets.map((t) => t.maxY)) + 4;

			guides.push({
				id: `guide-x-${snappedCoord}`,
				orientation: "vertical",
				position: snappedCoord,
				start: lineY1,
				end: lineY2,
				targetId: alignedTargets[0]?.id
			});
		}
	}

	// Handle Y snapping
	if (movesTop || movesBottom) {
		const candidateY = movesTop ? top : bottom;
		const targets = queryRTreeTargets(-1e7, 1e7, candidateY - threshold, candidateY + threshold, excludeIds);

		let bestDiff: number | null = null;
		let bestTargetPos: number | null = null;
		let alignedTargets: InternalTargetCandidate[] = [];

		for (const target of targets) {
			const positions = [target.top, target.centerY, target.bottom];
			for (const tPos of positions) {
				const diff = tPos - candidateY;
				if (Math.abs(diff) <= threshold) {
					if (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff)) {
						bestDiff = diff;
						bestTargetPos = tPos;
						alignedTargets = [target];
					} else if (bestDiff !== null && Math.abs(diff - bestDiff) < 0.001) {
						if (!alignedTargets.some((t) => t.id === target.id)) {
							alignedTargets.push(target);
						}
					}
				}
			}
		}

		if (bestDiff !== null && bestTargetPos !== null) {
			const snappedCoord = Math.round(bestTargetPos);
			if (movesTop) {
				const newHeight = Math.max(minHeight, bottom - snappedCoord);
				top = bottom - newHeight;
				height = newHeight;
			} else {
				height = Math.max(minHeight, snappedCoord - top);
				bottom = top + height;
			}

			const lineX1 = Math.min(left, ...alignedTargets.map((t) => t.minX)) - 4;
			const lineX2 = Math.max(left + width, ...alignedTargets.map((t) => t.maxX)) + 4;

			guides.push({
				id: `guide-y-${snappedCoord}`,
				orientation: "horizontal",
				position: snappedCoord,
				start: lineX1,
				end: lineX2,
				targetId: alignedTargets[0]?.id
			});
		}
	}

	return {
		left: Math.round(left),
		top: Math.round(top),
		width: Math.round(width),
		height: Math.round(height),
		guides
	};
}

export interface SnapPointParams {
	point: { x: number; y: number };
	element?: Visual | string;
	excludeIds?: Set<string>;
	scale?: number;
	thresholdPixels?: number;
}

/**
 * Snaps a 1D/2D point (e.g., line endpoints) to other elements' edges or centers.
 */
export function snapPoint(params: SnapPointParams): SnapPointResult {
	const { point, element, scale = 1, thresholdPixels = 6 } = params;
	const effectiveScale = scale > 0 ? scale : 1;
	const threshold = Math.max(1, thresholdPixels / effectiveScale);
	const excludeIds = params.excludeIds ?? getElementExclusionIds(element);

	let snappedX = point.x;
	let snappedY = point.y;
	let dx = 0;
	let dy = 0;
	const guides: SnapGuide[] = [];

	// X Snapping
	const xTargets = queryRTreeTargets(point.x - threshold, point.x + threshold, -1e7, 1e7, excludeIds);
	let bestDiffX: number | null = null;
	let bestSnapXTarget: number | null = null;
	let alignedTargetsX: InternalTargetCandidate[] = [];

	for (const target of xTargets) {
		const positions = [target.left, target.centerX, target.right];
		for (const tPos of positions) {
			const diff = tPos - point.x;
			if (Math.abs(diff) <= threshold) {
				if (bestDiffX === null || Math.abs(diff) < Math.abs(bestDiffX)) {
					bestDiffX = diff;
					bestSnapXTarget = tPos;
					alignedTargetsX = [target];
				} else if (bestDiffX !== null && Math.abs(diff - bestDiffX) < 0.001) {
					if (!alignedTargetsX.some((t) => t.id === target.id)) {
						alignedTargetsX.push(target);
					}
				}
			}
		}
	}

	if (bestDiffX !== null && bestSnapXTarget !== null) {
		dx = bestDiffX;
		snappedX = Math.round(bestSnapXTarget);
		const lineY1 = Math.min(point.y, ...alignedTargetsX.map((t) => t.minY)) - 4;
		const lineY2 = Math.max(point.y, ...alignedTargetsX.map((t) => t.maxY)) + 4;

		guides.push({
			id: `guide-x-${snappedX}`,
			orientation: "vertical",
			position: snappedX,
			start: lineY1,
			end: lineY2,
			targetId: alignedTargetsX[0]?.id
		});
	}

	// Y Snapping
	const yTargets = queryRTreeTargets(-1e7, 1e7, point.y - threshold, point.y + threshold, excludeIds);
	let bestDiffY: number | null = null;
	let bestSnapYTarget: number | null = null;
	let alignedTargetsY: InternalTargetCandidate[] = [];

	for (const target of yTargets) {
		const positions = [target.top, target.centerY, target.bottom];
		for (const tPos of positions) {
			const diff = tPos - point.y;
			if (Math.abs(diff) <= threshold) {
				if (bestDiffY === null || Math.abs(diff) < Math.abs(bestDiffY)) {
					bestDiffY = diff;
					bestSnapYTarget = tPos;
					alignedTargetsY = [target];
				} else if (bestDiffY !== null && Math.abs(diff - bestDiffY) < 0.001) {
					if (!alignedTargetsY.some((t) => t.id === target.id)) {
						alignedTargetsY.push(target);
					}
				}
			}
		}
	}

	if (bestDiffY !== null && bestSnapYTarget !== null) {
		dy = bestDiffY;
		snappedY = Math.round(bestSnapYTarget);
		const lineX1 = Math.min(snappedX, ...alignedTargetsY.map((t) => t.minX)) - 4;
		const lineX2 = Math.max(snappedX, ...alignedTargetsY.map((t) => t.maxX)) + 4;

		guides.push({
			id: `guide-y-${snappedY}`,
			orientation: "horizontal",
			position: snappedY,
			start: lineX1,
			end: lineX2,
			targetId: alignedTargetsY[0]?.id
		});
	}

	return {
		x: Math.round(snappedX),
		y: Math.round(snappedY),
		dx,
		dy,
		guides
	};
}
