import {
	ControlGroup,
	FormGroup,
	HTMLSelect,
	Icon,
	InputGroup,
	NumericInput,
	Section
} from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import { Controller, FieldErrors, useFormContext, useWatch } from "react-hook-form";
import { getByPath } from "../../logic/util2";
import { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { PlacementModeConfig } from "./PlacementModeConfigForm";
import InformationLabel from "./help/InformationLabel";

interface IVisualFormProps extends FormRequirements {
	widthDisplay?: boolean;
	heightDisplay?: boolean;
}

const VisualForm: React.FC<IVisualFormProps> = (props) => {
	var fullPrefix = props.prefix !== undefined && props.prefix !== "" ? `${props.prefix}.` : "";
	const formControls = useFormContext();

	const [widthActive, setWidthActive] = useState(true);
	const [heightActive, setHeightActive] = useState(true);

	var errors: Partial<FieldErrors<IVisual>> | undefined = getByPath(
		formControls.formState.errors,
		props.prefix
	);

	const control = formControls.control;
	const watchedSizeModeX = useWatch({
		control,
		name: `${fullPrefix}sizeMode.x`
	});
	const watchedSizeModeY = useWatch({
		control,
		name: `${fullPrefix}sizeMode.y`
	});

	useEffect(() => {
		const currentX = watchedSizeModeX ?? props.target?.sizeMode.x ?? "fixed";
		const currentY = watchedSizeModeY ?? props.target?.sizeMode.y ?? "fixed";

		setWidthActive(currentX === "fixed" ? true : false);
		setHeightActive(currentY === "fixed" ? true : false);
	}, [props.target, watchedSizeModeX, watchedSizeModeY]);


	var vals = formControls.getValues();
	return (
		<ControlGroup vertical={true}>
			{/* Reference */}
			<FormGroup
				style={{ userSelect: "none" }}
				fill={false}
				inline={true}
				label={(<InformationLabel text="Reference" helpType="ref" />)}
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

			<div style={{ display: "flex", gap: "10px", paddingBottom: "8px" }}>
				{/* Content Width */}
				{props.widthDisplay !== false && (
					<>
						<FormGroup style={{ flex: 1, margin: 0 }}
							intent={errors?.contentWidth ? "danger" : "none"}
							helperText={(errors?.contentWidth?.message ?? "").toString()}
							label={!widthActive ? "Height (inherited)" : "Height"}
							labelFor="width-input">
							<Controller
								control={formControls.control}
								name={`${fullPrefix}contentWidth`}
								render={({ field }) => (
									<NumericInput fill
										{...field}
										id="width-input"
										onValueChange={field.onChange}
										min={1} 
										max={10000}
										size="small"
										disabled={!widthActive}
										
										title={!widthActive ? "Width inherited" : ""}
										intent={errors?.contentWidth ? "danger" : "none"}
										allowNumericCharactersOnly={true}></NumericInput>
								)}
								rules={{
									required: {value: widthActive, message: "Width required"},
									min: { value: widthActive ? 1 : 0, message: "Width must be at least 1" },
									max: { value: 10000, message: "Width cannot exceed 10000" },
									
								}}></Controller>
						</FormGroup>
					</>
				)}

				{/* Content Height */}
				{props.heightDisplay !== false && (
					<>
						<FormGroup style={{ flex: 1, margin: 0 }}
							intent={errors?.contentHeight ? "danger" : "none"}
							helperText={(errors?.contentHeight?.message ?? "").toString()}
							label={!heightActive ? "Height (inherited)" : "Height"} defaultValue={"unset"}
							labelFor="height-input"> 
							<Controller
								control={formControls.control}
								name={`${fullPrefix}contentHeight`}
								render={({ field }) => (
									<NumericInput fill
										{...field}
										id="height-input"
										onValueChange={field.onChange}
										min={1}
										max={10000}
										size="small"
										disabled={!heightActive}
										title={!heightActive ? "Height inherited" : ""}
										intent={errors?.contentHeight ? "danger" : "none"}
										></NumericInput>
								)}
								rules={{
									required: {value: heightActive, message: "Height required"},
									min: { value: heightActive ? 1 : 0, message: "Height must be at least 1" },
									max: { value: 10000, message: "Height cannot exceed 10000" },
								}}></Controller>
						</FormGroup>
					</>
				)}
			</div>

			{/* Size Mode */}
			<div style={{ display: "flex", gap: "10px", paddingBottom: "8px" }}>
				<FormGroup
					style={{ flex: 1, margin: 0 }}
					label={(<InformationLabel text="Width Mode" helpType="sizeMode"></InformationLabel>)}
					labelFor="size-mode-x">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}sizeMode.x`}
						render={({ field }) => (
							<HTMLSelect
								{...field}
								id="size-mode-x"
								fill
								options={["fixed", "fit", "grow"]}
							/>
						)}
					/>
				</FormGroup>
				<FormGroup
					style={{ flex: 1, margin: 0 }}
					label={(<InformationLabel text="Height Mode" helpType="sizeMode"></InformationLabel>)}
					labelFor="size-mode-y">
					<Controller
						control={formControls.control}
						name={`${fullPrefix}sizeMode.y`}
						render={({ field }) => (
							<HTMLSelect
								{...field}
								id="size-mode-y"
								fill
								options={["fixed", "fit", "grow"]}
							/>
						)}
					/>
				</FormGroup>
			</div>

			{/* Config */}
			{/* Placement Config */}
			<Section icon="area-of-interest"
				style={{ borderRadius: 0 }}
				collapseProps={{ defaultIsOpen: false }}
				compact={true}
				title={(<InformationLabel text="Placement" helpType="placementMode" />)}
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
							name={`${fullPrefix}padding.0`}
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
							name={`${fullPrefix}padding.1`}
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
							name={`${fullPrefix}padding.2`}
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
							name={`${fullPrefix}padding.3`}
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
