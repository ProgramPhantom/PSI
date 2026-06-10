import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IRectElement } from "../../logic/rectElement";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { ControlGroup, FormGroup, InputGroup, NumericInput, Section } from "@blueprintjs/core";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormGroup.module.scss";
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
					<FormGroup className={styles.simpleGroup} label="Fill" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.fill` as any}
							render={({ field }) => (
								<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
							)}></Controller>
					</FormGroup>

					<FormGroup className={styles.simpleGroup} label="Stroke" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.stroke` as any}
							render={({ field }) => (
								<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
							)}></Controller>
					</FormGroup>

					<FormGroup className={styles.simpleGroup} label="Stroke Width" labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.strokeWidth` as any}
							render={({ field }) => (
								<NumericInput
									{...field}
									className={fieldStyles.compactNumericInput}
									onValueChange={field.onChange}
									min={1}
									size={"small"}></NumericInput>
							)}></Controller>
					</FormGroup>
				</ControlGroup>
			</Section>
		</>
	);
};

export default RectElementForm;
