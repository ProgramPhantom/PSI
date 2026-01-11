import { Button, ControlGroup, FormGroup, HTMLSelect, Section, SectionCard } from "@blueprintjs/core";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ArrowForm from "./ArrowForm";
import TextForm from "./TextForm";
import { FormRequirements } from "./FormBase";
import { IText } from "../../logic/text";
import { ILine } from "../../logic/line";
import VisualForm from "./VisualForm";
import FormDivider from "./FormDivider";

interface ILabelArrayFormProps extends FormRequirements { }

function LabelForm(props: ILabelArrayFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();
	let vals = formControls.getValues();

	const [textOn, setTextOn] = useState<boolean>(formControls.getValues(`${fullPrefix}text`) !== undefined);
	const [lineOn, setLineOn] = useState<boolean>(formControls.getValues(`${fullPrefix}line`) !== undefined);

	const [textBackup, setTextBackup] = useState<IText | undefined>(undefined);
	const [lineBackup, setLineBackup] = useState<ILine | undefined>(undefined);

	const toggleText = () => {
		if (textOn) {
			setTextBackup(formControls.getValues(`${fullPrefix}text`));
			formControls.setValue(`${fullPrefix}text`, undefined);
			setTextOn(false);
		} else {
			formControls.setValue(`${fullPrefix}text`, textBackup ?? {});
			setTextOn(true);
		}
	}

	const toggleLine = () => {
		if (lineOn) {
			setLineBackup(formControls.getValues(`${fullPrefix}line`));
			formControls.setValue(`${fullPrefix}line`, undefined);
			setLineOn(false);
		} else {
			formControls.setValue(`${fullPrefix}line`, lineBackup ?? {});
			setLineOn(true);
		}
	}

	return (
		<>
			<div style={{ marginTop: "8px" }}>
				<VisualForm target={props.target} heightDisplay={false} widthDisplay={false}></VisualForm>
			</div>


			<ControlGroup
				vertical={true}
				style={{ padding: "4px 0px", marginBottom: "0px" }}
			>
				{/* Position */}
				<FormGroup
					style={{ padding: "4px 0px", }}
					fill={false}
					inline={true}
					label="Position"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}labelConfig.labelPosition`}
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down">
								<option value={"top"}>Top</option>
								<option value={"bottom"}>Bottom</option>
								<option value={"left"}>Left</option>
								<option value={"right"}>Right</option>
							</HTMLSelect>
						)}></Controller>
				</FormGroup>

				{/* Text position */}
				<FormGroup style={{ padding: "4px 0px", }}
					fill={false}
					inline={true}
					label="Text Position"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}labelConfig.textPosition`}
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down">
								<option value={"top"}>Top</option>
								<option value={"inline"}>Inline</option>
								<option value={"bottom"}>Bottom</option>
							</HTMLSelect>
						)}></Controller>
				</FormGroup>
			</ControlGroup>

			<FormDivider title="Text" topMargin={0}></FormDivider>
			{/* Text form */}
			<Section icon="text-highlight"
				style={{ padding: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				collapsible={true}
				title={"Text"}
				rightElement={
					<Button
						icon={textOn ? "eye-open" : "eye-off"}
						intent="none"
						onClick={(e) => {
							e.stopPropagation();
							toggleText();
						}}></Button>
				}>
				<SectionCard style={{ padding: "8px" }}>
					<TextForm prefix={fullPrefix + "text"}></TextForm>
				</SectionCard>
			</Section>

			<FormDivider title="Arrow"></FormDivider>
			{/* Arrow form */}
			<Section icon="arrow-top-left"
				style={{ padding: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				collapsible={true}
				title={"Arrow"}
				rightElement={
					<Button
						icon={lineOn ? "eye-open" : "eye-off"}
						intent="none"
						onClick={(e) => {
							e.stopPropagation();
							toggleLine();
						}}></Button>
				}>
				<SectionCard style={{ padding: "0px" }}>
					<ArrowForm prefix={fullPrefix + "line"}></ArrowForm>
				</SectionCard>
			</Section>
		</>
	);
}

export default LabelForm;
