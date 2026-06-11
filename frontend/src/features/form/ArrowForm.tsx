import { ControlGroup, HTMLSelect, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { FormRequirements } from "./FormBase";
import { DoubleField } from "./fields/DoubleField";
import { SimpleField } from "./fields/SimpleField";
import fieldStyles from "./styles/FormFields.module.scss";
import styles from "./styles/FormContainers.module.scss";
import sectionStyles from "./styles/FormSection.module.scss";
import VisualForm from "./VisualForm";

interface IArrowFormProps extends FormRequirements { }

function ArrowForm(props: IArrowFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Style */}
				<Section
					className={sectionStyles.minimalSection}
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Style"}
					collapsible={true}>
					<ControlGroup vertical={true} className={styles.formGroupContainer}>
						<SimpleField
							fill={true}
							label="Stroke thickness"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}thickness`}
								render={({ field }) => (
									<NumericInput
										{...field} size="small"
										className={fieldStyles.compactNumericInput}
										onValueChange={field.onChange}
										min={1}></NumericInput>
								)}></Controller>
						</SimpleField>

						<SimpleField
							label="Stroke"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}lineStyle.stroke`}
								render={({ field }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
								)}></Controller>
						</SimpleField>

						<DoubleField
							label="Dashing"
							leftLabel="Dash"
							leftField={
								<Controller
									control={formControls.control}
									name={`${fullPrefix}lineStyle.dashing.0`}
									render={({ field }) => (
										<NumericInput fill={true}
											{...field}
											className={fieldStyles.compactNumericInput}
											min={-100}
											max={100}
											onValueChange={field.onChange}
											size="small"
										></NumericInput>
									)}></Controller>
							}
							rightLabel="Gap"
							rightField={
								<Controller
									control={formControls.control}
									name={`${fullPrefix}lineStyle.dashing.1`}
									render={({ field }) => (
										<NumericInput fill={true}
											{...field}
											className={fieldStyles.compactNumericInput}
											min={-100}
											max={100}
											onValueChange={field.onChange}
											size="small"></NumericInput>
									)}></Controller>
							}
						/>
					</ControlGroup>
				</Section>

				{/* Arrowhead style */}
				<DoubleField
					label="Arrowheads"
					leftLabel="Start"
					leftField={
						<Controller
							control={formControls.control}
							name={`${fullPrefix}lineStyle.headStyle.0`}
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down">
									<option value={"default"}>Default</option>
									<option value={"thin"}>Thin</option>
									<option value={"none"}>None</option>
								</HTMLSelect>
							)}></Controller>
					}
					rightLabel="End"
					rightField={
						<Controller
							control={formControls.control}
							name={`${fullPrefix}lineStyle.headStyle.1`}
							render={({ field }) => (
								<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down">
									<option value={"default"}>Default</option>
									<option value={"thin"}>Thin</option>
									<option value={"none"}>None</option>
								</HTMLSelect>
							)}></Controller>
					}
				/>

				{/* Adjustment */}
				<DoubleField
					label="Adjustment"
					leftLabel="Start"
					leftField={
						<Controller
							control={formControls.control}
							name={`${fullPrefix}adjustment.0`}
							render={({ field }) => (
								<NumericInput fill={true}
									{...field}
									className={fieldStyles.compactNumericInput}
									min={-2000}
									max={2000}
									onValueChange={field.onChange}
									size="small"
								></NumericInput>
							)}></Controller>
					}
					rightLabel="End"
					rightField={
						<Controller
							control={formControls.control}
							name={`${fullPrefix}adjustment.1`}
							render={({ field }) => (
								<NumericInput fill={true}
									{...field}
									className={fieldStyles.compactNumericInput}
									min={-2000}
									max={2000}
									onValueChange={field.onChange}
									size="small"></NumericInput>
							)}></Controller>
					}
				/>

			</ControlGroup>

			{/* Visual form */}
			<VisualForm
				widthDisplay={false}
				heightDisplay={false}
				prefix={props.prefix}></VisualForm>
		</>
	);
}

export default ArrowForm;
