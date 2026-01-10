import {
	ControlGroup,
	FormGroup,
	InputGroup,
	NumericInput,
	Section
} from "@blueprintjs/core";
import React from "react";
import { Controller, FieldErrors, useFormContext } from "react-hook-form";
import { getByPath } from "../../logic/util2";
import { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { PlacementModeConfig } from "./PlacementModeConfigForm";

interface IVisualFormProps extends FormRequirements {
	widthDisplay?: boolean;
	heightDisplay?: boolean;
}

const VisualForm: React.FC<IVisualFormProps> = (props) => {
	console.log("visual form render")
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	var errors: Partial<FieldErrors<IVisual>> | undefined = getByPath(
		formControls.formState.errors,
		props.prefix
	);

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
				helperText={(errors?.ref?.message ?? "").toString()}>
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
						helperText={(errors?.contentWidth?.message ?? "").toString()}
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
						helperText={(errors?.contentHeight?.message ?? "").toString()}
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
			<Section icon="area-of-interest"
				style={{ borderRadius: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Placement"}
				collapsible={true}>
				<ControlGroup vertical={true}>
					{/* Dynamic Sub-forms */}
					<PlacementModeConfig fullPrefix={fullPrefix} />
				</ControlGroup>
			</Section>

			{/* Padding */}
			<Section icon="horizontal-inbetween"
				style={{ borderRadius: 0, }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={"Padding"}
				collapsible={true}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "8px" }}>
					<FormGroup
						style={{ margin: 0 }}
						label="Top"
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
									fill
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ margin: 0 }}
						label="Right"
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
									fill
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ margin: 0 }}
						label="Bottom"
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
									fill
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>

					<FormGroup
						style={{ margin: 0 }}
						label="Left"
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
									fill
									allowNumericCharactersOnly={true}
								/>
							)}
							rules={{
								min: { value: 0, message: "Padding cannot be negative" }
							}}
						/>
					</FormGroup>
				</div>
			</Section>

			{/* Offset */}
			<Section icon="arrows-horizontal"
				style={{ borderRadius: 0, padding: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={
					"Offset"
				}
				collapsible={true}>
				<div style={{ display: "flex", gap: "10px", padding: "8px" }}>
					<FormGroup
						style={{ flex: 1, margin: 0 }}
						intent={errors?.offset?.[0] ? "danger" : "none"}
						helperText={errors?.offset?.[0]?.message}
						label="X"
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
									fill
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
						style={{ flex: 1, margin: 0 }}
						intent={errors?.offset?.[1] ? "danger" : "none"}
						helperText={errors?.offset?.[1]?.message}
						label="Y"
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
									fill
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
				</div>
			</Section>
		</ControlGroup>
	);
};

export default VisualForm;
