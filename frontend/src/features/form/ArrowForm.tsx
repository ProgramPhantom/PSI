import { ControlGroup, FormGroup, HTMLSelect, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { ILine } from "../../logic/line";
import { getByPath } from "../../logic/util2";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormGroup.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

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
						<FormGroup fill={true}
							className={styles.simpleGroup}
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
										min={0}></NumericInput>
								)}></Controller>
						</FormGroup>

						<FormGroup
							className={styles.simpleGroup}
							label="Stroke"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}lineStyle.stroke`}
								render={({ field }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
								)}></Controller>
						</FormGroup>

						<FormGroup
							className={styles.doubleGroup}
							label="Dashing"
							labelFor="text-input">
							<div className={styles.doubleFields}>
								<div className={styles.inlineField}>
									<span className={styles.fieldLabel}>Dash</span>
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
								</div>
								<div className={styles.inlineField}>
									<span className={styles.fieldLabel}>Gap</span>
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
								</div>
							</div>
						</FormGroup>
					</ControlGroup>
				</Section>

				{/* Arrowhead style */}
				<FormGroup
					className={styles.simpleGroup}
					fill={false}
					inline={true}
					label="Arrowhead style"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}lineStyle.headStyle.1`}
						render={({ field }) => (
							<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down">
								<option value={"default"}>Default</option>
								<option value={"none"}>None</option>
							</HTMLSelect>
						)}></Controller>
				</FormGroup>

				{/* Adjustment */}
				<FormGroup
					className={styles.doubleGroup}
					label="Adjustment"
					labelFor="text-input">
					<div className={styles.doubleFields}>
						<div className={styles.inlineField}>
							<span className={styles.fieldLabel}>Start</span>
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
						</div>
						<div className={styles.inlineField}>
							<span className={styles.fieldLabel}>End</span>
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
						</div>
					</div>
				</FormGroup>


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
