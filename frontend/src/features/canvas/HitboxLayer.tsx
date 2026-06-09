import { Element, G, Rect, Svg, SVG } from "@svgdotjs/svg.js";
import { useEffect, useRef, useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { AllComponentTypes, ID, UserComponentType } from "../../logic/point";
import Visual from "../../logic/visual";

interface IHitboxLayerProps {
	selectedElementId: string | undefined;

	setHoveredElement: (element?: Visual, rawElement?: Visual) => void;
}

const BASE_LAYER = 10000;

interface IFocusRules {
	alwaysSelectable: AllComponentTypes[];
	notSelectableIfChildOf: Partial<Record<AllComponentTypes, AllComponentTypes[]>>;
}

export const FocusRules: IFocusRules = {
	alwaysSelectable: ["channel", "svg", "rect", "label-group"],
	notSelectableIfChildOf: {
		"svg": ["label-group"],
		"rect": ["label-group"]
	}
};

export function HitboxLayer(props: IHitboxLayerProps) {
	let diagramSVG: Element | undefined = ENGINE.handler.diagram.svg;
	if (diagramSVG === undefined) {
		return <></>;
	}
	var hitboxSVG: G = new G();
	var hitboxSvgRef = useRef<SVGSVGElement | null>(null);

	// Create hitboxes
	const createHitboxDom = () => {
		hitboxSVG = new G();

		Object.values(ENGINE.handler.allElements).forEach((e) => {
			if (e.type !== "diagram") {
				hitboxSVG.add(e.getHitbox())
			}
		})
	};

	const getMouseElementFromID = (id: ID | undefined): Visual | undefined => {
		if (id === undefined) {
			return undefined;
		}
		var initialElement: Visual | undefined = ENGINE.handler.identifyElement(id);
		if (initialElement === undefined) {
			return undefined;
		}

		// 1. Build the path of elements from initialElement up to the root diagram
		let path: Visual[] = [];
		let curr: Visual | undefined = initialElement;

		while (curr) {
			path.unshift(curr); // Start of array is topmost under root, end is initialElement  // emergency escape
			if (curr.parentId === undefined || curr.parentId === ENGINE.handler.diagram.id || curr.parentId === curr.id) {
				break;
			}
			curr = ENGINE.handler.identifyElement(curr.parentId);
		}

		let selectedIndex: number = path.findIndex(el => el.id === props.selectedElementId);

		// 2. Bottom-up fine tuning for always selectable elements
		let bottomUpCurr: Visual | undefined = initialElement;
		while (bottomUpCurr) {
			const type: UserComponentType = (bottomUpCurr.constructor as typeof Visual).ElementType;
			const exceptions: AllComponentTypes[] = FocusRules.notSelectableIfChildOf[type] || [];

			if (FocusRules.alwaysSelectable.includes(type)) {
				let excluded = false;
				let ancestor: Visual | undefined = ENGINE.handler.identifyElement(bottomUpCurr.parentId ?? "");

				while (ancestor !== undefined) {
					const ancestorType: UserComponentType = (ancestor.constructor as typeof Visual).ElementType;

					if (exceptions.includes(ancestorType)) {
						let bottomUpCurrIndex: number = path.findIndex(el => el.id === bottomUpCurr?.id);
						if (selectedIndex !== -1 && bottomUpCurrIndex !== -1 && selectedIndex >= bottomUpCurrIndex) {
							// Ignore exception because we've drilled down to or past this element
						} else {
							excluded = true;
							break;
						}
					}

					if (ancestor.parentId === undefined || ancestor.parentId === ENGINE.handler.diagram.id) break;
					ancestor = ENGINE.handler.identifyElement(ancestor.parentId);
				}

				if (!excluded) {
					let bottomUpCurrIndex = path.findIndex(el => el.id === bottomUpCurr?.id);
					if (selectedIndex !== -1 && bottomUpCurrIndex !== -1 && selectedIndex > bottomUpCurrIndex) {
						// Do not intercept because we've already drilled down past this element
					} else {
						return bottomUpCurr; // Skip hierarchy, immediately interactable
					}
				}
			}
			if (bottomUpCurr.parentId === undefined || bottomUpCurr.parentId === ENGINE.handler.diagram.id) break;
			bottomUpCurr = ENGINE.handler.identifyElement(bottomUpCurr.parentId);
		}

		// 3. Group Depth Selection Logic
		// The path is structured Top-Down: [TopLevelGroup, SubGroup, ..., ClickedElement]
		// Find the deeply-selected element in this path.

		if (selectedIndex === -1) {
			// Nothing in this family is currently selected, thus select the highest level element
			return path[0];
		} else {
			// A parent is selected! Stay selected on it for hover purposes.
			// Drill down is handled by double-click in Canvas.tsx.
			return path[selectedIndex];
		}
	};

	// We store these in refs because the window mousemove listener is initialized once (empty dependency array).
	// Using refs allows the listener to always access the latest version of these functions
	// without needing to re-bind the event listener every time props (like focusLevel) change.
	const getMouseElementFromIDRef = useRef(getMouseElementFromID);
	getMouseElementFromIDRef.current = getMouseElementFromID;

	const setHoveredElementRef = useRef(props.setHoveredElement);
	setHoveredElementRef.current = props.setHoveredElement;

	useEffect(() => {
		/** 
		 * "X-Ray" Hover Detection:
		 * Standard mousemove events are blocked by elements with higher z-index (like DraggableElements).
		 * document.elementsFromPoint returns an array of ALL elements under the cursor, 
		 * allowing us to see "through" the draggable layer to find hitboxes underneath.
		 */
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!hitboxSvgRef.current) return;
			const elements = document.elementsFromPoint(e.clientX, e.clientY);

			let rawTargetId: string | undefined = undefined;
			for (let i = 0; i < elements.length; i++) {
				const el = elements[i];
				// Ignore the layer container itself
				if (el === hitboxSvgRef.current) continue;
				// Check if the element is a child of our hitbox SVG and has an ID
				if (el.id && hitboxSvgRef.current.contains(el)) {
					rawTargetId = el.id;
					break;
				}
			}

			if (rawTargetId === undefined) {
				setHoveredElementRef.current(undefined);
				return;
			}

			let parsedId: string = rawTargetId.split("-")[0];
			let rawElement: Visual | undefined = ENGINE.handler.identifyElement(parsedId);
			let element: Visual | undefined = getMouseElementFromIDRef.current(parsedId);
			setHoveredElementRef.current(element, rawElement);
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
		};
	}, []);


	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	useEffect(() => {
		createHitboxDom();

		if (hitboxSvgRef.current && hitboxSVG) {
			hitboxSvgRef.current.replaceChildren();
			hitboxSvgRef.current.appendChild(hitboxSVG.node);
		}
	}, [store]);


	return (
		<>
			<svg id="hitbox-layer"
				ref={hitboxSvgRef}
				key={"hitbox"}
				viewBox={`${ENGINE.handler.diagram.x} ${ENGINE.handler.diagram.y} ${ENGINE.handler.diagram.width} ${ENGINE.handler.diagram.height}`}
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					zIndex: BASE_LAYER,
					width: ENGINE.handler.diagram.width,
					height: ENGINE.handler.diagram.height,
					marginBottom: "auto",
					marginTop: "auto"
				}}
			/>
		</>
	);
}
