import React, { useEffect, useRef } from "react";
import { InputGroup } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import { defaultText } from "../../logic/default/index";
import { ClearIDs } from "../../logic/collection";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId, setSelectedTool } from "../../redux/slices/applicationSlice";

interface CanvasTextInputProps {
	x: number;
	y: number;
	onClose: () => void;
	initialValue?: string;
}

export const CanvasTextInput: React.FC<CanvasTextInputProps> = ({
	x,
	y,
	onClose,
	initialValue = ""
}) => {
	const dispatch = useAppDispatch();
	const inputRef = useRef<HTMLInputElement>(null);
	const committed = useRef(false);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const handleConfirm = () => {
		if (committed.current) return;
		committed.current = true;
		const text = inputRef.current?.value.trim() ?? "";
		if (text) {
			const newText = structuredClone(defaultText);
			ClearIDs(newText);
			newText.id = Math.random().toString(16).slice(2);
			newText.x = x;
			newText.y = y;
			newText.text = text;
			newText.parentId = ENGINE.handler.diagram.id;
			newText.placementMode = {
				type: "free"
			};

			ENGINE.handler.act({
				type: "add",
				input: {
					child: newText
				}
			});

			dispatch(setSelectedElementId(newText.id));
			dispatch(setSelectedTool({ type: "select", config: {} }));
		} else {
			dispatch(setSelectedTool({ type: "select", config: {} }));
		}
		onClose();
	};

	const handleCancel = () => {
		if (committed.current) return;
		committed.current = true;
		dispatch(setSelectedTool({ type: "select", config: {} }));
		onClose();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
				transform: "translate(-2px, -6px)"
			}}
		>
			<InputGroup
				inputRef={inputRef}
				autoFocus
				placeholder="Type text..."
				defaultValue={initialValue}
				onBlur={handleConfirm}
				onKeyDown={handleKeyDown}
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
				size="small"
				style={{
					width: "120px"
				}}
			/>
		</div>
	);
};
