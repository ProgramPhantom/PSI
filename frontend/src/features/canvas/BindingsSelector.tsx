import React, { useState } from "react";
import Spacial, { SiteNames } from "../../logic/spacial";

import { ISelectedBindingInfo } from "../../logic/bindingUtil";

export type { ISelectedBindingInfo };

interface IBindingsSelectorProps {
	element: Spacial;
	onSelectBind: (info: ISelectedBindingInfo) => void;
	activeAnchorKey?: string | null;
}

const AnchorLocations: SiteNames[] = ["here", "centre", "far"];

export const BindingsSelector: React.FC<IBindingsSelectorProps> = ({ element, onSelectBind, activeAnchorKey }) => {
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);

	const left = element.x;
	const top = element.y;
	const width = element.width;
	const height = element.height;

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
					border: "1px dashed rgba(19, 124, 189, 0.5)",
					backgroundColor: "rgba(19, 124, 189, 0.04)",
					borderRadius: "2px",
					pointerEvents: "none",
					boxSizing: "border-box"
				}}
			/>

			{/* 3x3 Binding Anchor Points */}
			{AnchorLocations.map((xAnchor) =>
				AnchorLocations.map((yAnchor) => {
					const x = element.AnchorFunctions[xAnchor].get("x", false);
					const y = element.AnchorFunctions[yAnchor].get("y", false);
					const key = `${xAnchor}-${yAnchor}`;
					const isHovered = hoveredKey === key || activeAnchorKey === key;

					return (
						<div
							key={key}
							className="binding-anchor-hitbox nopan"
							style={{
								position: "absolute",
								left: x,
								top: y,
								width: "20px",
								height: "20px",
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
									point: { x, y },
									bindToContent: false
								});
							}}
							onMouseDown={(e) => {
								e.stopPropagation();
							}}
						>
							<div
								className="binding-anchor-node"
								style={{
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									backgroundColor: isHovered ? "#2b95d6" : "#137cbd",
									border: "1px solid #ffffff",
									boxShadow: isHovered
										? "0 1px 4px rgba(0, 0, 0, 0.35)"
										: "0 1px 2px rgba(0, 0, 0, 0.25)",
									transform: isHovered ? "scale(1.2)" : "scale(1)",
									transition: "transform 0.1s ease, background-color 0.1s ease",
									pointerEvents: "none",
									boxSizing: "border-box"
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
