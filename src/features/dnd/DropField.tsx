import DiagramHandler from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { GridCell } from "../../logic/grid";
import Diagram from "../../logic/hasComponents/diagram";
import Sequence from "../../logic/hasComponents/sequence";
import Visual from "../../logic/visual";
import InsertArea, { AddSpec } from "./InsertArea";

interface Rect {x: number, y: number, width: number, height: number}



class DiagramDropInterpreter {
	public handler: DiagramHandler;
	public insertAreas: AddSpec[];
	private slitherWidth: number = 4;
	private minHeight: number = 6

	constructor(handler: DiagramHandler) {
		this.handler = handler;

		this.insertAreas = [];
		this.computeAreas();
	}

	computeAreas() {
		this.insertAreas = [];

		var diagram: Diagram = this.handler.diagram;
		var sequences: Sequence[] = this.handler.diagram.sequences;
		var newSlither: AddSpec;

		// Iterate sequences
		Object.entries(diagram.sequenceDict).forEach(([seqID, sequence]) => {

			// For each channel
			Object.entries(sequence.channelsDict).forEach(([channelId, channel], channelIndex) => {
				var columns: Rect[] = channel.gridSizes.columns;
				var noColumns = columns.length;

				// Allowed Slither indexes
				var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);

				// Compute indexes of the slithers
				for (var columnIndex = 0; columnIndex < noColumns + 1; columnIndex++) {
					let hereOccupancyTop: GridCell =
						channel.gridMatrix[0]?.[columnIndex];
					let middleOccupied: boolean = 
						(channel.gridMatrix[1][columnIndex]?.elements ?? []).length > 1;
					let hereOccupancyBottom: GridCell =
						channel.gridMatrix[2]?.[columnIndex];

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
						channel.gridMatrix[0][columnIndex] === undefined
							? false
							: true;
					let middleOccupied: boolean = 
						(channel.gridMatrix[1][columnIndex]?.elements ?? []).length > 1;
					let bottomOccupied: boolean = 
					channel.gridMatrix[2][columnIndex] === undefined
							? false
							: true;

					// SLITHERS
					if (slitherIndexes[columnIndex]) {
						// Insert start
						// Top slither
						newSlither = {
							area: {
								x: column.x - this.slitherWidth / 2,
								y: channel.gridSizes.rows[0].y,
								width: this.slitherWidth,
								height: channel.gridSizes.rows[0].height
							},
							index: columnIndex,
							orientation: "top",
							channelID: channelId,
							insert: true,
							sequenceID: sequence.id
						};
						this.insertAreas.push(newSlither);

						// bottom slither
						newSlither = {
							area: {
								x: column.x - this.slitherWidth / 2,
								y: channel.gridSizes.rows[2].y,
								width: this.slitherWidth,
								height: channel.gridSizes.rows[2].height
							},
							index: columnIndex,
							orientation: "bottom",
							channelID: channelId,
							insert: true,
							sequenceID: sequence.id
						};
						this.insertAreas.push(newSlither);
					}

					var columnWidth = column.width;
					// PLACE BLOCK
					if (!topOccupied && !middleOccupied) {
						// Top block

						var newBlock: AddSpec = {
							area: {
								x: column.x + this.slitherWidth / 2,
								y: channel.gridSizes.rows[0].y,
								width: columnWidth - this.slitherWidth,
								height: channel.gridSizes.rows[0].height
							},
							index: columnIndex,
							orientation: "top",
							channelID: channelId,
							sequenceID: seqID,
							insert: false
						};
						this.insertAreas.push(newBlock);
					}

					if (!bottomOccupied && !middleOccupied) {
						// Bottom block
						newBlock = {
							area: {
								x: column.x + this.slitherWidth / 2,
								y: channel.gridSizes.rows[2].y,
								width: columnWidth - this.slitherWidth,
								height: channel.gridSizes.rows[2].height
							},
							index: columnIndex,
							orientation: "bottom",
							channelID: channelId,
							sequenceID: seqID,
							insert: false
						};
						this.insertAreas.push(newBlock);
					}
				};


				// END SLITHERS
				var column: Rect = columns[columns.length - 1];
				var i = columns.length - 1;
				// Top slither
				newSlither = {
					area: {
						x: column.x + column.width - this.slitherWidth / 2,
						y: channel.gridSizes.rows[0].y,
						width: this.slitherWidth,
						height: channel.gridSizes.rows[0].height
					},
					index: i + 1,
					orientation: "top",
					channelID: channelId,
					insert: true,
					sequenceID: seqID
				};
				this.insertAreas.push(newSlither);

				// bottom slither
				newSlither = {
					area: {
						x: column.x + column.width - this.slitherWidth / 2,
						y: channel.gridSizes.rows[2].y,
						width: this.slitherWidth,
						height: channel.gridSizes.rows[2].height
					},
					index: i + 1,
					orientation: "bottom",
					channelID: channelId,
					insert: true,
					sequenceID: seqID
				};
				this.insertAreas.push(newSlither);
			})
		});
	
	}
}

function DropField() {
	let areaGenerator: DiagramDropInterpreter = new DiagramDropInterpreter(ENGINE.handler);

	return (
		<div id="drop-field">
			{areaGenerator.insertAreas?.map((insertArea) => {
				return (
					// This fixes an enormous, impossible to fix problem
					<InsertArea
						areaSpec={insertArea}
						key={
							insertArea.channelID
							+ insertArea.index
							+ insertArea.insert
							+ insertArea.orientation
						}></InsertArea>
				);
			})}
		</div>
	);
}

export default DropField;
