import React, { useState, useSyncExternalStore } from "react";
import { Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import styles from "./styles/SequenceColumnEditor.module.scss";

interface SequenceColumnEditorProps {
	sequence: Sequence;
}

export default function SequenceColumnEditor({ sequence }: SequenceColumnEditorProps) {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const [hoveredState, setHoveredState] = useState<{ type: "add" | "remove"; colIndex: number } | null>(null);

	if (!sequence || sequence.numColumns < 1) {
		return null;
	}

	const numCols = sequence.numColumns;
	const row0 = sequence.cells[0];
	if (!row0) {
		return null;
	}

	const BUTTON_SIZE = 10;
	const addStripTop = sequence.y - BUTTON_SIZE - 6;
	const removeStripTop = addStripTop - 8;

	const removeButtons: React.ReactNode[] = [];
	const addButtons: React.ReactNode[] = [];

	// Columns 0 and 1 are the first two columns (labels and first pulse column) and are always present.
	// For columns c >= 2: render a "-" remove button centered horizontally on the column.
	for (let c = 2; c < numCols; c++) {
		const cell = row0[c];
		if (!cell) continue;

		const xCenter = cell.x + cell.width / 2;
		const left = xCenter - BUTTON_SIZE / 2;

		removeButtons.push(
			<button
				key={`remove-col-${c}`}
				type="button"
				className={`${styles.columnEditorBtn} ${styles.removeBtn}`}
				title="Remove column"
				onMouseEnter={() => setHoveredState({ type: "remove", colIndex: c })}
				onMouseLeave={() => setHoveredState(null)}
				onClick={(e) => {
					e.stopPropagation();
					setHoveredState(null);
					ENGINE.handler.removeColumn(sequence.id, c);
				}}
				style={{
					left: `${left}px`,
					top: `${removeStripTop}px`
				}}>
				<span className={styles.label}>-</span>
			</button>
		);
	}

	// For columns c >= 1: render a "+" add button aligned at the right boundary of column c (between col c and c+1).
	for (let c = 1; c < numCols; c++) {
		const cell = row0[c];
		if (!cell) continue;

		const xBoundary = cell.x + cell.width;
		const left = xBoundary - BUTTON_SIZE / 2;

		addButtons.push(
			<button
				key={`add-col-${c}`}
				type="button"
				className={`${styles.columnEditorBtn} ${styles.addBtn}`}
				title="Insert column"
				onMouseEnter={() => setHoveredState({ type: "add", colIndex: c })}
				onMouseLeave={() => setHoveredState(null)}
				onClick={(e) => {
					e.stopPropagation();
					setHoveredState(null);
					ENGINE.handler.addColumn(sequence.id, c + 1);
				}}
				style={{
					left: `${left}px`,
					top: `${addStripTop}px`
				}}>
				<span className={styles.label}>+</span>
			</button>
		);
	}

	// Render hover effect overlay
	let hoverOverlay: React.ReactNode = null;
	if (hoveredState) {
		const targetCell = row0[hoveredState.colIndex];
		if (targetCell) {
			if (hoveredState.type === "add") {
				// Thin blue line stretching top to bottom of sequence at boundary
				const xBoundary = targetCell.x + targetCell.width;
				hoverOverlay = (
					<div
						style={{
							position: "absolute",
							left: `${xBoundary - 1}px`,
							top: `${sequence.y}px`,
							width: "1px",
							height: `${sequence.height}px`,
							backgroundColor: Colors.BLUE3,
							pointerEvents: "none",
							zIndex: 35000
						}}
					/>
				);
			} else if (hoveredState.type === "remove") {
				// Red outline rect with diagonal red line hashed fill pattern
				hoverOverlay = (
					<div
						style={{
							position: "absolute",
							left: `${targetCell.x}px`,
							top: `${sequence.y}px`,
							width: `${targetCell.width}px`,
							height: `${sequence.height}px`,
							border: `1px solid ${Colors.RED3}`,
							backgroundColor: "rgba(219, 55, 55, 0.04)",
							backgroundImage: `repeating-linear-gradient(
								-45deg,
								rgba(219, 55, 55, 0.25),
								rgba(219, 55, 55, 0.25) 2px,
								transparent 2px,
								transparent 6px
							)`,
							boxSizing: "border-box",
							pointerEvents: "none",
							zIndex: 35000
						}}
					/>
				);
			}
		}
	}

	return (
		<div id={`${sequence.id}-column-editor`} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
			{hoverOverlay}
			{removeButtons}
			{addButtons}
		</div>
	);
}
