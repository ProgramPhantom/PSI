import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { useAppSelector } from "../../redux/hooks";

export const SequenceColumnsOverlay: React.FC = () => {
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
					return (
						<div
							key={`${sequence.id}-col-overlay-${idx}`}
							style={{
								position: "absolute",
								left: col.x,
								top: col.y,
								width: col.width,
								height: col.height,
								borderLeft: "1px dashed rgba(19, 124, 189, 0.4)",
								borderRight: idx === sequence.gridSizes.columns.length - 1 ? "1px dashed rgba(19, 124, 189, 0.4)" : "none",
								backgroundColor: "rgba(19, 124, 189, 0.02)",
								boxSizing: "border-box",
								pointerEvents: "none"
							}}
						>
							<div
								style={{
									position: "absolute",
									top: "-18px",
									left: "50%",
									transform: "translateX(-50%)",
									fontSize: "7px",
									fontWeight: 600,
									color: "#137cbd",
									opacity: 0.7,
									letterSpacing: "0.5px",
									userSelect: "none",
									whiteSpace: "nowrap"
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
