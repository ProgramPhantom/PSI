import { Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import { AllComponentTypes } from "../../logic/point";
import Visual from "../../logic/visual";
import PaddedBoxDebug from "./PaddedBoxDebug";
import GridDebug from "./GridDebug";
import PulseDebug from "./PulseDebug";
import GridDropField from "../dnd/GridDropField";

interface IDebug {
	debugGroupSelection: Record<AllComponentTypes, boolean>;
	debugSelection: Visual[];
}

const Debug: React.FC<IDebug> = (props) => {
	return (
		<>
			{Object.entries(props.debugGroupSelection).map(([componentType, visible]) => {
				if (!visible) {
					return;
				}
				switch (componentType) {
					case "svg":
						return ENGINE.handler.diagram.allPulseElements.map((e) => {
							return <PulseDebug element={e}></PulseDebug>;
						});
						break;
					case "channel":
						return ENGINE.handler.diagram.channels.map((c) => {
							return (
								<GridDebug
									element={c}
									contentColour={Colors.BLUE4}></GridDebug>
							);
						});
					case "sequence":
						return ENGINE.handler.sequences.map((s) => {
							return (
								<GridDebug
									element={s}></GridDebug>
							);
						});
					case "diagram":
						return (
							<PaddedBoxDebug
								element={ENGINE.handler.diagram}
								contentColour={Colors.CERULEAN1}></PaddedBoxDebug>
						);
				}
			})}
		</>
	);
};

export default Debug;
