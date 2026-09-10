import { useMemo, useSyncExternalStore } from "react";
import ENGINE from "../logic/engine";
import Visual from "../logic/visual";
import { useAppSelector } from "../redux/hooks";

/**
 * Custom hook to retrieve all currently selected Visual elements from ENGINE.
 * Automatically stays reactive to both Redux selection state and ENGINE mutations.
 */
export function useSelectedElements(): Visual[] {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const selectedElementIds = useAppSelector((state) => state.application.selectedElementIds);

	return useMemo(() => {
		return selectedElementIds
			.map((id) => ENGINE.handler.identifyElement(id))
			.filter((el): el is Visual => Boolean(el && el instanceof Visual));
	}, [selectedElementIds, store]);
}

/**
 * Custom hook to retrieve the sole selected Visual element from ENGINE.
 * Returns undefined if no element or multiple elements are selected (Option A).
 * Automatically stays reactive to both Redux selection state and ENGINE mutations.
 */
export function useSelectedElement(): Visual | undefined {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const selectedElementIds = useAppSelector((state) => state.application.selectedElementIds);

	return useMemo(() => {
		if (selectedElementIds.length !== 1) return undefined;
		const el = ENGINE.handler.identifyElement(selectedElementIds[0]);
		return el instanceof Visual ? el : undefined;
	}, [selectedElementIds, store]);
}

/**
 * Custom hook to retrieve the sole selected element ID.
 * Returns undefined if no element or multiple elements are selected (Option A).
 */
export function useSelectedElementId(): string | undefined {
	const selectedElementIds = useAppSelector((state) => state.application.selectedElementIds);
	return selectedElementIds.length === 1 ? selectedElementIds[0] : undefined;
}

export default useSelectedElements;

