import Aligner from "../../logic/aligner";
import Channel from "../../logic/hasComponents/channel";
import SequenceAligner from "../../logic/hasComponents/sequenceAligner";
import DiagramHandler from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import Sequence, {OccupancyStatus} from "../../logic/hasComponents/sequence";
import {Visual} from "../../logic/visual";
import InsertArea, {AddSpec} from "./InsertArea";

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

		var diagram: SequenceAligner = this.handler.diagram;
		var sequences: Sequence[] = this.handler.diagram.components.sequences;
		var columnSets: Aligner<Visual>[] = sequences.map((s) => s.components.pulseColumns);
		var newSlither: AddSpec;

		Object.entries(diagram.sequenceDict).forEach(([seqID, sequence]) => {
			var channels = sequence.components.channels;
			var columns: Aligner<Visual>[] = sequence.components.pulseColumns.children;
			var noColumns = columns.length;
			var noChannels = channels.length;

			// Allowed Slither indexes
			var slitherIndexes: boolean[] = Array<boolean>(noColumns).fill(true);
			for (var channelIndex = 0; channelIndex < noChannels; channelIndex++) {
				var channel: Channel = channels[channelIndex];

				// Columns
				for (var columnIndex = 0; columnIndex < noColumns + 1; columnIndex++) {
					let preOccupancy: OccupancyStatus =
						sequence.elementMatrix[channelIndex][columnIndex - 1];
					let hereOccupancy: OccupancyStatus =
						sequence.elementMatrix[channelIndex][columnIndex];

					if (
						!(
							preOccupancy === undefined
							|| (preOccupancy === "." && hereOccupancy !== ".")
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
						sequence.elementMatrix[channelIndex][columnIndex] === undefined
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
								height:
									channel.components.topAligner.contentHeight!
									+ channel.padding[0]
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
								y: channel.components.bottomAligner.y,
								width: this.slitherWidth,
								height:
									channel.components.bottomAligner.contentHeight!
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
						var columnWidth =
							column.contentWidth === undefined ? 0 : column.contentWidth;
						var upperAlignerHeight =
							channel.components.topAligner.contentHeight === undefined
								? 0
								: channel.components.topAligner.contentHeight;
						var lowerAlignerHeight =
							channel.components.bottomAligner.contentHeight === undefined
								? 0
								: channel.components.bottomAligner.contentHeight;

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
								y: channel.components.bottomAligner.y,
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
			var column: Aligner<Visual> = columns[columns.length - 1];
			var i = columns.length - 1;
			if (column === undefined) {
				// no positional columns yet
				column = sequence.components.labelColumn;
			}
			// insert end slithers:
			Object.entries(sequence.channelsDict).forEach(([name, channel]) => {
				// insert end slithers
				var upperAlignerHeight =
					channel.components.topAligner.contentHeight === undefined
						? 0
						: channel.components.topAligner.contentHeight;
				var lowerAlignerHeight =
					channel.components.bottomAligner.contentHeight === undefined
						? 0
						: channel.components.bottomAligner.contentHeight;

				// Top slither
				newSlither = {
					area: {
						x: (column.getFar("x") ?? 0) - this.slitherWidth / 2,
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
						x: (column.getFar("x") ?? 0) - this.slitherWidth / 2,
						y: channel.components.bottomAligner.y,
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
