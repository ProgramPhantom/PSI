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
import Collection from "../../logic/collection";
import { FormRequirements } from "./FormBase";
import { PlacementModeConfig } from "./PlacementModeConfigForm";
import InformationLabel from "./help/InformationLabel";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/FormGroup.module.scss";
import fieldStyles from "./styles/FormFields.module.scss"

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


	let theseVals: IVisual | undefined = getByPath(
		formControls.getValues(),
		fullPrefix
	);
	const isCollection = theseVals && Collection.isCollection(theseVals);
	const sizeOptions = isCollection ? ["fit", "grow"] : ["fixed", "fit", "grow"];

	var vals = formControls.getValues();
	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Reference */}
				<FormGroup
					className={styles.simpleGroup}
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
								className={fieldStyles.compactInputGroup}
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
				{(props.widthDisplay !== false || props.heightDisplay !== false) && (
					<FormGroup
						className={styles.doubleGroup}
						label={(!widthActive || !heightActive) ? "Content Size (inherited)" : "Content Size"}
						intent={(errors?.contentWidth || errors?.contentHeight) ? "danger" : "none"}
						helperText={(errors?.contentWidth?.message || errors?.contentHeight?.message)?.toString()}
					>
						<div className={styles.doubleFields}>
							{props.widthDisplay !== false && (
								<div className={styles.inlineField}>
									<span className={styles.fieldLabel}>W</span>
									<Controller
										control={formControls.control}
										name={`${fullPrefix}contentWidth`}
										render={({ field }) => (
											<NumericInput fill
												{...field}
												id="width-input"
												className={fieldStyles.compactNumericInput}
												onValueChange={field.onChange}
												size="small"
												disabled={!widthActive}
												title={!widthActive ? "Width inherited" : ""}
												intent={errors?.contentWidth ? "danger" : "none"}
												allowNumericCharactersOnly={true}></NumericInput>
										)}
										rules={{
											required: { value: widthActive, message: "Width required" },
											min: { value: widthActive ? 1 : 0, message: "Width must be at least 1" },
											max: { value: 10000, message: "Width cannot exceed 10000" },
										}}></Controller>
								</div>
							)}

							{props.heightDisplay !== false && (
								<div className={styles.inlineField}>
									<span className={styles.fieldLabel}>H</span>
									<Controller
										control={formControls.control}
										name={`${fullPrefix}contentHeight`}
										render={({ field }) => (
											<NumericInput fill
												{...field}
												id="height-input"
												className={fieldStyles.compactNumericInput}
												onValueChange={field.onChange}
												size="small"
												disabled={!heightActive}
												title={!heightActive ? "Height inherited" : ""}
												intent={errors?.contentHeight ? "danger" : "none"}
											></NumericInput>
										)}
										rules={{
											required: { value: heightActive, message: "Height required" },
											min: { value: heightActive ? 1 : 0, message: "Height must be at least 1" },
											max: { value: 10000, message: "Height cannot exceed 10000" },
										}}></Controller>
								</div>
							)}
						</div>
					</FormGroup>
				)}

				{/* Size Mode */}
				<FormGroup
					className={styles.doubleGroup}
					label={(<InformationLabel text="Size Mode" helpType="sizeMode"></InformationLabel>)}>
					<div className={styles.doubleFields}>
						<div className={styles.inlineField}>
							<span className={styles.fieldLabel}>W</span>
							<Controller
								control={formControls.control}
								name={`${fullPrefix}sizeMode.x`}
								render={({ field }) => (
									<HTMLSelect
										{...field}
										id="size-mode-x"
										className={fieldStyles.compactHTMLSelect}
										fill
										options={sizeOptions}
									/>
								)}
							/>
						</div>
						<div className={styles.inlineField}>
							<span className={styles.fieldLabel}>H</span>
							<Controller
								control={formControls.control}
								name={`${fullPrefix}sizeMode.y`}
								render={({ field }) => (
									<HTMLSelect
										{...field}
										id="size-mode-y"
										className={fieldStyles.compactHTMLSelect}
										fill
										options={sizeOptions}
									/>
								)}
							/>
						</div>
					</div>
				</FormGroup>
			</ControlGroup>

			{/* Config */}
			{/* Placement Config */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: false,
					transitionDuration: 0,
					keepChildrenMounted: true
				}}
				compact={true}
				title={(<InformationLabel text="Placement" helpType="placementMode" />)}
				collapsible={true}>

				{/* Dynamic Sub-forms */}
				<PlacementModeConfig fullPrefix={fullPrefix} />

			</Section>

			{/* Padding */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{ defaultIsOpen: false, keepChildrenMounted: true, transitionDuration: 0 }}
				compact={true}
				title={"Padding"}
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<FormGroup
						className={styles.quadGroup}
						intent={(errors?.padding?.[0] || errors?.padding?.[1] || errors?.padding?.[2] || errors?.padding?.[3]) ? "danger" : "none"}
						helperText={(errors?.padding?.[0]?.message || errors?.padding?.[1]?.message || errors?.padding?.[2]?.message || errors?.padding?.[3]?.message)?.toString()}
					>
						<div className={styles.quadFields}>
							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>Top</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}padding.0`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="padding-top-input"
											className={fieldStyles.compactNumericInput}
											onValueChange={field.onChange}
											size="small"
											fill
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										min: { value: 0, message: "Padding cannot be negative" }
									}}
								/>
							</div>

							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>Right</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}padding.1`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="padding-right-input"
											className={fieldStyles.compactNumericInput}
											onValueChange={field.onChange}
											size="small"
											fill
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										min: { value: 0, message: "Padding cannot be negative" }
									}}
								/>
							</div>

							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>Bottom</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}padding.2`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="padding-bottom-input"
											className={fieldStyles.compactNumericInput}
											onValueChange={field.onChange}
											size="small"
											fill
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										min: { value: 0, message: "Padding cannot be negative" }
									}}
								/>
							</div>

							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>Left</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}padding.3`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="padding-left-input"
											className={fieldStyles.compactNumericInput}
											onValueChange={field.onChange}
											size="small"
											fill
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										min: { value: 0, message: "Padding cannot be negative" }
									}}
								/>
							</div>
						</div>
					</FormGroup>
				</ControlGroup>
			</Section>

			{/* Offset */}
			<Section
				className={sectionStyles.minimalSection}
				style={{ padding: 0 }}
				collapseProps={{
					defaultIsOpen: false,
					transitionDuration: 0,
					keepChildrenMounted: true
				}}
				compact={true}
				title={
					"Offset"
				}
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<FormGroup
						className={styles.doubleGroup}
						intent={(errors?.offset?.[0] || errors?.offset?.[1]) ? "danger" : "none"}
						helperText={(errors?.offset?.[0]?.message || errors?.offset?.[1]?.message)?.toString()}
					>
						<div className={styles.doubleFields}>
							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>X</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}offset.0`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="offset0"
											className={fieldStyles.compactNumericInput}
											onBlur={field.onChange}
											onValueChange={field.onChange}
											size="small"
											fill
											intent={errors?.offset?.[0] ? "danger" : "none"}
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										required: "Offset is required",
										min: {
											value: -2000,
											message: "Offset must be greater than -2000"
										},
										max: { value: 2000, message: "Offset cannot exceed 2000" }
									}}
								/>
							</div>
							<div className={styles.inlineField}>
								<span className={styles.fieldLabel}>Y</span>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}offset.1`}
									render={({ field }) => (
										<NumericInput
											{...field}
											id="offset1"
											className={fieldStyles.compactNumericInput}
											onBlur={field.onChange}
											onValueChange={field.onChange}
											size="small"
											fill
											intent={errors?.offset?.[1] ? "danger" : "none"}
											allowNumericCharactersOnly={true}
										/>
									)}
									rules={{
										required: "Offset is required",
										min: {
											value: -2000,
											message: "Offset must be greater than -2000"
										},
										max: { value: 2000, message: "Offset cannot exceed 2000" }
									}}></Controller>

							</div>
						</div>
					</FormGroup>
				</ControlGroup>
			</Section>
		</>
	);
};

export default VisualForm;
