import { ControlGroup, InputGroup, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "../../appSettings";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { SimpleField } from "./fields/SimpleField";
import { CustomNumericInput } from "./fields/CustomNumericInput";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ILaTeXFormProps extends FormRequirements { }

function LaTeXForm(props: ILaTeXFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Text */}
				<SimpleField
					fill={false}
					inline={false}
					label="Text (LaTeX)"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}text`}
						render={({ field }) => (
							<InputGroup
								{...field}
								id="text"
								className={fieldStyles.compactInputGroup}
								placeholder="_1\textrm{H}"
								size="small"
								fill={true}
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
							name={`${fullPrefix}style.colour`}
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
							name={`${fullPrefix}style.background`}
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

export default LaTeXForm;
