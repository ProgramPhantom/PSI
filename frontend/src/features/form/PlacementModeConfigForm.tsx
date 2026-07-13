import {
	Card,
	ControlGroup,
	HTMLSelect,
	NumericInput,
	Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SimpleField } from "./fields/SimpleField";
import { DoubleField } from "./fields/DoubleField";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

export const PlacementModeConfig: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const type = useWatch({
		control,
		name: `${fullPrefix}placementMode.type`
	});
	const placementMode = useWatch({
		control,
		name: `${fullPrefix}placementMode`
	});
	const placementControl = useWatch({
		control,
		name: `${fullPrefix}placementControl`
	});
	const pulseLayoutConfig = useWatch({
		control,
		name: `${fullPrefix}pulseLayoutConfig`
	});

	let details: React.ReactNode;
	let coreRow: React.ReactNode = (
		<>
			<Card style={{ marginTop: "8px", padding: 0, display: "flex", flexDirection: "row" }}>
				<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
					Type: {type}
				</div>
				<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
					Control: {placementControl}
				</div>
			</Card>
		</>
	);


	if (pulseLayoutConfig && type === "grid") {
		details = (
			<>

				{/* Read-only fields */}
				<Card style={{
					padding: "4px 8px",
					fontSize: "0.8em", opacity: 0.7,
					display: "flex", justifyContent: "space-between"
				}}>
					<span>Index: {pulseLayoutConfig?.index ?? "-"}</span>
					<span>ChannelID: {pulseLayoutConfig?.channelID ?? "-"}</span>
					<span>SequenceID: {pulseLayoutConfig?.sequenceID ?? "-"}</span>
				</Card >

				<SimpleField label="Orientation">
					<Controller
						control={control}
						name={`${fullPrefix}pulseLayoutConfig.orientation`}
						defaultValue="top"
						render={({ field }) => (
							<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
								<option value="top">Top</option>
								<option value="bottom">Bottom</option>
								<option value="both">Both</option>
							</HTMLSelect>
						)}
					/>
				</SimpleField>

				<DoubleField
					label="Align"
					leftLabel="X"
					leftField={
						<Controller
							control={control}
							name={`${fullPrefix}pulseLayoutConfig.alignment.x`}
							defaultValue="here"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Left</option>
									<option value="centre">Centre</option>
									<option value="far">Right</option>
								</HTMLSelect>
							)}
						/>
					}
					rightLabel="Y"
					rightField={
						<Controller
							control={control}
							name={`${fullPrefix}pulseLayoutConfig.alignment.y`}
							defaultValue="far"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Top</option>
									<option value="centre">Centre</option>
									<option value="far">Bottom</option>
								</HTMLSelect>
							)}
						/>
					}
				/>

				<SimpleField label="No. Sections">
					<Controller
						control={control}
						name={`${fullPrefix}pulseLayoutConfig.noSections`}
						defaultValue={1}
						render={({ field }) => (
							<NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} max={10} size="small" fill />
						)}
					/>
				</SimpleField>

				<SimpleField inline label="Clip Channel Bar">
					<Controller
						control={control}
						name={`${fullPrefix}pulseLayoutConfig.clipBar`}
						render={({ field }) => (
							<Switch {...field} onChange={field.onChange} checked={field.value} className={fieldStyles.compactSwitch} />
						)}
					/>
				</SimpleField>
			</>
		);
	} else if (type === "grid") {
		details = (
			<>
				<div className={styles.inlineContainer}>
					<SimpleField label="Row">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.coords.row`}
							defaultValue={0}
							render={({ field }) => (
								<NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={0} size="small" fill />
							)}
						/>
					</SimpleField>
					<SimpleField label="Col">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.coords.col`}
							defaultValue={0}
							render={({ field }) => (
								<NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={0} size="small" fill />
							)}
						/>
					</SimpleField>
				</div>

				<div className={styles.inlineContainer}>
					<SimpleField label="Row Span">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.gridSize.noRows`}
							defaultValue={1}
							render={({ field }) => (
								<NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} size="small" fill />
							)}
						/>
					</SimpleField>
					<SimpleField label="Col Span">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.gridSize.noCols`}
							defaultValue={1}
							render={({ field }) => (
								<NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} size="small" fill />
							)}
						/>
					</SimpleField>
				</div>

				<DoubleField
					label="Align"
					leftLabel="X"
					leftField={
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.alignment.x`}
							defaultValue="here"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Here</option>
									<option value="centre">Centre</option>
									<option value="far">Far</option>
								</HTMLSelect>
							)}
						/>
					}
					rightLabel="Y"
					rightField={
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.alignment.y`}
							defaultValue="here"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Here</option>
									<option value="centre">Centre</option>
									<option value="far">Far</option>
								</HTMLSelect>
							)}
						/>
					}
				/>

				<div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.contribution.x`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Contribute X" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.contribution.y`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Contribute Y" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
				</div>
			</>
		);
	} else if (type === "aligner") {
		details = (
			<>
				<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
					Index: {placementMode?.config?.index ?? "N/A"}
				</div>

				<DoubleField
					label="Align"
					leftLabel="Main"
					leftField={
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.alignment.mainAxis`}
							defaultValue="centre"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Here</option>
									<option value="centre">Centre</option>
									<option value="far">Far</option>
								</HTMLSelect>
							)}
						/>
					}
					rightLabel="Cross"
					rightField={
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.config.alignment.crossAxis`}
							defaultValue="centre"
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
									<option value="here">Here</option>
									<option value="centre">Centre</option>
									<option value="far">Far</option>
								</HTMLSelect>
							)}
						/>
					}
				/>

				<div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.contribution.mainAxis`}
						defaultValue={true}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Main Axis" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.contribution.crossAxis`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Cross Axis" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{coreRow}
				{placementControl === "auto" ? null : details}
			</ControlGroup>
		</>
	);
};
