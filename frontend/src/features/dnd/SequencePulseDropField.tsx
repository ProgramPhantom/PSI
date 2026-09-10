import { useEffect, useState, useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import PulseInsertArea, { IPulseArea } from "./PulseInsertArea";
import Spacial, { Orientation } from "../../logic/spacial";
import Channel from "../../logic/hasComponents/channel";

interface ISequencePulseDropFieldProps {
	sequence: Sequence;
}

export default function SequencePulseDropField({ sequence }: ISequencePulseDropFieldProps) {
	// Subscribe to store updates to trigger re-renders when the generic state changes
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const [insertAreas, setInsertAreas] = useState<IPulseArea[]>([]);

	useEffect(() => {
		const newInsertAreas: IPulseArea[] = [];
		const numRows = sequence.numRows;
		const numCols = sequence.numColumns;

		for (let row_index = 0; row_index < numRows; row_index++) {
			// Determine orientation based on channel row structure (0=top, 1=both, 2=bottom)
			let row: number = row_index % 3;
			let orientation: Orientation;
			if (row === 0) orientation = "top";
			else if (row === 1) orientation = "both";
			else orientation = "bottom";

			// Determine Target Channel ID
			let channel: Channel | undefined = sequence.getChannelOnRow(row_index);
			if (channel === undefined) { continue; } // Skip if no channel associated with row

			// Block drop zones for each data column
			for (let col_index = 1; col_index < numCols; col_index++) {
				let cell: Spacial = sequence.cells[row_index]?.[col_index];
				if (!cell) continue;

				// Check 1: Is the cell empty? (Atomic + Recursive Subgrid check)
				if (!sequence.doesCellHaveCellChildAt({ row: row_index, col: col_index })) {
					continue;
				}

				// Check 1.5: Middle Row Blocking
				// If we are on Top or Bottom row, we must check if the Middle row (index 1 of the strip) is occupied by a pulse.
				if (orientation === "top") {
					if (sequence.cellHasNonStructureElement({ row: row_index + 1, col: col_index })) {
						continue;
					}
				} else if (orientation === "bottom") {
					if (sequence.cellHasNonStructureElement({ row: row_index - 1, col: col_index })) {
						continue;
					}
				}

				const blockArea: IPulseArea = {
					area: {
						x: cell.x,
						y: cell.y,
						width: cell.width,
						height: cell.height
					},
					channelID: channel.id,
					sequenceID: sequence.id,
					index: col_index,
					orientation: orientation,
					insert: false
				};
				newInsertAreas.push(blockArea);
			}
		}
		setInsertAreas(newInsertAreas);
	}, [store, sequence]);

	return (
		<div id={`${sequence.id}-drop-field`}>
			{insertAreas.map((insertArea) => {
				return (
					<PulseInsertArea
						areaSpec={insertArea}
						key={
							insertArea.channelID
							+ insertArea.index
							+ insertArea.insert
							+ insertArea.orientation
							// Add randomness or unique ID if keys overlap? 
							// Using a composite key should be fine if unique per slot.
						}
					/>
				);
			})}
		</div>
	);
}
