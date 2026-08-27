import { ControlGroup, HTMLSelect } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { FormRequirements } from "./FormBase";
import VisualForm from "./VisualForm";
import { SimpleField } from "./fields/SimpleField";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ILabelArrayFormProps extends FormRequirements { }

function LabelForm(props: ILabelArrayFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	return (
		<>
			<ControlGroup className={styles.formGroupContainer} vertical={true}>
				{/* Text position */}
				<SimpleField
					fill={false}
					inline={true}
					label="Text Position"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}labelConfig.textPosition`}
						render={({ field }) => (
							<HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down">
								<option value={"top"}>Top</option>
								<option value={"inline"}>Inline</option>
								<option value={"bottom"}>Bottom</option>
							</HTMLSelect>
						)}></Controller>
				</SimpleField>
			</ControlGroup>

			<VisualForm target={props.target} prefix={fullPrefix} widthDisplay={true} heightDisplay={true}></VisualForm>
		</>
	);
}

export default LabelForm;
