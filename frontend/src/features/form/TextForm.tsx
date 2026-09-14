import { ControlGroup, HTMLSelect, InputGroup, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "../../appSettings";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { SimpleField } from "./fields/SimpleField";
import { CustomNumericInput } from "./fields/CustomNumericInput";
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
			</ControlGroup>

			{/* Style */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{ defaultIsOpen: true }}
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
							render={({ field }) => {
								const normalizeFont = (val?: string) => {
									if (!val) return "Helvetica, Arial, sans-serif";
									if (
										val === "Helvetica, Arial, sans-serif" ||
										val === "sans-serif" ||
										val === "Arial" ||
										val === "Arial, sans-serif" ||
										val === "Helvetica" ||
										val === "Helvetica, sans-serif"
									) {
										return "Helvetica, Arial, sans-serif";
									}
									if (val === "Georgia") return "Georgia, serif";
									if (val === "Times New Roman") return "Times New Roman, serif";
									return val;
								};

								return (
									<HTMLSelect
										{...field}
										value={normalizeFont(field.value)}
										id="font-family-select"
										className={fieldStyles.compactHTMLSelect}
										iconName="caret-down"
										fill={true}
										options={[
											{ label: "Arial (Helvetica)", value: "Helvetica, Arial, sans-serif" },
											{ label: "Serif", value: "serif" },
											{ label: "Monospace", value: "monospace" },
											{ label: "Georgia", value: "Georgia, serif" },
											{ label: "Times New Roman", value: "Times New Roman, serif" }
										]}
									/>
								);
							}}></Controller>
					</SimpleField>

					<Controller
						control={formControls.control}
						name={`${fullPrefix}style.fontSize`}
						rules={{
							min: { value: MIN_FONT_SIZE, message: `Font size must be at least ${MIN_FONT_SIZE}` },
							max: { value: MAX_FONT_SIZE, message: `Font size cannot exceed ${MAX_FONT_SIZE}` }
						}}
						render={({ field, fieldState }) => (
							<SimpleField
								label="Font Size (pt)"
								labelFor="text-input"
								intent={fieldState.error ? "danger" : "none"}
								helperText={fieldState.error?.message}>
								<CustomNumericInput
									{...field}
									allowNegative={false}
									onValueChange={field.onChange}
									min={MIN_FONT_SIZE}
									max={MAX_FONT_SIZE}
									size="small"
									fill={true}
									intent={fieldState.error ? "danger" : "none"}
								/>
							</SimpleField>
						)}></Controller>

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

			{/* Visual form */}
			<VisualForm
				widthDisplay={false}
				heightDisplay={false}
				prefix={props.prefix}></VisualForm>
		</>
	);
}

export default TextForm;

