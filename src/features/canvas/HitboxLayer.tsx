import {Element} from "@svgdotjs/svg.js";
import ENGINE from "../../logic/engine";
import {Rect} from "@svgdotjs/svg.js";
import {Svg} from "@svgdotjs/svg.js";
import {SVG} from "@svgdotjs/svg.js";
import {Visual} from "../../logic/visual";
import {ID} from "../../logic/point";
import {AllComponentTypes} from "../../logic/diagramHandler";
import {useEffect, useRef, useSyncExternalStore} from "react";

interface IHitboxLayerProps {
	focusLevel: number;

	setHoveredElement: (element?: Visual) => void;
}

const BASE_LAYER = 10000;

type HoverBehaviour = "terminate" | "carry" | "conditional";
// Terminate: return this object immediately
// Carry: always pass to parent
// Conditional: Check parent and only return itself IF above is carry. If above is terminal, pass up.
const FocusLevels: Record<number, Record<HoverBehaviour, AllComponentTypes[]>> = {
	0: {
		terminate: ["label-group", "channel", "line", "svg", "rect"],
		carry: ["text", "diagram", "lower-abstract"],
		conditional: ["rect", "svg", "label"]
	},
	1: {
		terminate: ["diagram", "label-group", "channel", "svg", "rect", "label-group"],
		carry: ["diagram"],
		conditional: []
	},
	2: {
		terminate: ["diagram", "label-group"],
		carry: ["diagram"],
		conditional: ["svg", "rect"]
	}
};

export function HitboxLayer(props: IHitboxLayerProps) {
	var drawSVG: Element | undefined = ENGINE.surface;
	if (drawSVG === undefined) {
		return <></>;
	}
	var hitboxSVG: Svg = SVG();
	var hitboxSvgRef = useRef<SVGSVGElement | null>();

	var componentRectArray: Rect[] = [];
	var freeRectArray: Rect[] = [];

	// Create hitboxes
	const createHitboxDom = () => {
		hitboxSVG = SVG();
		componentRectArray = [];
		freeRectArray = [];

		traverseDom(drawSVG, componentRectArray, freeRectArray);

		componentRectArray.forEach((r) => {
			hitboxSVG.add(r);
		});
		freeRectArray.forEach((r) => {
			hitboxSVG.add(r);
		});
	};

	const traverseDom = (
		root: Element,
		componentRectArray: Rect[],
		freeRectArray: Rect[],
		depth: number = BASE_LAYER
	) => {
		var thisElement: Visual = ENGINE.handler.identifyElement(root.id());

		if (thisElement !== undefined) {
			var thisLayer: Rect = thisElement.getHitbox().attr({zIndex: depth});

			if (thisElement.ownershipType === "component") {
				componentRectArray.push(thisLayer);
			} else if (thisElement.ownershipType === "free") {
				freeRectArray.push(thisLayer);
			}

			if (
				(root.type !== "svg" || depth === BASE_LAYER)
				&& thisElement.ref !== "label col | pulse columns"
			) {
				root.children().forEach((c) => {
					traverseDom(c, componentRectArray, freeRectArray, depth - 1);
				});
			}
		}
	};

	const getMouseElementFromID = (id: ID | undefined): Visual | undefined => {
		if (id === undefined) {
			return undefined;
		}
		var initialElement: Visual | undefined = ENGINE.handler.identifyElement(id);
		if (initialElement === undefined) {
			return undefined;
		}

		var terminators: AllComponentTypes[] = FocusLevels[props.focusLevel].terminate;
		var carry: AllComponentTypes[] = FocusLevels[props.focusLevel].carry;
		var conditional: AllComponentTypes[] = FocusLevels[props.focusLevel].conditional;

		function walkUp(currElement: Visual): Visual | undefined {
			if (currElement.parentId !== undefined) {
				var elementUp: Visual | undefined = ENGINE.handler.identifyElement(
					currElement.parentId
				);
			} else {
				return currElement;
			}

			if (elementUp === undefined) {
				return currElement;
			}

			if (currElement.ref === "LINE") {
				console.log();
			}
			var currElementType: AllComponentTypes = (currElement.constructor as typeof Visual)
				.ElementType;
			var elementUpType: AllComponentTypes = (elementUp.constructor as typeof Visual)
				.ElementType;

			if (terminators.includes(currElementType)) {
				return currElement;
			}
			if (conditional.includes(currElementType) && !terminators.includes(elementUpType)) {
				return currElement;
			}

			elementUp = walkUp(elementUp);

			return elementUp;
		}

		return walkUp(initialElement);
	};

	const mouseOver = (over: React.MouseEvent<SVGSVGElement, globalThis.MouseEvent>) => {
		var rawTargetId: string | undefined = (over.target as HTMLElement).id;
		console.log(rawTargetId);

		if (rawTargetId === undefined) {
			props.setHoveredElement(undefined);

			return;
		}

		var parsedId: string = rawTargetId.split("-")[0];
		var element: Visual | undefined = getMouseElementFromID(parsedId);

		props.setHoveredElement(element);
	};

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
			<svg
				ref={hitboxSvgRef}
				key={"hitbox"}
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
				onMouseMove={(o) => {
					mouseOver(o);
				}}
			/>
		</>
	);
}
