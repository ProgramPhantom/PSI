import React, { useEffect, useRef } from "react";

interface CanvasTextInputProps {
	x: number;
	y: number;
	onConfirm: (text: string) => void;
	onCancel: () => void;
	initialValue?: string;
	fontSize?: number;
}

export const CanvasTextInput: React.FC<CanvasTextInputProps> = ({
	x,
	y,
	onConfirm,
	onCancel,
	initialValue = "",
	fontSize = 24
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const committed = useRef(false);

	useEffect(() => {
		if (ref.current) {
			ref.current.focus();
			// Move cursor to the end of the text if there's initial value
			if (initialValue) {
				const range = document.createRange();
				const sel = window.getSelection();
				range.selectNodeContents(ref.current);
				range.collapse(false);
				if (sel) {
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	}, [initialValue]);

	const handleConfirm = () => {
		if (committed.current) return;
		committed.current = true;
		const text = ref.current?.textContent?.trim() ?? "";
		if (text) {
			onConfirm(text);
		} else {
			onCancel();
		}
	};

	const handleCancel = () => {
		if (committed.current) return;
		committed.current = true;
		onCancel();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleConfirm();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			handleCancel();
		}
	};

	return (
		<div
			className="nopan"
			style={{
				position: "absolute",
				left: x,
				top: y,
				zIndex: 10002,
				pointerEvents: "auto",
				transform: "translate(-2px, -6px)" // Slightly offset to account for border and padding alignment
			}}
		>
			<div
				ref={ref}
				contentEditable
				suppressContentEditableWarning
				onBlur={handleConfirm}
				onKeyDown={handleKeyDown}
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
				style={{
					fontSize: `${fontSize}px`,
					fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					border: "1.5px solid #106ba3",
					borderRadius: "3px",
					padding: "4px 8px",
					outline: "none",
					boxShadow: "0 0 0 1px #106ba3, 0 2px 8px rgba(16, 22, 26, 0.2)",
					background: "white",
					color: "#182026",
					minWidth: "120px",
					display: "inline-block",
					whiteSpace: "nowrap",
					caretColor: "#106ba3"
				}}
			>
				{initialValue}
			</div>
		</div>
	);
};
