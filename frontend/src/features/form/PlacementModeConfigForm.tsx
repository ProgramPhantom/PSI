import { Card, ControlGroup } from "@blueprintjs/core";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import styles from "./styles/FormContainers.module.scss";
import PulsePlacement from "./placementMode/PulsePlacement";
import GridPlacement from "./placementMode/GridPlacement";
import AlignerPlacement from "./placementMode/AlignerPlacement";
import BindsPlacement from "./placementMode/BindsPlacement";

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
	} else if (type === "binds") {
		details = <BindsPlacement fullPrefix={fullPrefix} />;
	}

	const coreRow: React.ReactNode = (
		<Card style={{ marginTop: "8px", padding: 0, display: "flex", flexDirection: "row" }}>
			<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
				Type: {type}
			</div>
			<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
				Control: {placementControl}
			</div>
		</Card>
	);

	return (
		<ControlGroup vertical={true} className={styles.formGroupContainer}>
			{coreRow}
			{placementControl === "auto" && type !== "binds" ? null : details}
		</ControlGroup>
	);
};

export default PlacementModeConfig;
