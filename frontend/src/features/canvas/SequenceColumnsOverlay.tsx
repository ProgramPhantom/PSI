import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { useAppSelector } from "../../redux/hooks";
import Spacial from "../../logic/spacial";

interface SequenceColumnsOverlayProps {
	hoveredElement?: Spacial;
}

export const SequenceColumnsOverlay: React.FC<SequenceColumnsOverlayProps> = ({ hoveredElement }) => {
	const columnMode = useAppSelector((state) => state.application.columnMode);
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	if (!columnMode) {
		return null;
	}

	return (
		<div
			className="sequence-columns-overlay nopan"
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 10000
			}}
		>
			{ENGINE.handler.sequences.map((sequence) => {
				if (!sequence.gridSizes?.columns || sequence.gridSizes.columns.length === 0) {
					return null;
				}

				return sequence.gridSizes.columns.map((col, idx) => {
					const isEven = idx % 2 === 0;
					const isHovered = hoveredElement?.id === col.id;
					return (
						<div
							key={`${sequence.id}-col-overlay-${idx}`}
							style={{
								position: "absolute",
								left: col.x,
								top: col.y,
								width: col.width,
								height: col.height,
								backgroundColor: isHovered
									? "rgba(19, 124, 189, 0.22)"
									: isEven
										? "rgba(16, 22, 26, 0.08)"
										: "rgba(16, 22, 26, 0.15)",
								boxSizing: "border-box",
								pointerEvents: "none"
							}}
						>
							<div
								style={{
									position: "absolute",
									top: "-15px",
									left: "50%",
									transform: "translateX(-50%)",
									fontSize: "8px",
									fontWeight: 600,
									color: isHovered ? "#ffffff" : "#106ba3",
									backgroundColor: isHovered ? "#106ba3" : "rgba(255, 255, 255, 0.9)",
									padding: "0 4px",
									borderRadius: "3px",
									border: isHovered ? "1px solid #106ba3" : "1px solid rgba(19, 124, 189, 0.3)",
									boxShadow: isHovered ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 1px 2px rgba(0, 0, 0, 0.08)",
									letterSpacing: "0.5px",
									userSelect: "none",
									whiteSpace: "nowrap",
									pointerEvents: "none"
								}}
							>
								Col {idx}
							</div>
						</div>
					);
				});
			})}
		</div>
	);
};

export default SequenceColumnsOverlay;
