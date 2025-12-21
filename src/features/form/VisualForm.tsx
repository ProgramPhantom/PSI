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

interface IVisualFormProps extends FormRequirements {
	widthDisplay?: boolean;
	heightDisplay?: boolean;
}

const PlacementModeConfig: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
	const { control } = useFormContext();
	const type = useWatch({
		control,
		name: `${fullPrefix}placementMode.type`
	});
	const placementMode = useWatch({
		control,
		name: `${fullPrefix}placementMode`
	});

	if (type === "pulse") {
		return (
			<>
				{/* Read-only fields */}
				<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span>Idx: {placementMode?.config?.index ?? "-"}</span>
						<span>Ch: {placementMode?.config?.channelID ?? "-"}</span>
						<span>Seq: {placementMode?.config?.sequenceID ?? "-"}</span>
					</div>
				</div>

				<FormGroup style={{ padding: "4px 8px" }} inline label="Orientation">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.orientation`}
						defaultValue="top"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="top">Top</option>
								<option value="bottom">Bottom</option>
								<option value="both">Both</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>

				<FormGroup style={{ padding: "4px 8px" }} inline label="Align X">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.alignment.x`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="here">Here (Left)</option>
								<option value="centre">Centre</option>
								<option value="far">Far (Right)</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>
				<FormGroup style={{ padding: "4px 8px" }} inline label="Align Y">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.alignment.y`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="here">Here (Top)</option>
								<option value="centre">Centre</option>
								<option value="far">Far (Bottom)</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>

				<FormGroup style={{ padding: "4px 8px" }} inline label="No. Sections">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.config.noSections`}
						defaultValue={1}
						render={({ field }) => (
							<NumericInput {...field} onValueChange={field.onChange} min={1} max={10} size="small" fill />
						)}
					/>
				</FormGroup>
			</>
		);
	}

	if (type === "grid") {
		return (
			<>
				<div style={{ display: "flex", gap: "10px", padding: "0 8px" }}>
					<FormGroup style={{ flex: 1 }} label="Row">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.gridConfig.coords.row`}
							defaultValue={0}
							render={({ field }) => (
								<NumericInput {...field} onValueChange={field.onChange} min={0} size="small" fill />
							)}
						/>
					</FormGroup>
					<FormGroup style={{ flex: 1 }} label="Col">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.gridConfig.coords.col`}
							defaultValue={0}
							render={({ field }) => (
								<NumericInput {...field} onValueChange={field.onChange} min={0} size="small" fill />
							)}
						/>
					</FormGroup>
				</div>

				<div style={{ display: "flex", gap: "10px", padding: "0 8px" }}>
					<FormGroup style={{ flex: 1 }} label="Row Span">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.gridConfig.gridSize.noRows`}
							defaultValue={1}
							render={({ field }) => (
								<NumericInput {...field} onValueChange={field.onChange} min={1} size="small" fill />
							)}
						/>
					</FormGroup>
					<FormGroup style={{ flex: 1 }} label="Col Span">
						<Controller
							control={control}
							name={`${fullPrefix}placementMode.gridConfig.gridSize.noCols`}
							defaultValue={1}
							render={({ field }) => (
								<NumericInput {...field} onValueChange={field.onChange} min={1} size="small" fill />
							)}
						/>
					</FormGroup>
				</div>

				<FormGroup style={{ padding: "4px 8px" }} inline label="Align X">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.gridConfig.alignment.x`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="here">Here</option>
								<option value="centre">Centre</option>
								<option value="far">Far</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>
				<FormGroup style={{ padding: "4px 8px" }} inline label="Align Y">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.gridConfig.alignment.y`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="here">Here</option>
								<option value="centre">Centre</option>
								<option value="far">Far</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>

				<div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.gridConfig.contribution.x`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Contribute X" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.gridConfig.contribution.y`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Contribute Y" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
				</div>
			</>
		);
	}

	if (type === "aligner") {
		return (
			<>
				<div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
					Index: {placementMode?.alignerConfig?.index ?? "N/A"}
				</div>

				<FormGroup style={{ padding: "4px 8px" }} inline label="Alignment">
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.alignerConfig.alignment`}
						defaultValue="here"
						render={({ field }) => (
							<HTMLSelect {...field} iconName="caret-down" fill>
								<option value="here">Here</option>
								<option value="centre">Centre</option>
								<option value="far">Far</option>
							</HTMLSelect>
						)}
					/>
				</FormGroup>

				<div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.alignerConfig.contribution.mainAxis`}
						defaultValue={true}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Main Axis" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
					<Controller
						control={control}
						name={`${fullPrefix}placementMode.alignerConfig.contribution.crossAxis`}
						defaultValue={false}
						render={({ field }) => (
							<Switch {...field} checked={field.value} label="Cross Axis" onChange={(e) => field.onChange(e.target.checked)} />
						)}
					/>
				</div>
			</>
		);
	}

	return null;
};

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
				<ControlGroup vertical={true} style={{ gap: 10 }}>
					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding top"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name="padding.0"
							render={({ field }) => (
								<Slider {...field} min={0} max={30} labelStepSize={10}></Slider>
							)}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding right"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name="padding.1"
							render={({ field }) => (
								<Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
							)}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px" }}
						label="Padding bottom"
						labelFor="text-input">
						<Controller
							control={formControls.control}
							name="padding.2"
							render={({ field }) => (
								<Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
							)}></Controller>
					</FormGroup>

					<FormGroup
						style={{ padding: "4px 16px", margin: 0 }}
						label="Padding left"
						labelFor="slider3">
						<Controller
							control={formControls.control}
							name="padding.3"
							render={({ field }) => (
								<Slider {...field} max={30} min={0} labelStepSize={10}></Slider>
							)}></Controller>
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
