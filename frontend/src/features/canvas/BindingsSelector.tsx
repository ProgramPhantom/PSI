import React, { useState } from "react";
import Visual from "../../logic/visual";
import { SiteNames } from "../../logic/spacial";

export interface ISelectedBindingInfo {
	anchorObject: Visual;
	xAnchor: SiteNames;
	yAnchor: SiteNames;
	point: { x: number; y: number };
}

interface IBindingsSelectorProps {
	element: Visual;
	onSelectBind: (info: ISelectedBindingInfo) => void;
}

const AnchorLocations: SiteNames[] = ["here", "centre", "far"];

export const BindingsSelector: React.FC<IBindingsSelectorProps> = ({ element, onSelectBind }) => {
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);

	const left = element.cx;
	const top = element.cy;
	const width = element.contentWidth;
	const height = element.contentHeight;

	return (
		<div
			className="bindings-selector-container nopan"
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 10004
			}}
		>
			{/* Outline highlight around element */}
			<div
				style={{
					position: "absolute",
					left,
					top,
					width,
					height,
					border: "1.5px dashed #2b95d6",
					backgroundColor: "rgba(43, 149, 214, 0.08)",
					borderRadius: "3px",
					boxShadow: "0 0 8px rgba(43, 149, 214, 0.2)",
					pointerEvents: "none"
				}}
			/>

			{/* 3x3 Binding Anchor Points */}
			{AnchorLocations.map((xAnchor) =>
				AnchorLocations.map((yAnchor) => {
					const x = element.AnchorFunctions[xAnchor].get("x", true);
					const y = element.AnchorFunctions[yAnchor].get("y", true);
					const key = `${xAnchor}-${yAnchor}`;
					const isHovered = hoveredKey === key;

					return (
						<div
							key={key}
							className="binding-anchor-hitbox nopan"
							style={{
								position: "absolute",
								left: x,
								top: y,
								width: "24px",
								height: "24px",
								transform: "translate(-50%, -50%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								pointerEvents: "auto",
								zIndex: 10005
							}}
							onMouseEnter={() => setHoveredKey(key)}
							onMouseLeave={() => setHoveredKey(null)}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onSelectBind({
									anchorObject: element,
									xAnchor,
									yAnchor,
									point: { x, y }
								});
							}}
							onMouseDown={(e) => {
								e.stopPropagation();
							}}
						>
							<div
								className="binding-anchor-node"
								style={{
									width: isHovered ? "12px" : "8px",
									height: isHovered ? "12px" : "8px",
									borderRadius: "50%",
									backgroundColor: isHovered ? "#00c4ff" : "#137cbd",
									border: "2px solid #ffffff",
									boxShadow: isHovered
										? "0 0 10px rgba(0, 196, 255, 0.9), 0 0 4px rgba(0, 0, 0, 0.5)"
										: "0 0 4px rgba(0, 0, 0, 0.4)",
									transition: "all 0.15s ease",
									pointerEvents: "none"
								}}
							/>
						</div>
					);
				})
			)}
		</div>
	);
};

export default BindingsSelector;
