import { ControlGroup, HTMLSelect, InputGroup, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { SimpleField } from "./fields/SimpleField";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ITextFormProps extends FormRequirements { }

function TextForm(props: ITextFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Text */}
				<SimpleField
					fill={false}
					inline={false}
					label="Text"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}text`}
						render={({ field }) => (
							<InputGroup
								{...field}
								id="text"
								className={fieldStyles.compactInputGroup}
								placeholder="Text"
								size="small"
							/>
						)}></Controller>
				</SimpleField>

				{/* Style */}
				<Section
					className={sectionStyles.minimalSection}
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Style"}
					collapsible={true}>
					<ControlGroup vertical={true} className={styles.formGroupContainer}>
						<SimpleField
							label="Font Family"
							labelFor="font-family-select">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}fontFamily`}
								render={({ field }) => (
									<HTMLSelect
										{...field}
										value={field.value || "sans-serif"}
										id="font-family-select"
										className={fieldStyles.compactHTMLSelect}
										iconName="caret-down"
										fill={true}
										options={[
											{ label: "Sans Serif", value: "sans-serif" },
											{ label: "Serif", value: "serif" },
											{ label: "Monospace", value: "monospace" },
											{ label: "Georgia", value: "Georgia, serif" },
											{ label: "Arial", value: "Arial, sans-serif" },
											{ label: "Times New Roman", value: "Times New Roman, serif" }
										]}
									/>
								)}></Controller>
						</SimpleField>

						<SimpleField
							label="Font Size (pt)"
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
						</SimpleField>

						{ /* Colour */}
						<SimpleField
							label="Colour"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.colour`}
								render={({ field }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} {...field}></input>
								)}></Controller>
						</SimpleField>

						{ /* Background colour */}
						<SimpleField
							label="Background"
							labelFor="text-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}.style.background`}
								render={({ field: { onChange, onBlur, value, ref } }) => (
									<input type={"color"} className={fieldStyles.compactColorInput} onChange={onChange} onBlur={onBlur} value={value} ref={ref}></input>
								)}></Controller>
						</SimpleField>
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

