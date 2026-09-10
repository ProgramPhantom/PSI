import React, { useSyncExternalStore } from "react";
import { SnapStore } from "../../logic/snapping";

export const SnapGuidesOverlay: React.FC = () => {
	const guides = useSyncExternalStore(SnapStore.subscribe, SnapStore.getGuides);

	if (!guides || guides.length === 0) {
		return null;
	}

	return (
		<svg
			className="snap-guides-overlay nopan"
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 25000,
				overflow: "visible"
			}}
		>
			{guides.map((guide) => {
				const isVertical = guide.orientation === "vertical";
				return (
					<line
						key={guide.id}
						x1={isVertical ? guide.position : guide.start}
						y1={isVertical ? guide.start : guide.position}
						x2={isVertical ? guide.position : guide.end}
						y2={isVertical ? guide.end : guide.position}
						stroke="#ff3b30"
						strokeWidth={1}
						vectorEffect="non-scaling-stroke"
						strokeDasharray="none"
						opacity={0.9}
					/>
				);
			})}
		</svg>
	);
};

export default SnapGuidesOverlay;
