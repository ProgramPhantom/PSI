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

			Object.entries(sequence.channelsDict).forEach(([channelId, channel], channelIndex) => {
				var columns: Rect[] = channel.gridSizes.columns;
				var noColumns = columns.length;

				// Allowed Slither indexes
				var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);

				// Compute indexes of the slithers
				for (var columnIndex = 0; columnIndex < noColumns + 1; columnIndex++) {
					let preOccupancy: GridCell =
						channel.gridMatrix[channelIndex][columnIndex - 1];
					let hereOccupancy: GridCell =
						channel.gridMatrix[channelIndex][columnIndex];

					if (
						(columnIndex !== 1 &&
						preOccupancy === undefined)
						|| (hereOccupancy?.source !== undefined)
						
					) {
						slitherIndexes[columnIndex] = false;
					}
				}
				

				// Main slithers and place blocks
				for (var columnIndex = 1; columnIndex < noColumns; columnIndex++) {
					var column = columns[columnIndex];
					let occupied: boolean =
						channel.gridMatrix[0][columnIndex] === undefined
							? false
							: true;

					// SLITHERS
					if (slitherIndexes[columnIndex]) {
						// Insert start
						// Top slither
						newSlither = {
							area: {
								x: column.x - this.slitherWidth / 2,
								y: channel.y - this.minHeight,
								width: this.slitherWidth,
								height: channel.gridSizes.rows[0].height + this.minHeight
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
								height: channel.gridSizes.rows[2].height + this.minHeight
							},
							index: columnIndex,
							orientation: "bottom",
							channelID: channelId,
							insert: true,
							sequenceID: sequence.id
						};
						this.insertAreas.push(newSlither);
					}

					// PLACE BLOCK
					if (!occupied) {
						// Top block
						var columnWidth = column.width;
						var upperAlignerHeight = channel.gridSizes.rows[0].height;
						var lowerAlignerHeight = channel.gridSizes.rows[2].height;
						let newBlock: AddSpec = {
							area: {
								x: column.x + this.slitherWidth / 2,
								y: channel.contentY - this.minHeight,
								width: columnWidth - this.slitherWidth,
								height: upperAlignerHeight + this.minHeight
							},
							index: columnIndex,
							orientation: "top",
							channelID: channelId,
							sequenceID: seqID,
							insert: false
						};
						this.insertAreas.push(newBlock);

						// Bottom block
						newBlock = {
							area: {
								x: column.x + this.slitherWidth / 2,
								y: channel.gridSizes.rows[2].y,
								width: columnWidth - this.slitherWidth,
								height: lowerAlignerHeight + this.minHeight
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

				// insert end slithers:
				
				// insert end slithers
				var lowerAlignerHeight = channel.gridSizes.rows[2].height;

				// Top slither
				newSlither = {
					area: {
						x: column.x + column.width - this.slitherWidth / 2,
						y: channel.y - this.minHeight,
						width: this.slitherWidth,
						height: channel.gridSizes.rows[0].height + this.minHeight
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
						height: channel.gridSizes.rows[2].height + this.minHeight
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
