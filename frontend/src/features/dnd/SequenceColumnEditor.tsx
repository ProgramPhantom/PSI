import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import styles from "./styles/SequenceColumnEditor.module.scss";

interface SequenceColumnEditorProps {
	sequence: Sequence;
}

export default function SequenceColumnEditor({ sequence }: SequenceColumnEditorProps) {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	if (!sequence || sequence.numColumns < 1) {
		return null;
	}

	const numCols = sequence.numColumns;
	const row0 = sequence.cells[0];
	if (!row0) {
		return null;
	}

	const BUTTON_SIZE = 10;
	const stripTop = sequence.y - BUTTON_SIZE - 6;

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
				onClick={(e) => {
					e.stopPropagation();
					ENGINE.handler.removeColumn(sequence.id, c);
				}}
				style={{
					left: `${left}px`,
					top: `${stripTop}px`
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
				onClick={(e) => {
					e.stopPropagation();
					ENGINE.handler.addColumn(sequence.id, c + 1);
				}}
				style={{
					left: `${left}px`,
					top: `${stripTop}px`
				}}>
				<span className={styles.label}>+</span>
			</button>
		);
	}

	return (
		<div id={`${sequence.id}-column-editor`} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
			{removeButtons}
			{addButtons}
		</div>
	);
}
