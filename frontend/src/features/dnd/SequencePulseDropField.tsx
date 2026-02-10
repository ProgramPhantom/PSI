import { useEffect, useState, useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import { GridCell, Subgrid } from "../../logic/grid";
import PulseInsertArea, { IPulseArea } from "./PulseInsertArea";
import Spacial, { Orientation, isPulse } from "../../logic/spacial";
import { ID } from "../../logic/point";
import Visual from "../../logic/visual";
import Channel from "../../logic/hasComponents/channel";

interface ISequencePulseDropFieldProps {
    sequence: Sequence;
}

export default function SequencePulseDropField({ sequence }: ISequencePulseDropFieldProps) {
    // Subscribe to store updates to trigger re-renders when the generic state changes
    const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
    const [insertAreas, setInsertAreas] = useState<IPulseArea[]>([]);

    const SLITHER_WIDTH = 4;

    useEffect(() => {
        const newInsertAreas: IPulseArea[] = [];
        const numRows = sequence.numRows;
        const numCols = sequence.numColumns;

        for (let row_index = 0; row_index < numRows; row_index++) {
            // Determine orientation based on channel row structure (0=top, 1=both, 2=bottom)
            // Assuming 3-row structure per channel as per Sequence.configureChannel
            let row: number = row_index % 3;
            let orientation: Orientation;
            if (row === 0) orientation = "top";
            else if (row === 1) orientation = "both";
            else orientation = "bottom";

            // Determine Target Channel ID
            let channel: Channel | undefined = sequence.getChannelOnRow(row_index);
            if (channel === undefined) { continue; } // Skip if no channel associated with row

            // Logic for slithers and blocks
            for (let col_index = 1; col_index < numCols; col_index++) {
                let cell: Spacial = sequence.cells[row_index]?.[col_index];
                if (!cell) continue;

                // 1. Left Slither (Insert)
                if (orientation !== "both") {
                    const leftSlither: IPulseArea = {
                        area: {
                            x: cell.x - SLITHER_WIDTH / 2,
                            y: cell.y,
                            width: SLITHER_WIDTH,
                            height: cell.height
                        },
                        channelID: channel.id,
                        sequenceID: sequence.id,
                        index: col_index,
                        orientation: orientation,
                        insert: true
                    };
                    newInsertAreas.push(leftSlither);
                }

                // 2. Block (Drop Zone)
                // Check 1: Is the cell empty? (Atomic + Recursive Subgrid check)
                if (!sequence.isCellEmptyAt({ row: row_index, col: col_index })) {
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
                        x: cell.x + SLITHER_WIDTH / 2,
                        y: cell.y,
                        width: cell.width - SLITHER_WIDTH,
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

            // 3. Right Slither (Insert at end)
            // Get the last cell in this row to determine position
            let lastCell = sequence.cells[row_index]?.[numCols - 1];
            if (lastCell) {
                if (orientation !== "both") {
                    const rightSlither: IPulseArea = {
                        area: {
                            x: lastCell.x + lastCell.width - SLITHER_WIDTH / 2,
                            y: lastCell.y,
                            width: SLITHER_WIDTH,
                            height: lastCell.height
                        },
                        channelID: channel.id,
                        sequenceID: sequence.id,
                        index: numCols,
                        orientation: orientation,
                        insert: true
                    };
                    newInsertAreas.push(rightSlither);
                }
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
