import {
	HTMLSelect,
	NumericInput,
	Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DoubleField } from "../fields/DoubleField";
import { SimpleField } from "../fields/SimpleField";
import styles from "../styles/FormContainers.module.scss";
import fieldStyles from "../styles/FormFields.module.scss";

export const GridPlacement: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();

	return (
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
};

export default GridPlacement;
