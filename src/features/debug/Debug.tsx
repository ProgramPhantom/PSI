import { Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import { AllComponentTypes } from "../../logic/point";
import Visual from "../../logic/visual";
import PaddedBoxDebug from "./PaddedBox";

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
					case "element":
						return ENGINE.handler.diagram.allPulseElements.map((e) => {
							return <PaddedBoxDebug element={e}></PaddedBoxDebug>;
						});
						break;
					case "channel":
						return ENGINE.handler.diagram.channels.map((c) => {
							return (
								<PaddedBoxDebug
									element={c}
									contentColour={Colors.BLUE4}></PaddedBoxDebug>
							);
						});
					case "sequence":
						return ENGINE.handler.sequences.map((s) => {
							return (
								<PaddedBoxDebug
									element={s}
									contentColour={Colors.LIME2}></PaddedBoxDebug>
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
