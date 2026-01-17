import {CSSProperties} from "react";
import Grid from "../../logic/grid";
import {Colors} from "@blueprintjs/core";
import CollectionDebug from "./Collection";
import PaddedBox from "../../logic/paddedBox";
import PaddedBoxDebug from "./PaddedBoxDebug";

export interface IGridDebug {
	element: Grid;
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

	var x1 = props.element.x;
	var y1 = props.element.y;
	var cx = props.element.cx;
	var cy = props.element.cy;

	var width = props.element.width;
	var height = props.element.height;

	var contentWidth = props.element.contentWidth !== undefined ? props.element.contentWidth : 0;
	var contentHeight = props.element.contentHeight !== undefined ? props.element.contentHeight : 0;

	var padding = props.element.padding;

	return (
		<>
			
			<div
				style={{ 	position: "absolute",
					left: cx,
					top: cy-3,
				}}>
				<p style={{fontSize: 2,
				}}>
						{`(${x1}, ${y1})`}
				</p>
			</div>

			{props.element.getCells().map((c, cell_index) => {
				if (c.width === 0 || c.height === 0) {
					return <></>
				}
				
				return (
					<div key={cell_index}
						style={{
							width: c.width,
							height: c.height,
							top: c.y,
							left: c.x,
							...style
						}}></div>
				);
			})}
			{/* <PaddedBoxDebug element={props.grid}></PaddedBoxDebug> */}
		</>
	);
};

export default GridDebug;
