import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Alert, Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import styles from "./styles/SequenceColumnEditor.module.scss";

interface SequenceColumnEditorProps {
	sequence: Sequence;
	scale?: number;
}

interface IDragState {
	colIndex: number;
	startX: number;
	initialWidth: number;
	currentDelta: number;
}

export default function SequenceColumnEditor({ sequence, scale = 1 }: SequenceColumnEditorProps) {
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const [hoveredState, setHoveredState] = useState<{ type: "add" | "remove"; colIndex: number } | null>(null);
	const [pendingDeleteCol, setPendingDeleteCol] = useState<number | null>(null);
	const [draggingHandle, setDraggingHandle] = useState<IDragState | null>(null);

	// Handle window mousemove and mouseup listeners when dragging a column resize handle
	useEffect(() => {
		if (!draggingHandle) return;

		const handleMouseMove = (e: MouseEvent) => {
			const deltaPixels = e.clientX - draggingHandle.startX;
			const deltaDiagram = deltaPixels / scale;
			const targetWidth = Math.max(10, draggingHandle.initialWidth + deltaDiagram);
			const currentDelta = targetWidth - draggingHandle.initialWidth;

			setDraggingHandle((prev) => (prev ? { ...prev, currentDelta } : null));
		};

		const handleMouseUp = (e: MouseEvent) => {
			const deltaPixels = e.clientX - draggingHandle.startX;
			const deltaDiagram = deltaPixels / scale;
			const finalWidth = Math.max(10, draggingHandle.initialWidth + deltaDiagram);

			// Commit column width change via DiagramHandler on mouse release
			ENGINE.handler.setColumnWidth(sequence.id, draggingHandle.colIndex, finalWidth);

			setDraggingHandle(null);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [draggingHandle, sequence, scale]);

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
	const resizeHandles: React.ReactNode[] = [];

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
					if (sequence.colHasNonStructureElement(c)) {
						setPendingDeleteCol(c);
					} else {
						ENGINE.handler.removeColumn(sequence.id, c);
					}
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

	// Render grey vertical resize handle lines at each column boundary (right edge of column c) in-line with buttons
	for (let c = 1; c < numCols; c++) {
		const cell = row0[c];
		if (!cell) continue;

		const xBoundary = cell.x + cell.width;
		const left = xBoundary - BUTTON_SIZE / 2;

		resizeHandles.push(
			<button
				key={`resize-col-${c}`}
				type="button"
				className={styles.resizeHandle}
				title="Drag to resize column"
				onMouseDown={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setDraggingHandle({
						colIndex: c,
						startX: e.clientX,
						initialWidth: cell.width,
						currentDelta: 0
					});
				}}
				style={{
					left: `${left}px`,
					top: `${addStripTop - 10}px`
				}}>
				<div className={styles.line} />
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

	// Render real-time drag preview line while dragging
	let dragPreview: React.ReactNode = null;
	if (draggingHandle) {
		const targetCell = row0[draggingHandle.colIndex];
		if (targetCell) {
			const previewX = targetCell.x + targetCell.width + draggingHandle.currentDelta;
			dragPreview = (
				<div
					style={{
						position: "absolute",
						left: `${previewX - 1}px`,
						top: `${sequence.y}px`,
						width: "2px",
						height: `${sequence.height}px`,
						backgroundColor: Colors.BLUE3,
						pointerEvents: "none",
						zIndex: 37000
					}}
				/>
			);
		}
	}

	return (
		<>
			<div id={`${sequence.id}-column-editor`} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
				{hoverOverlay}
				{dragPreview}
				{removeButtons}
				{addButtons}
				{resizeHandles}
			</div>

			<Alert
				cancelButtonText="Cancel"
				confirmButtonText="Delete Column"
				icon="warning-sign"
				intent="danger"
				isOpen={pendingDeleteCol !== null}
				onCancel={() => setPendingDeleteCol(null)}
				onConfirm={() => {
					if (pendingDeleteCol !== null) {
						ENGINE.handler.removeColumn(sequence.id, pendingDeleteCol);
						setPendingDeleteCol(null);
					}
				}}
			>
				<p style={{ margin: 0 }}>
					This column contains pulses. Are you sure you want to delete it?
				</p>
			</Alert>
		</>
	);
}
