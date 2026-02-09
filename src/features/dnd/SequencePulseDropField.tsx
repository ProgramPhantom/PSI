import { useEffect, useState, useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import { GridCell, Subgrid } from "../../logic/grid";
import PulseInsertArea, { IPulseArea } from "./PulseInsertArea";
import Spacial, { Orientation, isPulse } from "../../logic/spacial";
import { ID } from "../../logic/point";
import Visual from "../../logic/visual";

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
            // Assuming 3-row structure per channel as per Sequence.configureChannel
            let row: number = row_index % 3;
            let orientation: Orientation;
            if (row === 0) orientation = "top";
            else if (row === 1) orientation = "both";
            else orientation = "bottom";

            // If "both" (middle row), we determine if we want to allow drops here.
            // ChannelDropField logic typically only places inserts on Top/Bottom.
            // However, the user request says "PulseInsertAreas over the grid cells if...".
            // If we skip the middle row, we might miss valid spots if the design allows middle drops.
            // But usually pulses are Top/Bottom. 
            // I will include it if it's a valid empty cell, as per the strict instruction.

            for (let colIndex = 0; colIndex < numCols; colIndex++) {
                let gridEntry: GridCell<Visual> = sequence.getCell({ row: row_index, col: colIndex });

                let cell: Spacial = sequence.cells[row_index]?.[colIndex];
                if (!cell) continue;

                // Check 1: Is the cell empty? (Atomic + Recursive Subgrid check)
                if (!sequence.isCellEmptyAt({ row: row_index, col: colIndex })) {
                    continue;
                }

                // Determine Target Channel ID
                const channel = sequence.getChannelOnRow(row_index);

                // Check 1.5: Middle Row Blocking
                // If we are on Top or Bottom row, we must check if the Middle row (index 1 of the strip) is occupied by a pulse.
                if (channel && (orientation === "top" || orientation === "bottom")) {
                    if (channel.colHasCentralPulse(colIndex)) {
                        continue;
                    }
                }

                // Determine Target Channel ID (Logic from before, simplified as we have channel object)
                let targetID: ID;

                if (channel) {
                    targetID = channel.id;
                } else {
                    targetID = sequence.id;
                }

                const area: IPulseArea = {
                    area: {
                        x: cell.x,
                        y: cell.y,
                        width: cell.width,
                        height: cell.height
                    },
                    channelID: targetID,
                    sequenceID: sequence.id,
                    index: colIndex,
                    orientation: orientation,
                    insert: false
                };

                newInsertAreas.push(area);
            }
            setInsertAreas(newInsertAreas);
        }
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
