import React from "react";
import { Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import { AllComponentTypes } from "../../logic/point";
import Visual, { AlignerElement } from "../../logic/visual";
import Grid from "../../logic/grid";
import Aligner from "../../logic/aligner";
import PaddedBox from "../../logic/paddedBox";
import Collection from "../../logic/collection";
import { isPulse } from "../../logic/spacial";
import PaddedBoxDebug from "./PaddedBoxDebug";
import GridDebug from "./GridDebug";
import AlignerDebug from "./AlignerDebug";
import PulseDebug from "./PulseDebug";
import CollectionDebug from "./Collection";
import { useAppSelector } from "../../redux/hooks";
import Sequence from "../../logic/hasComponents/sequence";

export interface IDebug {
	debugGroupSelection?: Record<AllComponentTypes, boolean>;
	debugSelection?: Visual[];
	selectedElement?: Visual | null;
	debugSelectedElement?: boolean;
}

export function renderElementDebug(element: Visual, key?: string | number): JSX.Element | null {
	if (!element) return null;

	if (element instanceof Grid) {
		return <GridDebug key={key ?? element.id} element={element} />;
	}

	if (element instanceof Aligner) {
		return <AlignerDebug key={key ?? element.id} element={element} />;
	}

	if (isPulse(element)) {
		return <PulseDebug key={key ?? element.id} element={element} />;
	}

	if (element instanceof PaddedBox) {
		return <PaddedBoxDebug key={key ?? element.id} element={element} />;
	}

	return null;
}

const Debug: React.FC<IDebug> = (props) => {
	const reduxDebugGroupSelection = useAppSelector((state) => state.application.debugSelectionTypes);
	const reduxDebugSelectedElement = useAppSelector((state) => state.application.debugSelectedElement);
	const reduxSelectedElementId = useAppSelector((state) => state.application.selectedElementId);

	const debugGroupSelection = props.debugGroupSelection ?? reduxDebugGroupSelection;
	const isDebugSelectedElement = props.debugSelectedElement ?? reduxDebugSelectedElement;
	const selectedElement =
		props.selectedElement !== undefined
			? props.selectedElement
			: reduxSelectedElementId
				? ENGINE.handler.identifyElement(reduxSelectedElementId)
				: undefined;

	return (
		<>
			{Object.entries(debugGroupSelection).map(([componentType, visible]) => {
				if (!visible) {
					return null;
				}
				switch (componentType) {
					case "svg":
						return ENGINE.handler.diagram.allPulseElements.map((e) => {
							return <PulseDebug key={e.id} element={e} />;
						});
					case "channel":
						return ENGINE.handler.diagram.channels.map((c) => {
							return (
								<GridDebug
									key={c.id}
									element={c}
									contentColour={Colors.BLUE4}
								/>
							);
						});
					case "sequence":
						return ENGINE.handler.sequences.map((s) => {
							return (
								<GridDebug
									key={s.id}
									element={s}
								/>
							);
						});
					case "diagram":
						return (
							<PaddedBoxDebug
								key={ENGINE.handler.diagram.id}
								element={ENGINE.handler.diagram}
								contentColour={Colors.CERULEAN1}
							/>
						);
					case "sequence-aligner":
						return (
							<AlignerDebug
								key={ENGINE.handler.diagram.sequenceAligner.id}
								element={ENGINE.handler.diagram.sequenceAligner as Aligner<any>}
								contentColour={Colors.SEPIA3}
							/>
						);
					default:
						return null;
				}
			})}

			{props.debugSelection?.map((element) => renderElementDebug(element, `debug-sel-${element.id}`))}

			{isDebugSelectedElement && selectedElement && renderElementDebug(selectedElement, `debug-selected-${selectedElement.id}`)}
		</>
	);
};

export default Debug;

