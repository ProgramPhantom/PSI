import React from "react";
import Spacial, { SiteNames } from "../../logic/spacial";
import { ISelectedBindingInfo } from "../../logic/bindingUtil";
import { BINDING_HANDLE_SIZE } from "./bindingUtil";

export type { ISelectedBindingInfo };

interface IBindingsSelectorProps {
	element: Spacial;
	onSelectBind?: (info: ISelectedBindingInfo) => void;
	activeAnchorKey?: string | null;
}

const AnchorLocations: SiteNames[] = ["here", "centre", "far"];

const renderAnchorArrow = (xAnchor: SiteNames, yAnchor: SiteNames, stroke: string) => {
	// 8x8 SVG canvas with thin lines (strokeWidth 0.75) fitting the box snugly
	if (xAnchor === "here" && yAnchor === "here") {
		// Top-Left corner: two lines down sides, diagonal from corner
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="1.5" y1="1.5" x2="6" y2="1.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="1.5" y1="1.5" x2="1.5" y2="6" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="2" y1="2" x2="5.5" y2="5.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "far" && yAnchor === "here") {
		// Top-Right corner
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="6.5" y1="1.5" x2="2" y2="1.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6.5" y1="1.5" x2="6.5" y2="6" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6" y1="2" x2="2.5" y2="5.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "here" && yAnchor === "far") {
		// Bottom-Left corner
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="1.5" y1="6.5" x2="6" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="1.5" y1="6.5" x2="1.5" y2="2" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="2" y1="6" x2="5.5" y2="2.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "far" && yAnchor === "far") {
		// Bottom-Right corner
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="6.5" y1="6.5" x2="2" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6.5" y1="6.5" x2="6.5" y2="2" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6" y1="6" x2="2.5" y2="2.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "centre" && yAnchor === "here") {
		// Top side: arrow pointing up to top side
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="4" y1="6.5" x2="4" y2="1.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="1.8" y1="3.5" x2="4" y2="1.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6.2" y1="3.5" x2="4" y2="1.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "centre" && yAnchor === "far") {
		// Bottom side: arrow pointing down to bottom side
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="4" y1="1.5" x2="4" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="1.8" y1="4.5" x2="4" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="6.2" y1="4.5" x2="4" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "here" && yAnchor === "centre") {
		// Left side: arrow pointing left to left side
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="6.5" y1="4" x2="1.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="3.5" y1="1.8" x2="1.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="3.5" y1="6.2" x2="1.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	if (xAnchor === "far" && yAnchor === "centre") {
		// Right side: arrow pointing right to right side
		return (
			<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
				<line x1="1.5" y1="4" x2="6.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="4.5" y1="1.8" x2="6.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
				<line x1="4.5" y1="6.2" x2="6.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			</svg>
		);
	}
	// Centre: target plus/crosshair
	return (
		<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
			<line x1="1.5" y1="4" x2="6.5" y2="4" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
			<line x1="4" y1="1.5" x2="4" y2="6.5" stroke={stroke} strokeWidth="0.75" strokeLinecap="round" />
		</svg>
	);
};

export const BindingsSelector: React.FC<IBindingsSelectorProps> = ({ element, activeAnchorKey }) => {
	const xMin = element.AnchorFunctions["here"].get("x", false);
	const xMax = element.AnchorFunctions["far"].get("x", false);
	const yMin = element.AnchorFunctions["here"].get("y", false);
	const yMax = element.AnchorFunctions["far"].get("y", false);
	const boxWidth = xMax - xMin;
	const boxHeight = yMax - yMin;

	const halfHandle = BINDING_HANDLE_SIZE / 2;
	const showMiddleX = boxWidth >= 20;
	const showMiddleY = boxHeight >= 20;
	const xAnchors = showMiddleX ? AnchorLocations : AnchorLocations.filter((a) => a !== "centre");
	const yAnchors = showMiddleY ? AnchorLocations : AnchorLocations.filter((a) => a !== "centre");

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
				zIndex: 80000
			}}
		>
			{/* Outline highlight around element using exact AnchorFunction bounds */}
			<div
				style={{
					position: "absolute",
					left: xMin,
					top: yMin,
					width: boxWidth,
					height: boxHeight,
					border: "1px dashed rgba(19, 124, 189, 0.55)",
					backgroundColor: "rgba(19, 124, 189, 0.04)",
					borderRadius: "3px",
					pointerEvents: "none",
					boxSizing: "border-box"
				}}
			/>

			{/* Binding Anchor Points (middle selectors omitted if width/height < 10px) */}
			{xAnchors.map((xAnchor) =>
				yAnchors.map((yAnchor) => {
					const x = element.AnchorFunctions[xAnchor].get("x", false);
					const y = element.AnchorFunctions[yAnchor].get("y", false);
					const key = `${xAnchor}-${yAnchor}`;
					const isHovered = activeAnchorKey === key;
					const stroke = isHovered ? "#ffffff" : "#137cbd";

					// Translate node position inward from edge by halfHandle so it lies flush inside the box boundary
					const nodeLeft = xAnchor === "here" ? x : xAnchor === "far" ? x - BINDING_HANDLE_SIZE : x - halfHandle;
					const nodeTop = yAnchor === "here" ? y : yAnchor === "far" ? y - BINDING_HANDLE_SIZE : y - halfHandle;

					return (
						<div
							key={key}
							className="binding-anchor-node nopan"
							style={{
								position: "absolute",
								left: `${nodeLeft}px`,
								top: `${nodeTop}px`,
								width: `${BINDING_HANDLE_SIZE}px`,
								height: `${BINDING_HANDLE_SIZE}px`,
								borderRadius: "1px",
								backgroundColor: isHovered ? "#137cbd" : "rgba(255, 255, 255, 0.95)",
								boxShadow: isHovered
									? "0 1px 3px rgba(19, 124, 189, 0.45)"
									: "0 0.5px 1px rgba(16, 22, 26, 0.15)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								pointerEvents: "none",
								zIndex: 2005,
								boxSizing: "border-box",
								transition: "background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease"
							}}
						>
							{renderAnchorArrow(xAnchor, yAnchor, stroke)}
						</div>
					);
				})
			)}
		</div>
	);
};

export default BindingsSelector;
