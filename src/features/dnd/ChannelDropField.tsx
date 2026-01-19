import { useEffect, useState, useSyncExternalStore } from "react";
import DiagramHandler from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { GridCell } from "../../logic/grid";
import Diagram from "../../logic/hasComponents/diagram";
import Sequence from "../../logic/hasComponents/sequence";
import Visual from "../../logic/visual";
import ChannelInsertArea, { AddSpec } from "./ChannelInsertArea";
import Channel from "../../logic/hasComponents/channel";

interface Rect {x: number, y: number, width: number, height: number}


const SLITHER_WIDTH = 4;

interface IChannelDropFieldProps {
	target: Channel
}

function ChannelDropField(props: IChannelDropFieldProps) {
	const [insertAreas, setInsertAreas] = useState<AddSpec[]>([]);

	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	useEffect(() => {
		let insertAreas: AddSpec[] = [];

		var newBlock: AddSpec;
		var newSlither: AddSpec;

		var columns: Rect[] = props.target.gridSizes.columns;
		var noColumns = columns.length;

		// Allowed Slither indexes
		var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);

		// Compute indexes of the slithers
		for (var columnIndex = 0; columnIndex < noColumns + 1; columnIndex++) {
			let hereOccupancyTop: GridCell =
				props.target.getCell({row: 0, col: columnIndex})
			let middleOccupied: boolean = 
				(props.target.getCell({row: 1, col: columnIndex})?.elements ?? []).length > 1;
			let hereOccupancyBottom: GridCell =
				props.target.getCell({row: 2, col: columnIndex});

			if (
				(hereOccupancyTop?.sources !== undefined ||
					hereOccupancyBottom?.sources !== undefined
				)
			) {
				slitherIndexes[columnIndex] = false;
			}
		}
		

		// Main slithers and place blocks
		for (var columnIndex = 1; columnIndex < noColumns; columnIndex++) {
			var column = columns[columnIndex];
			let topOccupied: boolean =
				props.target.getCell({row: 0, col: columnIndex}) === undefined
					? false
					: true;
			let middleOccupied: boolean = 
				(props.target.getCell({row: 1, col: columnIndex})?.elements ?? []).length > 1;
			let bottomOccupied: boolean = 
			props.target.getCell({row: 2, col: columnIndex}) === undefined
					? false
					: true;

			// SLITHERS
			if (slitherIndexes[columnIndex]) {
				// Insert start
				// Top slither
				newSlither = {
					area: {
						x: column.x - SLITHER_WIDTH / 2,
						y: props.target.gridSizes.rows[0].y,
						width: SLITHER_WIDTH,
						height: props.target.gridSizes.rows[0].height
					},
					index: columnIndex,
					orientation: "top",
					channelID: props.target.id,
					insert: true,
					sequenceID: props.target.parentId ?? ""
				};
				insertAreas.push(newSlither);

				// bottom slither
				newSlither = {
					area: {
						x: column.x - SLITHER_WIDTH / 2,
						y: props.target.gridSizes.rows[2].y,
						width: SLITHER_WIDTH,
						height: props.target.gridSizes.rows[2].height
					},
					index: columnIndex,
					orientation: "bottom",
					channelID: props.target.id,
					insert: true,
					sequenceID: props.target.parentId ?? ""
				};
				insertAreas.push(newSlither);
			}

			var columnWidth = column.width;
			// PLACE BLOCK
			if (!topOccupied && !middleOccupied) {
				// Top block

				var newBlock: AddSpec = {
					area: {
						x: column.x + SLITHER_WIDTH / 2,
						y: props.target.gridSizes.rows[0].y,
						width: columnWidth - SLITHER_WIDTH,
						height: props.target.gridSizes.rows[0].height
					},
					index: columnIndex,
					orientation: "top",
					channelID: props.target.id,
					sequenceID: props.target.parentId ?? "",
					insert: false
				};
				insertAreas.push(newBlock);
			}

			if (!bottomOccupied && !middleOccupied) {
				// Bottom block
				newBlock = {
					area: {
						x: column.x + SLITHER_WIDTH / 2,
						y: props.target.gridSizes.rows[2].y,
						width: columnWidth - SLITHER_WIDTH,
						height: props.target.gridSizes.rows[2].height
					},
					index: columnIndex,
					orientation: "bottom",
					channelID: props.target.id,
					sequenceID: props.target.parentId ?? "",
					insert: false
				};
				insertAreas.push(newBlock);
			}
		};


		// END SLITHERS
		var column: Rect = columns[columns.length - 1];
		var i = columns.length - 1;
		// Top slither
		newSlither = {
			area: {
				x: column.x + column.width - SLITHER_WIDTH / 2,
				y: props.target.gridSizes.rows[0].y,
				width: SLITHER_WIDTH,
				height: props.target.gridSizes.rows[0].height
			},
			index: i + 1,
			orientation: "top",
			channelID: props.target.id,
			insert: true,
			sequenceID: props.target.parentId ?? ""
		};
		insertAreas.push(newSlither);

		// bottom slither
		newSlither = {
			area: {
				x: column.x + column.width - SLITHER_WIDTH / 2,
				y: props.target.gridSizes.rows[2].y,
				width: SLITHER_WIDTH,
				height: props.target.gridSizes.rows[2].height
			},
			index: i + 1,
			orientation: "bottom",
			channelID: props.target.id,
			insert: true,
			sequenceID: props.target.parentId ?? ""
		};
		insertAreas.push(newSlither);
		

		setInsertAreas(insertAreas)
	})


	return (
		<div id={`${props.target.ref}-drop-field`}>
			{insertAreas.map((insertArea) => {
				return (
					// This fixes an enormous, impossible to fix problem
					<ChannelInsertArea
						areaSpec={insertArea}
						key={
							insertArea.channelID
							+ insertArea.index
							+ insertArea.insert
							+ insertArea.orientation
						}></ChannelInsertArea>
				);
			})}
		</div>
	);
}

export default ChannelDropField;
