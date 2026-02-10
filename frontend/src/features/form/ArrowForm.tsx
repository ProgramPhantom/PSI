import { ControlGroup, FormGroup, HTMLSelect, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { ILine } from "../../logic/line";
import { getByPath } from "../../logic/util2";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";

interface IArrowFormProps extends FormRequirements { }

function ArrowForm(props: IArrowFormProps) {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	var values: Partial<ILine> | undefined = getByPath(formControls.getValues(), props.prefix);

	return (
		<>
			<ControlGroup vertical={true} style={{ padding: "8px" }}>
				{/* Arrowhead style */}
				<FormGroup
					style={{ padding: "4px 0px", margin: 0 }}
					fill={false}
					inline={true}
					label="Arrowhead style"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}arrowStyle.headStyle`}
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down">
								<option value={"default"}>Default</option>
							</HTMLSelect>
						)}></Controller>
				</FormGroup>

				{/* Adjustment */}
				<FormGroup
					style={{ padding: "8px 0px 16px 0", margin: 0 }}
					inline={false}
					label="Adjustment"
					labelFor="text-input">
					<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
						<Controller
							control={formControls.control}
							name={`${fullPrefix}adjustment.0`}
							render={({ field }) => (
								<NumericInput fill={true}
									{...field}
									min={-2000}
									max={2000}
									onValueChange={field.onChange}
									size="small" style={{width: "50rm"}}
								></NumericInput>
							)}></Controller>
						<Controller
							control={formControls.control}
							name={`${fullPrefix}adjustment.1`}
							render={({ field }) => (
								<NumericInput fill={true}
									{...field}
									min={-2000}
									max={2000}
									onValueChange={field.onChange}
									size="small"></NumericInput>
							)}></Controller>
					</div>
				</FormGroup>

				{/* Visual form */}
				<VisualForm
					widthDisplay={false}
					heightDisplay={false}
					prefix={props.prefix}></VisualForm>

				{/* Style */}
				<Section icon="style"
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Style"}
					collapsible={true}>
					<FormGroup
						style={{ padding: "4px 8px", margin: 0 }}
						inline={true}
						label="Stroke thickness"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.thickness`}
							render={({ field }) => (
								<NumericInput
									{...field} size="small"
									onValueChange={field.onChange}
									min={0}></NumericInput>
							)}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 8px", margin: 0 }}
						inline={true}
						label="Stroke"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}style.stroke`}
							render={({ field }) => (
								<input type={"color"} {...field}></input>
							)}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 8px", margin: 0 }}
						inline={false}
						label="Dashing"
						labelFor="text-input">
						<div style={{ display: "flex", flexDirection: "column", width: "100%"  }}>
							<Controller
								control={formControls.control}
								name={`${fullPrefix}style.dashing.0`}
								render={({ field }) => (
									<NumericInput fill={true}
										{...field}
										min={-100}
										max={100}
										onValueChange={field.onChange}
										size="small" style={{width: "50rm"}}
									></NumericInput>
							)}></Controller>
							<Controller
								control={formControls.control}
								name={`${fullPrefix}style.dashing.1`}
								render={({ field }) => (
									<NumericInput fill={true}
										{...field}
										min={-100}
										max={100}
										onValueChange={field.onChange}
										size="small"></NumericInput>
							)}></Controller>
						</div>
					</FormGroup>
				</Section>
			</ControlGroup>
		</>
	);
}

export default ArrowForm;
