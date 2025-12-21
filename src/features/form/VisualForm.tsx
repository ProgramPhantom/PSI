import {
	ControlGroup,
	FormGroup,
	HTMLSelect,
	InputGroup,
	NumericInput,
	Section,
	Slider
} from "@blueprintjs/core";
import React from "react";
import { Controller, FieldErrors, useFormContext } from "react-hook-form";
import { getByPath } from "../../logic/util2";
import { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { Switch } from "@blueprintjs/core";
import { useWatch } from "react-hook-form";
import { PlacementModeConfig } from "./PlacementModeConfigForm";

interface IVisualFormProps extends FormRequirements {
	widthDisplay?: boolean;
	heightDisplay?: boolean;
}

const VisualForm: React.FC<IVisualFormProps> = (props) => {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	var errors: Partial<FieldErrors<IVisual>> | undefined = getByPath(
		formControls.formState.errors,
		props.prefix
	);
	var rawVals = formControls.getValues();
	var values: Partial<IVisual> = getByPath(formControls.getValues(), props.prefix);

	var widthActive = props.target
		? props.target.sizeMode.x === "fixed"
			? true
			: false
		: true;
	var heightActive = props.target
		? props.target.sizeMode.y === "fixed"
			? true
			: false
		: true;

	var vals = formControls.getValues();
	return (
		<ControlGroup vertical={true}>
			{/* Reference */}
			<FormGroup
				style={{ userSelect: "none" }}
				fill={false}
				inline={true}
				label="Reference"
				labelFor="ref-input"
				intent={errors?.ref ? "danger" : "none"}
				helperText={errors?.ref?.message.toString()}>
				<Controller
					control={formControls.control}
					name={`${fullPrefix}ref`}
					render={({ field }) => (
						<InputGroup
							id="ref-input"
							{...field}
							size="small"
							intent={errors?.ref ? "danger" : "none"}
						/>
					)}
					rules={{
						required: "Reference is required", // message shown if empty
						validate: (value) => value.trim() !== "" || "Reference cannot be empty" // extra safeguard against only-spaces
					}}></Controller>
			</FormGroup>

			{/* Width and height */}
			{/* Content Width */}
			{vals.contentWidth !== undefined && props.widthDisplay ? (
				<>
					<FormGroup
						intent={errors?.contentWidth ? "danger" : "none"}
						helperText={errors?.contentWidth?.message.toString()}
						inline={true}
						label="Width"
						labelFor="width-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}contentWidth`}
							render={({ field }) => (
								<NumericInput
									{...field}
									id="width-input"
									onValueChange={field.onChange}
									min={1}
									max={400}
									size="small"
									disabled={!widthActive}
									title={!widthActive ? "Width inherited" : ""}
									intent={errors?.contentWidth ? "danger" : "none"}
									allowNumericCharactersOnly={true}></NumericInput>
							)}
							rules={{
								required: "Width is required",
								min: { value: 1, message: "Width must be at least 1" },
								max: { value: 400, message: "Width cannot exceed 400" }
							}}></Controller>
					</FormGroup>
				</>
			) : (
				<></>
			)}

			{/* Content Height */}
			{vals.contentHeight !== undefined && props.heightDisplay ? (
				<>
					<FormGroup
						intent={errors?.contentHeight ? "danger" : "none"}
						helperText={errors?.contentHeight?.message.toString()}
						inline={true}
						label="Height"
						labelFor="height-input">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}contentHeight`}
							render={({ field }) => (
								<NumericInput
									{...field}
									id="height-input"
									onValueChange={field.onChange}
									min={1}
									max={400}
									size="small"
									disabled={!widthActive}
									title={!heightActive ? "Height inherited" : ""}
									intent={errors?.contentHeight ? "danger" : "none"}
									allowNumericCharactersOnly={true}></NumericInput>
							)}
							rules={{
								required: "Height is required",
								min: { value: 1, message: "Height must be at least 1" },
								max: { value: 400, message: "Height cannot exceed 400" }
							}}></Controller>
					</FormGroup>
				</>
			) : (
				<></>
			)}

			{/* Config */}
			{/* Placement Config */}
			<Section
				style={{ borderRadius: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Placement"}
				collapsible={true}>
				<ControlGroup vertical={true}>
					{/* Type Display */}
					<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
						<Controller
							control={formControls.control}
							name={`${fullPrefix}placementMode.type`}
							render={({ field }) => (
								<div>Type: {field.value}</div>
							)}></Controller>
					</div>

					{/* Dynamic Sub-forms */}
					<PlacementModeConfig fullPrefix={fullPrefix} />
				</ControlGroup>
			</Section>

			{/* Padding */}
			<Section
				style={{ borderRadius: 0, }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Padding"}
				collapsible={true}>
				<ControlGroup vertical={true} style={{ gap: 4, padding: "8px 0px" }}>
					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding top"
						labelFor="padding-top-input">
						<Controller
							control={formControls.control}
							name="padding.0"
							render={({ field }) => (
								<NumericInput
									{...field}
									id="padding-top-input"
									onValueChange={field.onChange}
									min={0}
									size="small"
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding right"
						labelFor="padding-right-input">
						<Controller
							control={formControls.control}
							name="padding.1"
							render={({ field }) => (
								<NumericInput
									{...field}
									id="padding-right-input"
									onValueChange={field.onChange}
									min={0}
									size="small"
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding bottom"
						labelFor="padding-bottom-input">
						<Controller
							control={formControls.control}
							name="padding.2"
							render={({ field }) => (
								<NumericInput
									{...field}
									id="padding-bottom-input"
									onValueChange={field.onChange}
									min={0}
									size="small"
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px", margin: 0 }}
						label="Padding left"
						labelFor="padding-left-input">
						<Controller
							control={formControls.control}
							name="padding.3"
							render={({ field }) => (
								<NumericInput
									{...field}
									id="padding-left-input"
									onValueChange={field.onChange}
									min={0}
									size="small"
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>
				</ControlGroup>
			</Section>

			{/* Offset */}
			<Section
				style={{ borderRadius: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Offset"}
				collapsible={true}>
				<ControlGroup vertical={true}>
					<FormGroup
						style={{ padding: "4px 8px", margin: 0 }}
						intent={errors?.offset?.[0] ? "danger" : "none"}
						helperText={errors?.offset?.[0]?.message}
						inline={true}
						label="Offset X"
						labelFor="offset0">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}offset.0`}
							render={({ field }) => (
								<NumericInput
									{...field}
									id="offset0"
									onBlur={field.onChange}
									onValueChange={field.onChange}
									min={-2000}
									max={2000}
									size="small"
									intent={errors?.offset?.[0] ? "danger" : "none"}
									allowNumericCharactersOnly={true}></NumericInput>
							)}
							rules={{
								required: "Offset is required",
								min: {
									value: -2000,
									message: "Offset must be greater than -2000"
								},
								max: { value: 2000, message: "Offset cannot exceed 2000" }
							}}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 8px", margin: 0 }}
						intent={errors?.offset?.[1] ? "danger" : "none"}
						helperText={errors?.offset?.[1]?.message}
						inline={true}
						label="Offset Y"
						labelFor="offset1">
						<Controller
							control={formControls.control}
							name={`${fullPrefix}offset.1`}
							render={({ field }) => (
								<NumericInput
									{...field}
									id="offset1"
									onBlur={field.onChange}
									onValueChange={field.onChange}
									min={-2000}
									max={2000}
									size="small"
									intent={errors?.offset?.[1] ? "danger" : "none"}
									allowNumericCharactersOnly={true}></NumericInput>
							)}
							rules={{
								required: "Offset is required",
								min: {
									value: -2000,
									message: "Offset must be greater than -2000"
								},
								max: { value: 2000, message: "Offset cannot exceed 2000" }
							}}></Controller>
					</FormGroup>
				</ControlGroup>
			</Section>
		</ControlGroup>
	);
};

export default VisualForm;
