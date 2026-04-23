import { Button, ControlGroup, FormGroup, HTMLSelect, Section, SectionCard } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ArrowForm from "./ArrowForm";
import TextForm from "./TextForm";
import { FormRequirements } from "./FormBase";
import { IText } from "../../logic/text";
import { ILine } from "../../logic/line";
import VisualForm from "./VisualForm";
import FormDivider from "./FormDivider";
import { DEFAULT_LABEL } from "../../logic/default/label";

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

	const [textOn, setTextOn] = useState<boolean>(textIndex !== -1);
	useEffect(() => {
		setTextOn(textIndex !== -1);
	}, [props.target, textIndex]);

	const [lineOn, setLineOn] = useState<boolean>(lineIndex !== -1);
	useEffect(() => {
		setLineOn(lineIndex !== -1);
	}, [props.target, lineIndex]);

	const [textBackup, setTextBackup] = useState<IText | undefined>(undefined);
	const [lineBackup, setLineBackup] = useState<ILine | undefined>(undefined);

	const toggleText = () => {
		let currentChildren: any[] = formControls.getValues(`${fullPrefix}children`) || [];
		if (textOn && textIndex !== -1) {
			setTextBackup(currentChildren[textIndex]);
			currentChildren = currentChildren.filter((c, i) => i !== textIndex);
			formControls.setValue(`${fullPrefix}children`, currentChildren);
			setTextOn(false);
		} else {
			let defaultText = DEFAULT_LABEL.children.find((c: any) => c.role === "text");
			let toAdd = textBackup ?? (defaultText ? { ...defaultText } : { type: "text", role: "text" });
			formControls.setValue(`${fullPrefix}children`, [...currentChildren, toAdd]);
			setTextOn(true);
		}
	}

	const toggleLine = () => {
		let currentChildren: any[] = formControls.getValues(`${fullPrefix}children`) || [];
		if (lineOn && lineIndex !== -1) {
			setLineBackup(currentChildren[lineIndex]);
			currentChildren = currentChildren.filter((c, i) => i !== lineIndex);
			formControls.setValue(`${fullPrefix}children`, currentChildren);
			setLineOn(false);
		} else {
			let defaultLine = DEFAULT_LABEL.children.find((c: any) => c.role === "line");
			let toAdd = lineBackup ?? (defaultLine ? { ...defaultLine } : { type: "line", role: "line" });
			formControls.setValue(`${fullPrefix}children`, [...currentChildren, toAdd]);
			setLineOn(true);
		}
	}

	return (
		<>
			<div style={{ marginTop: "8px" }}>
				<VisualForm target={props.target} prefix={fullPrefix} widthDisplay={true} heightDisplay={true}></VisualForm>
			</div>


			<ControlGroup
				vertical={true}
				style={{ padding: "4px 0px", marginBottom: "0px" }}
			>


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
					{textPrefix && <TextForm prefix={textPrefix}></TextForm>}
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
					{linePrefix && <ArrowForm prefix={linePrefix}></ArrowForm>}
				</SectionCard>
			</Section>
		</>
	);
}

export default LabelForm;
