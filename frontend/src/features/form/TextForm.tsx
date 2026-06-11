import { ControlGroup, FormGroup, InputGroup, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { MathJax } from "better-react-mathjax";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormGroup.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ITextFormProps extends FormRequirements { }

function TextForm(props: ITextFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Text */}
				<FormGroup
					className={styles.simpleGroup}
					fill={false}
					inline={false}
					label="Text (LaTeX)"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}text`}
						render={({ field }) => (
							<div style={{ display: "flex", flexDirection: "row" }}>
								<InputGroup
									{...field}
									id="text"
									className={fieldStyles.compactInputGroup}
									placeholder="_1\textrm{H}"
									size="small"
								/>
								<div style={{ marginLeft: "16px", display: "flex", alignItems: "center" }}>
									<MathJax>{`\\(${field.value || ""}\\)`}</MathJax>
								</div>
							</div>
						)}></Controller>
				</FormGroup>

				{/* Style */}
				<Section
					className={sectionStyles.minimalSection}
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Style"}
					collapsible={true}>
					<ControlGroup vertical={true} className={styles.formGroupContainer}>
						<FormGroup
							className={styles.simpleGroup}
							label="Font Size"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.fontSize`}
								render={({ field }) => (
									<NumericInput
										{...field}
										className={fieldStyles.compactNumericInput}
										onValueChange={field.onChange}
										min={0}
										max={120}
										size="small"
										fill={true}
									/>
								)}></Controller>
						</FormGroup>

						{ /* Colour */}
						<FormGroup
							className={styles.simpleGroup}
							label="Colour"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.colour`}
								render={({ field }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
								)}></Controller>
						</FormGroup>

						{ /* Background colour */}
						<FormGroup
							className={styles.simpleGroup}
							label="Background"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.background`}
								render={({ field: { onChange, onBlur, value, ref } }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} onChange={onChange} onBlur={onBlur} value={value} ref={ref}></input>
								)}></Controller>
						</FormGroup>
					</ControlGroup>
				</Section>
			</ControlGroup>

			{/* Visual form */}
			<VisualForm
				widthDisplay={false}
				heightDisplay={false}
				prefix={props.prefix}></VisualForm>
		</>
	);
}

export default TextForm;
