import {CSSProperties} from "react";
import Grid from "../../logic/grid";
import {Colors} from "@blueprintjs/core";

export interface IGridDebug {
	grid: Grid;
	contentColour?: string;
}

const GridDebug: React.FC<IGridDebug> = (props) => {
	var style: CSSProperties = {
		border: "dashed",
		strokeOpacity: 1,
		borderWidth: "1px",
		opacity: 0.4,
		fill: "none",
		position: "absolute",
		pointerEvents: "none",
		background: props.contentColour === undefined ? Colors.RED3 : props.contentColour
	};

	return (
		<>
			{props.grid.getCells().map((c) => {
				return (
					<div
						style={{
							width: c.width,
							height: c.height,
							top: c.y,
							left: c.x,
							...style
						}}></div>
				);
			})}
		</>
	);
};

export default GridDebug;
