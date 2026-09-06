import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IRectElement } from "../../logic/rectElement";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { ControlGroup, NumericInput, Section } from "@blueprintjs/core";
import { SimpleField } from "./fields/SimpleField";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface IRectFormProps extends FormRequirements { }

const RectElementForm: React.FC<IRectFormProps> = (props) => {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext<IRectElement>();

	return (
		<>
			<VisualForm target={props.target} widthDisplay={true} heightDisplay={true} prefix={props.prefix}></VisualForm>

			{/* Style stuff */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Style"}
				collapsible={true}>

				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<SimpleField label="Fill" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.fill` as any}
							render={({ field }) => (
								<input
									type={"color"}
									className={fieldStyles.compactColorInput}
									{...field}
									value={field.value}></input>
							)}></Controller>
					</SimpleField>

					<SimpleField label="Fill Opacity" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.fillOpacity` as any}
							render={({ field }) => (
								<NumericInput
									{...field}
									className={fieldStyles.compactNumericInput}
									value={field.value !== undefined ? field.value : 100}
									onValueChange={(valAsNumber, valAsString) => {
										if (valAsString === "") {
											field.onChange("");
										} else if (!isNaN(valAsNumber)) {
											field.onChange(Math.max(0, Math.min(100, Math.round(valAsNumber))));
										}
									}}
									onBlur={() => {
										field.onBlur();
										if (field.value === "" || field.value === undefined) {
											field.onChange(100);
										}
									}}
									min={0}
									max={100}
									clampValueOnBlur={true}
									stepSize={1}
									majorStepSize={10}
									size={"small"}></NumericInput>
							)}></Controller>
					</SimpleField>

					<SimpleField label="Stroke" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.stroke` as any}
							render={({ field }) => (
								<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
							)}></Controller>
					</SimpleField>

					<SimpleField label="Stroke Width" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.strokeWidth` as any}
							render={({ field }) => (
								<NumericInput
									{...field}
									className={fieldStyles.compactNumericInput}
									onValueChange={field.onChange}
									min={0}
									size={"small"}></NumericInput>
							)}></Controller>
					</SimpleField>
				</ControlGroup>
			</Section>
		</>
	);
};

export default RectElementForm;
