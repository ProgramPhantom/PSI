import {
	HTMLSelect,
	Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { DoubleField } from "../fields/DoubleField";
import fieldStyles from "../styles/FormFields.module.scss";

export const AlignerPlacement: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const placementMode = useWatch({
		control,
		name: `${fullPrefix}placementMode`
	});

	return (
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
};

export default AlignerPlacement;
