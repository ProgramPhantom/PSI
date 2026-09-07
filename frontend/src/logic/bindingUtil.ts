import Spacial, {
	Dimensions,
	IGridBindingPlacementRule,
	IPlacementBindingRule,
	ISequenceBindingRule,
	PlacementConfiguration,
	SiteNames
} from "./spacial";
import Grid, { isGridColumn } from "./grid";


export interface ISelectedBindingInfo {
	anchorObject: Spacial;
	xAnchor: SiteNames;
	yAnchor: SiteNames;
	point: { x: number; y: number };
	bindToContent?: boolean;
}


/**
 * Creates a placement binding rule for a single dimension given an ISelectedBindingInfo.
 */
export function createPlacementBindingRule(
	info: ISelectedBindingInfo,
	dimension: Dimensions,
	targetSiteName: SiteNames
): ISequenceBindingRule {
	const anchorSiteName = dimension === "x" ? info.xAnchor : info.yAnchor;
	if (isGridColumn(info.anchorObject)) {
		return {
			sequenceId: info.anchorObject.sequenceId,
			column: info.anchorObject.columnIndex,
			dimension,
			anchorSiteName,
			targetSiteName,
			bindToContent: info.bindToContent ?? false
		};
	}
	return {
		targetId: info.anchorObject.id,
		dimension,
		anchorSiteName,
		targetSiteName,
		bindToContent: info.bindToContent ?? false
	};
}

/**
 * Creates X and/or Y placement binding rules given an ISelectedBindingInfo and target site names.
 */
export function createPlacementRulesForBinding(
	info: ISelectedBindingInfo,
	targetSiteX?: SiteNames,
	targetSiteY?: SiteNames
): ISequenceBindingRule[] {
	const rules: ISequenceBindingRule[] = [];
	if (targetSiteX) {
		rules.push(createPlacementBindingRule(info, "x", targetSiteX));
	}
	if (targetSiteY) {
		rules.push(createPlacementBindingRule(info, "y", targetSiteY));
	}
	return rules;
}

export type ElementFinder = (id: string) => Spacial | undefined;

/**
 * Resolves the anchor object for a given rule (either from sequence columns or by element ID).
 */
export function resolveAnchorForRule(
	rule: ISequenceBindingRule,
	elementFinder: ElementFinder
): Spacial | undefined {
	if (isGridBindingRule(rule)) {
		const seq = elementFinder(rule.sequenceId) as Grid | undefined;
		return seq?.gridSizes?.columns?.[rule.column] ?? seq?.getColumnSpacial(rule.column);
	}
	const anchorId = rule.targetId || rule.anchorId;
	return anchorId ? elementFinder(anchorId) : undefined;
}

/**
 * Clears an established binding from the anchor referenced in the rule.
 * Looks up the active anchor via targetElement's incoming bindings (or via elementFinder if provided).
 */
export function clearBindingRuleFromAnchor(
	rule: ISequenceBindingRule,
	targetElement: Spacial,
	elementFinder?: ElementFinder
): void {
	const matching = targetElement.bindingsToThis.find(
		(b) => b.bindingRule.dimension === rule.dimension && b.bindingRule.targetSiteName === rule.targetSiteName
	);
	if (matching) {
		matching.anchorObject.clearBindsTo(targetElement, rule.dimension, rule.targetSiteName);
		return;
	}

	if (elementFinder) {
		const anchor = resolveAnchorForRule(rule, elementFinder);
		anchor?.clearBindsTo(targetElement, rule.dimension, rule.targetSiteName);
	}
}

/**
 * Registers an active runtime binding on the resolved anchor object.
 */
export function applyBindingRule(
	rule: ISequenceBindingRule,
	targetElement: Spacial,
	anchorOverride?: Spacial,
	elementFinder?: ElementFinder
): void {
	const anchor = anchorOverride ?? (elementFinder ? resolveAnchorForRule(rule, elementFinder) : undefined);
	if (anchor) {
		anchor.bind(
			targetElement,
			rule.dimension,
			rule.anchorSiteName,
			rule.targetSiteName,
			rule.offset,
			rule.hint,
			rule.bindToContent ?? true
		);
	}
}


/**
 * Filters a list of placement binding rules into remaining and removed rules matching targetSiteName (and optional dimension).
 */
export function filterPlacementBindingRules<T extends ISequenceBindingRule = ISequenceBindingRule>(
	rules: T[],
	targetSiteName: SiteNames,
	dimension?: Dimensions
): { remaining: T[]; removed: T[] } {
	const remaining: T[] = [];
	const removed: T[] = [];

	for (const rule of rules) {
		const matchesSite = rule.targetSiteName === targetSiteName;
		const matchesDim = dimension === undefined || rule.dimension === dimension;
		if (matchesSite && matchesDim) {
			removed.push(rule);
		} else {
			remaining.push(rule);
		}
	}

	return { remaining, removed };
}

/**
 * Determines the appropriate PlacementConfiguration for a given list of binding rules.
 */
export function determineBindingPlacementModeType(rules: ISequenceBindingRule[]): PlacementConfiguration {
	if (!rules || rules.length === 0) {
		return { type: "free" };
	}
	if (rules.some(isGridBindingRule)) {
		return { type: "sequenceBind", config: rules };
	}
	return { type: "binds", config: rules as IPlacementBindingRule[] };
}

/**
 * Removes rules matching targetSiteName (and optional dimension) from a PlacementConfiguration.
 * If 0 rules remain, reverts to `{ type: "free" }`.
 */
export function updatePlacementModeBindingRules(
	placementMode: PlacementConfiguration | undefined,
	targetSiteName: SiteNames,
	dimension?: Dimensions
): { updatedPlacementMode: PlacementConfiguration; removedRules: ISequenceBindingRule[] } {
	if ((placementMode?.type !== "binds" && placementMode?.type !== "sequenceBind") || !placementMode.config) {
		return {
			updatedPlacementMode: placementMode ?? { type: "free" },
			removedRules: []
		};
	}

	const { remaining, removed } = filterPlacementBindingRules(placementMode.config, targetSiteName, dimension);

	const updatedPlacementMode = determineBindingPlacementModeType(remaining);

	return { updatedPlacementMode, removedRules: removed };
}


/**
 * Type guard to check if a binding rule targets a sequence grid column.
 */
export function isGridBindingRule(rule: ISequenceBindingRule): rule is IGridBindingPlacementRule {
	return "sequenceId" in rule;
}