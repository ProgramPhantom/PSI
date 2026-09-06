import Visual from "../../logic/visual";
import LineLike from "../../logic/lineLike";

/**
 * Predicate function type to test if an element is allowed to show the BindingsSelector during resize.
 */
export type BindingResizeAllowedCheck = (element: Visual) => boolean;

/**
 * Registry of classes or predicate functions that are allowed to show and establish bindings during resizing.
 * Currently, only LineLike (Line, Arrow) objects are enabled.
 * 
 * To enable bindings for future resizing elements (e.g., RectAnnotation):
 * simply add the class constructor or custom predicate to this array.
 */
export const BINDING_ENABLED_RESIZING_ELEMENTS: Array<
	(abstract new (...args: any[]) => Visual) | BindingResizeAllowedCheck
> = [
	LineLike
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
			try {
				return element instanceof (target as any);
			} catch {
				return (target as BindingResizeAllowedCheck)(element);
			}
		}
		return false;
	});
};

export default isBindingAllowedForResizing;
