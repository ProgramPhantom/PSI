import { ControlGroup, HTMLSelect, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import ArrowForm from "./ArrowForm";
import LaTeXForm from "./LaTeXForm";
import { FormRequirements } from "./FormBase";
import VisualForm from "./VisualForm";
import { SimpleField } from "./fields/SimpleField";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";
import sectionStyles from "./styles/FormSection.module.scss";

interface ILabelArrayFormProps extends FormRequirements { }

function LabelForm(props: ILabelArrayFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();
	let vals = props.prefix ? formControls.getValues(props.prefix) : formControls.getValues();
	let children = vals?.children || [];

	let textIndex = children.findIndex((c: any) => c.role === "text");
	let lineIndex = children.findIndex((c: any) => c.role === "line");

	let textPrefix = textIndex !== -1 ? `${fullPrefix}children.${textIndex}` : undefined;
	let linePrefix = lineIndex !== -1 ? `${fullPrefix}children.${lineIndex}` : undefined;

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

			{/* Text form */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				collapsible={true}
				title={"Text"}>

				{textPrefix && <LaTeXForm prefix={textPrefix}></LaTeXForm>}

			</Section>

			{/* Arrow form */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				collapsible={true}
				title={"Arrow"}>
				{linePrefix && <ArrowForm prefix={linePrefix}></ArrowForm>}
			</Section>
		</>
	);
}

export default LabelForm;
