import DiagramHandler from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import Channel from "../../logic/hasComponents/channel";
import Diagram from "../../logic/hasComponents/diagram";
import Sequence from "../../logic/hasComponents/sequence";
import Visual from "../../logic/visual";
import InsertArea, { AddSpec } from "./InsertArea";

interface Rect {x: number, y: number, width: number, height: number}



class DiagramDropInterpreter {
	public handler: DiagramHandler;
	public insertAreas: AddSpec[];
	private slitherWidth: number = 4;

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
			var channels = sequence.channels;
			var columns: Rect[] = sequence.gridSizes.columns;
			var noColumns = columns.length;
			var noChannels = channels.length;

			// Allowed Slither indexes
			var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);
			for (var channelIndex = 0; channelIndex < noChannels; channelIndex++) {
				var channel: Channel = channels[channelIndex];

				// Columns
				for (var columnIndex = 0; columnIndex < noColumns + 1; columnIndex++) {
					let preOccupancy: Visual | undefined =
						sequence.gridMatrix[channelIndex][columnIndex - 1];
					let hereOccupancy: Visual | undefined =
						sequence.gridMatrix[channelIndex][columnIndex];

					if (
						!(
							preOccupancy === undefined
							|| (preOccupancy instanceof Visual
								&& hereOccupancy instanceof Visual
								&& preOccupancy !== hereOccupancy)
						)
					) {
						slitherIndexes[columnIndex] = false;
					}
				}
			}

			columns.forEach((column, columnIndex) => {
				var heightTop;
				var heightBottom;

				Object.entries(sequence.channelsDict).forEach(([chanID, channel], channelIndex) => {
					let occupied: boolean =
						sequence.gridMatrix[channelIndex][columnIndex] === undefined
							? false
							: true;

					if (slitherIndexes[columnIndex]) {
						// Insert start
						// Top slither
						newSlither = {
							area: {
								x: column.x - this.slitherWidth / 2,
								y: channel.y,
								width: this.slitherWidth,
								height: channel.gridSizes.rows[0].height
							},
							index: columnIndex,
							orientation: "top",
							channelID: chanID,
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
								height:
									channel.gridSizes.rows[2].height
									+ channel.padding[2]
							},
							index: columnIndex,
							orientation: "bottom",
							channelID: chanID,
							insert: true,
							sequenceID: sequence.id
						};
						this.insertAreas.push(newSlither);
					}

					if (!occupied) {
						// Top block
						var columnWidth = column.width;
						var upperAlignerHeight = channel.gridSizes.rows[0].height;
						var lowerAlignerHeight = channel.gridSizes.rows[2].height;
						let newBlock: AddSpec = {
							area: {
								x: column.x + this.slitherWidth / 2,
								y: channel.contentY,
								width: columnWidth - this.slitherWidth,
								height: upperAlignerHeight
							},
							index: columnIndex,
							orientation: "top",
							channelID: chanID,
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
								height: lowerAlignerHeight
							},
							index: columnIndex,
							orientation: "bottom",
							channelID: chanID,
							sequenceID: seqID,
							insert: false
						};
						this.insertAreas.push(newBlock);
					}
				});
			});

			// END SLITHERS
			var column: Rect = columns[columns.length - 1];
			var i = columns.length - 1;


			// insert end slithers:
			Object.entries(sequence.channelsDict).forEach(([name, channel]) => {
				// insert end slithers
							
				var upperAlignerHeight = channel.gridSizes.rows[0].height;
				var lowerAlignerHeight = channel.gridSizes.rows[2].height;

				// Top slither
				newSlither = {
					area: {
						x: column.x + column.width - this.slitherWidth / 2,
						y: channel.y,
						width: this.slitherWidth,
						height: upperAlignerHeight
					},
					index: i + 1,
					orientation: "top",
					channelID: name,
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
						height: lowerAlignerHeight + channel.padding[2]
					},
					index: i + 1,
					orientation: "bottom",
					channelID: name,
					insert: true,
					sequenceID: seqID
				};
				this.insertAreas.push(newSlither);
			});
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
