import {
	Card,
	HTMLSelect,
	NumericInput,
	Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { DoubleField } from "../fields/DoubleField";
import { SimpleField } from "../fields/SimpleField";
import fieldStyles from "../styles/FormFields.module.scss";

export const PulsePlacement: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const pulseLayoutConfig = useWatch({
		control,
		name: `${fullPrefix}pulseLayoutConfig`
	});

	return (
		<>
			{/* Read-only fields */}
			<Card
				style={{
					padding: "4px 8px",
					fontSize: "0.8em",
					opacity: 0.7,
					display: "flex",
					justifyContent: "space-between"
				}}
			>
				<span>Index: {pulseLayoutConfig?.index ?? "-"}</span>
				<span>ChannelID: {pulseLayoutConfig?.channelID ?? "-"}</span>
				<span>SequenceID: {pulseLayoutConfig?.sequenceID ?? "-"}</span>
			</Card>

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
						<NumericInput
							{...field}
							className={fieldStyles.compactNumericInput}
							onValueChange={field.onChange}
							min={1}
							max={10}
							size="small"
							fill
						/>
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
};

export default PulsePlacement;
