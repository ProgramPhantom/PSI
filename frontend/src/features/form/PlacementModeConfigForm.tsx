import { ControlGroup, Icon, IconName, Tag } from "@blueprintjs/core";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import PulsePlacement from "./placementMode/PulsePlacement";
import GridPlacement from "./placementMode/GridPlacement";
import AlignerPlacement from "./placementMode/AlignerPlacement";
import BindsPlacement from "./placementMode/BindsPlacement";

const getTypeIcon = (modeType?: string, isPulse?: boolean): IconName => {
	if (isPulse && modeType === "grid") return "pulse";
	switch (modeType) {
		case "grid":
			return "grid-view";
		case "binds":
		case "sequenceBind":
			return "link";
		case "aligner":
			return "align-left";
		case "free":
			return "hand";
		case "subgrid":
			return "grid";
		case "prefab":
			return "cube";
		default:
			return "layout";
	}
};

const getControlIcon = (controlMode?: string): IconName => {
	switch (controlMode) {
		case "auto":
			return "automatic-updates";
		case "user":
			return "user";
		default:
			return "cog";
	}
};

const formatType = (t?: string): string => {
	if (!t) return "None";
	if (t === "sequenceBind") return "Sequence Bind";
	return t.charAt(0).toUpperCase() + t.slice(1);
};

const formatControl = (c?: string): string => {
	if (!c) return "User";
	return c.charAt(0).toUpperCase() + c.slice(1);
};

export const PlacementModeConfig: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const type = useWatch({
		control,
		name: `${fullPrefix}placementMode.type`
	});
	const placementControl = useWatch({
		control,
		name: `${fullPrefix}placementControl`
	});
	const pulseLayoutConfig = useWatch({
		control,
		name: `${fullPrefix}pulseLayoutConfig`
	});

	let details: React.ReactNode = null;

	if (pulseLayoutConfig && type === "grid") {
		details = <PulsePlacement fullPrefix={fullPrefix} />;
	} else if (type === "grid") {
		details = <GridPlacement fullPrefix={fullPrefix} />;
	} else if (type === "aligner") {
		details = <AlignerPlacement fullPrefix={fullPrefix} />;
	} else if (type === "binds" || type === "sequenceBind") {
		details = <BindsPlacement fullPrefix={fullPrefix} />;
	}

	const typeIcon = getTypeIcon(type, Boolean(pulseLayoutConfig));
	const controlIcon = getControlIcon(placementControl);

	const coreRow: React.ReactNode = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "4px",
				marginTop: "4px",
				marginBottom: "4px"
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					minHeight: "22px"
				}}
			>
				<span
					style={{
						fontSize: "0.75em",
						fontWeight: 500,
						opacity: 0.75
					}}
				>
					Placement Mode
				</span>
				<Tag
					minimal
					round
					title={`Placement Type: ${type ?? "none"}`}
					style={{
						fontSize: "0.74em",
						fontWeight: 500,
						padding: "1px 6px",
						minHeight: "18px",
						display: "inline-flex",
						alignItems: "center",
						gap: "4px"
					}}
				>
					<Icon icon={typeIcon} size={10} style={{ opacity: 0.65, marginRight: "1px", position: "relative", top: "-1px" }} />
					{formatType(type)}
				</Tag>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					minHeight: "22px"
				}}
			>
				<span
					style={{
						fontSize: "0.75em",
						fontWeight: 500,
						opacity: 0.75
					}}
				>
					Control
				</span>
				<Tag
					minimal
					round
					title={`Placement Control: ${placementControl ?? "user"}`}
					style={{
						fontSize: "0.74em",
						fontWeight: 500,
						padding: "1px 6px",
						minHeight: "18px",
						display: "inline-flex",
						alignItems: "center",
						gap: "4px"
					}}
				>
					<Icon icon={controlIcon} size={10} style={{ opacity: 0.65, marginRight: "1px", position: "relative", top: "-1px" }} />
					{formatControl(placementControl)}
				</Tag>
			</div>
		</div>
	);

	return (
		<ControlGroup vertical={true} >
			{coreRow}
			{placementControl === "auto" && type !== "binds" && type !== "sequenceBind" ? null : details}
		</ControlGroup>
	);
};

export default PlacementModeConfig;
