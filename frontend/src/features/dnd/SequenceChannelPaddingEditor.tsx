import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Colors } from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import Sequence from "../../logic/hasComponents/sequence";
import styles from "./styles/SequenceChannelPaddingEditor.module.scss";

interface SequenceChannelPaddingEditorProps {
	sequence: Sequence;
	scale?: number;
}

interface ChannelPaddingInputProps {
	channelId: string;
	type: "top" | "bottom";
	paddingValue: number;
	x: number;
	y: number;
	onHoverChange: (hovered: boolean) => void;
	onEditingChange: (isEditing: boolean) => void;
}

function ChannelPaddingInput({
	channelId,
	type,
	paddingValue,
	x,
	y,
	onHoverChange,
	onEditingChange
}: ChannelPaddingInputProps) {
	const [text, setText] = useState<string>(String(paddingValue));
	const [isFocused, setIsFocused] = useState<boolean>(false);

	// Synchronize text when external paddingValue updates while not actively editing
	useEffect(() => {
		if (!isFocused) {
			setText(String(paddingValue));
		}
	}, [paddingValue, isFocused]);

	const commitChange = (val: string) => {
		const parsed = parseFloat(val);
		if (!isNaN(parsed)) {
			const finalVal = Math.max(0, Math.round(parsed));
			setText(String(finalVal));
			if (finalVal !== paddingValue) {
				ENGINE.handler.setChannelPadding(
					channelId,
					type === "top" ? { top: finalVal } : { bottom: finalVal }
				);
			}
		} else {
			setText(String(paddingValue));
		}
	};

	const handleBlur = () => {
		setIsFocused(false);
		onEditingChange(false);
		commitChange(text);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			(e.target as HTMLInputElement).blur();
		} else if (e.key === "Escape") {
			setText(String(paddingValue));
			(e.target as HTMLInputElement).blur();
		}
	};

	// Calculate a dynamic width based on character count so it fits snugly
	const inputWidth = Math.max(10, text.length * 5.5 + 2);

	return (
		<div
			className={`${styles.paddingIndicator} ${isFocused ? styles.active : ""}`}
			style={{
				left: `${x}px`,
				top: `${y}px`
			}}
			title={`Channel ${type} padding (${paddingValue}px)`}
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			onClick={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
		>
			<input
				type="text"
				className={styles.paddingInput}
				style={{ width: `${inputWidth}px` }}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onFocus={(e) => {
					e.target.select();
					setIsFocused(true);
					onEditingChange(true);
				}}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
			/>
			<span className={styles.paddingSuffix}>px</span>
		</div>
	);
}

export default function SequenceChannelPaddingEditor({ sequence }: SequenceChannelPaddingEditorProps) {
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [editingCount, setEditingCount] = useState<number>(0);
	const [hoveredPadding, setHoveredPadding] = useState<{ channelId: string; type: "top" | "bottom" } | null>(null);

	if (!sequence || !sequence.channels || sequence.channels.length === 0) {
		return null;
	}

	const isVisible = isHovered || editingCount > 0;

	// Define hover area around the left side of the sequence
	const GUTTER_WIDTH = 45;
	const MARGIN_Y = 33;
	const hoverAreaLeft = sequence.x - GUTTER_WIDTH;
	const hoverAreaTop = sequence.y - MARGIN_Y;
	const hoverAreaWidth = GUTTER_WIDTH;
	const hoverAreaHeight = sequence.height + MARGIN_Y * 2;

	const textX = sequence.x - 20;

	// Render hover guide rect when hovering/editing a specific padding box
	let guideRect: React.ReactNode = null;
	if (hoveredPadding) {
		const targetChannel = sequence.channels.find((c) => c.id === hoveredPadding.channelId);
		if (targetChannel) {
			const isTop = hoveredPadding.type === "top";
			const padHeight = isTop
				? (targetChannel.padding?.[0] ?? 0)
				: (targetChannel.padding?.[2] ?? 0);
			const rectTop = isTop ? targetChannel.y : targetChannel.cy2;
			const rectLeft = targetChannel.cx;
			const rectWidth = targetChannel.contentWidth > 0 ? targetChannel.contentWidth : sequence.width;

			guideRect = (
				<div
					style={{
						position: "absolute",
						left: `${rectLeft}px`,
						top: `${rectTop}px`,
						width: `${rectWidth}px`,
						height: `${padHeight}px`,
						border: "1px solid #8a9ba8",
						backgroundColor: "rgba(138, 155, 168, 0.08)",
						boxSizing: "border-box",
						pointerEvents: "none",
						zIndex: 35000
					}}
				/>
			);
		}
	}

	return (
		<>
			{/* Hover detection area over the left gutter of the sequence */}
			<div
				className={styles.hoverArea}
				style={{
					left: `${hoverAreaLeft}px`,
					top: `${hoverAreaTop}px`,
					width: `${hoverAreaWidth}px`,
					height: `${hoverAreaHeight}px`,
					pointerEvents: "auto"
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			/>

			{/* Channel padding editable text boxes container */}
			<div
				id={`${sequence.id}-channel-padding-editor`}
				className={`${styles.editorWrapper} ${isVisible ? styles.visible : ""}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{guideRect}

				{sequence.channels.map((channel) => {
					const topPad = channel.padding?.[0] ?? 0;
					const bottomPad = channel.padding?.[2] ?? 0;
					const topPaddedCenterY = channel.y + topPad / 2;
					const bottomPaddedCenterY = channel.cy2 + bottomPad / 2;

					return (
						<React.Fragment key={`pad-editor-${channel.id}`}>
							{/* Top padding text box */}
							<ChannelPaddingInput
								channelId={channel.id}
								type="top"
								paddingValue={topPad}
								x={textX}
								y={topPaddedCenterY}
								onHoverChange={(h) => setHoveredPadding(h ? { channelId: channel.id, type: "top" } : null)}
								onEditingChange={(ed) => setEditingCount((prev) => Math.max(0, prev + (ed ? 1 : -1)))}
							/>

							{/* Bottom padding text box */}
							<ChannelPaddingInput
								channelId={channel.id}
								type="bottom"
								paddingValue={bottomPad}
								x={textX}
								y={bottomPaddedCenterY}
								onHoverChange={(h) => setHoveredPadding(h ? { channelId: channel.id, type: "bottom" } : null)}
								onEditingChange={(ed) => setEditingCount((prev) => Math.max(0, prev + (ed ? 1 : -1)))}
							/>
						</React.Fragment>
					);
				})}
			</div>
		</>
	);
}
