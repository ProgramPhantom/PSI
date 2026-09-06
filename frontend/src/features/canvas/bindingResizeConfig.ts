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
	return BINDING_ENABLED_RESIZING_ELEMENTS.some((target) => matchesDescriptor(element, target));
};

/**
 * Predicate function type to test if a candidate target element is allowed to receive bindings.
 */
export type BindingTargetAllowedCheck = (target: Visual) => boolean;

/**
 * Predicate to check if an element is itself bound.
 * Any element that has placementMode of type "binds" (with rules) or has incoming bindings
 * is considered bound. Disallowing bindings onto bound elements avoids binding loops/cycles.
 */
export const isElementBound: BindingTargetAllowedCheck = (element: Visual): boolean => {
	if (element.placementMode?.type === "binds") {
		const rules = element.placementMode.config;
		if (!rules || rules.length > 0) return true;
	}
	if (element.bindingsToThis && element.bindingsToThis.length > 0) {
		return true;
	}
	return false;
};

/**
 * Predicate to identify LineLike elements (e.g. Line, Arrow) that should never receive bindings.
 */
export const isLineLikeElement: BindingTargetAllowedCheck = (element: Visual): boolean => {
	return element instanceof LineLike || element.type === "line";
};

/**
 * Helper to match an element against a class constructor or predicate check.
 */
const matchesDescriptor = (
	element: Visual,
	descriptor: (abstract new (...args: any[]) => Visual) | ((element: Visual) => boolean)
): boolean => {
	if (typeof descriptor === "function") {
		if (descriptor === Visual || (descriptor.prototype && descriptor.prototype instanceof Visual)) {
			if (element instanceof descriptor) return true;
			if (descriptor === LineLike && element.type === "line") {
				return true;
			}
			return false;
		}
		return (descriptor as (element: Visual) => boolean)(element);
	}
	return false;
};

/**
 * Registry of classes or predicate functions that are disallowed from receiving bindings.
 * - LineLike elements (Line, Arrow) are blocked from receiving bindings.
 * - Elements that are themselves bound are blocked to prevent binding loops.
 */
export const BINDING_DISALLOWED_TARGET_ELEMENTS: Array<
	(abstract new (...args: any[]) => Visual) | BindingTargetAllowedCheck
> = [
		LineLike,
		isElementBound
	];

/**
 * Registry of classes or predicate functions that are allowed to receive bindings.
 * By default, any Visual element (subject to BINDING_DISALLOWED_TARGET_ELEMENTS) is permitted.
 */
export const BINDING_ENABLED_TARGET_ELEMENTS: Array<
	(abstract new (...args: any[]) => Visual) | BindingTargetAllowedCheck
> = [
		Visual
	];

/**
 * Checks if a candidate element is allowed to be bound to (i.e. act as a target/anchor for bindings).
 *
 * @param candidate The visual element being evaluated as a potential binding target.
 * @param excludeElementId Optional element ID to exclude (e.g. self-binding prevention).
 * @returns true if candidate is allowed to receive bindings.
 */
export const isBindingAllowedAsTarget = (
	candidate: Visual | undefined,
	excludeElementId?: string
): candidate is Visual => {
	if (
		!candidate ||
		candidate.type === "diagram" ||
		!candidate.AnchorFunctions ||
		(excludeElementId !== undefined && candidate.id === excludeElementId)
	) {
		return false;
	}

	// 1. Check disallowed registry - any match blocks the candidate
	const isBlocked = BINDING_DISALLOWED_TARGET_ELEMENTS.some((target) =>
		matchesDescriptor(candidate, target)
	);
	if (isBlocked) return false;

	// 2. Check enabled registry - must match at least one allowed descriptor
	return BINDING_ENABLED_TARGET_ELEMENTS.some((target) =>
		matchesDescriptor(candidate, target)
	);
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
	if (!isBindingAllowedAsTarget(candidate, excludeElementId)) {
		return null;
	}

	let bestDist = Infinity;
	let bestResult: AnchorSnapResult | null = null;

	for (const xA of ANCHOR_LOCATIONS) {
		for (const yA of ANCHOR_LOCATIONS) {
			const sx = candidate.AnchorFunctions[xA]?.get("x", false);
			const sy = candidate.AnchorFunctions[yA]?.get("y", false);
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
							point: { x: sx, y: sy },
							bindToContent: false
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
