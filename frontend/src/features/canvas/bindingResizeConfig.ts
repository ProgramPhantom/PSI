import Visual from "../../logic/visual";
import LineLike from "../../logic/lineLike";
import RectElement from "../../logic/rectElement";
import { SiteNames } from "../../logic/spacial";
import { ISelectedBindingInfo } from "./BindingsSelector";

/**
 * Predicate function type to test if an element is allowed to show the BindingsSelector during resize.
 */
export type BindingResizeAllowedCheck = (element: Visual) => boolean;

/**
 * Predicate to identify annotation rects (non-pulse RectElements in free/binds mode).
 */
export const isAnnotationRect: BindingResizeAllowedCheck = (element: Visual): boolean => {
	return (
		(element.type === "rect" || element instanceof RectElement) &&
		element.pulseData === undefined &&
		element.pulseLayoutConfig === undefined &&
		(element.placementMode?.type === "free" || element.placementMode?.type === "binds")
	);
};

/**
 * Registry of classes or predicate functions that are allowed to show and establish bindings during resizing.
 * LineLike (Line, Arrow) and annotation rects are enabled.
 */
export const BINDING_ENABLED_RESIZING_ELEMENTS: Array<
	(abstract new (...args: any[]) => Visual) | BindingResizeAllowedCheck
> = [
	LineLike,
	isAnnotationRect
];

/**
 * Checks if the given resizing element is allowed to activate the BindingsSelector.
 *
 * @param element The visual element currently being resized.
 * @returns true if bindings should be enabled during its resize.
 */
export const isBindingAllowedForResizing = (element: Visual | undefined): boolean => {
	if (!element) return false;
	return BINDING_ENABLED_RESIZING_ELEMENTS.some((target) => {
		if (typeof target === "function") {
			if (target.prototype && target.prototype instanceof Visual) {
				return element instanceof (target as any);
			}
			return (target as BindingResizeAllowedCheck)(element);
		}
		return false;
	});
};

const ANCHOR_LOCATIONS: SiteNames[] = ["here", "centre", "far"];
const DEFAULT_SNAP_THRESHOLD_PX = 24;

export interface AnchorSnapResult {
	bindingInfo: ISelectedBindingInfo;
	key: string;
}

/**
 * Finds the closest binding anchor point on candidate anchor within maxDistancePx screen pixels.
 */
export function findClosestBindingAnchor(
	candidate: Visual | undefined,
	excludeElementId: string,
	targetPoint: { x: number; y: number },
	effectiveScale: number,
	maxDistancePx: number = DEFAULT_SNAP_THRESHOLD_PX
): AnchorSnapResult | null {
	if (
		!candidate ||
		candidate.id === excludeElementId ||
		candidate.type === "diagram" ||
		!candidate.AnchorFunctions
	) {
		return null;
	}

	let bestDist = Infinity;
	let bestResult: AnchorSnapResult | null = null;

	for (const xA of ANCHOR_LOCATIONS) {
		for (const yA of ANCHOR_LOCATIONS) {
			const sx = candidate.AnchorFunctions[xA]?.get("x", true);
			const sy = candidate.AnchorFunctions[yA]?.get("y", true);
			if (sx === undefined || sy === undefined) continue;

			const distPx = Math.hypot(targetPoint.x - sx, targetPoint.y - sy) * effectiveScale;
			if (distPx < bestDist) {
				bestDist = distPx;
				if (distPx <= maxDistancePx) {
					bestResult = {
						bindingInfo: {
							anchorObject: candidate,
							xAnchor: xA,
							yAnchor: yA,
							point: { x: sx, y: sy }
						},
						key: `${xA}-${yA}`
					};
				}
			}
		}
	}

	return bestResult;
}

export default isBindingAllowedForResizing;
