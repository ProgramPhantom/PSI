import {
	ControlGroup,
	HTMLSelect,
	InputGroup,
	NumericInput,
	Section
} from "@blueprintjs/core";
import React from "react";
import { Controller, FieldErrors, useFormContext, useWatch } from "react-hook-form";
import Collection from "../../logic/collection";
import { getByPath } from "../../logic/util2";
import { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { PlacementModeConfig } from "./PlacementModeConfigForm";
import { CustomNumericInput } from "./fields/CustomNumericInput";
import { DoubleField } from "./fields/DoubleField";
import { QuadField } from "./fields/QuadField";
import { SimpleField } from "./fields/SimpleField";
import InformationLabel from "./help/InformationLabel";
import fieldStyles from "./styles/FormFields.module.scss";
import styles from "./styles/FormContainers.module.scss";
import sectionStyles from "./styles/FormSection.module.scss";

interface IVisualFormProps extends FormRequirements {
	widthDisplay?: boolean;
	heightDisplay?: boolean;
}

const VisualForm: React.FC<IVisualFormProps> = (props) => {
	var fullPrefix = props.prefix !== undefined && props.prefix !== "" ? `${props.prefix}.` : "";
	const formControls = useFormContext();

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
	const watchedPlacementModeType = useWatch({
		control,
		name: `${fullPrefix}placementMode.type`
	});
	const watchedPlacementControl = useWatch({
		control,
		name: `${fullPrefix}placementControl`
	});

	let theseVals: IVisual | undefined = getByPath(
		formControls.getValues(),
		fullPrefix
	);

	const isCollection = !!(
		(theseVals && Collection.isCollection(theseVals)) ||
		(props.target && Collection.isICollection(props.target))
	);

	const fallbackMode = isCollection ? "fit" : "fixed";
	const currentX = watchedSizeModeX ?? theseVals?.sizeMode?.x ?? props.target?.sizeMode.x ?? fallbackMode;
	const currentY = watchedSizeModeY ?? theseVals?.sizeMode?.y ?? props.target?.sizeMode.y ?? fallbackMode;

	const widthActive = currentX === "fixed";
	const heightActive = currentY === "fixed";
	const placementModeType = watchedPlacementModeType ?? theseVals?.placementMode?.type ?? props.target?.placementMode?.type ?? "free";
	const placementControl = watchedPlacementControl ?? theseVals?.placementControl ?? props.target?.placementControl ?? "user";
	let sizeOptions = ["fixed", "fit", "grow"];
	if (placementModeType === "free") {
		sizeOptions = sizeOptions.filter((opt) => opt !== "grow");
	}

	var vals = formControls.getValues();
	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				{/* Width and height */}
				{(props.widthDisplay !== false || props.heightDisplay !== false) && (() => {
					const minWidthVal = props.target?.minContentWidth ?? (widthActive ? 1 : 0);
					const minHeightVal = props.target?.minContentHeight ?? (heightActive ? 1 : 0);
					return (
						<DoubleField
							label={(!widthActive || !heightActive) ? "Content Size (inherited)" : "Content Size"}
							intent={(errors?.contentWidth || errors?.contentHeight) ? "danger" : "none"}
							helperText={(errors?.contentWidth?.message || errors?.contentHeight?.message)?.toString()}
							leftLabel={props.widthDisplay !== false ? "W" : undefined}
							leftField={
								props.widthDisplay !== false ? (
									<Controller
										control={formControls.control}
										name={`${fullPrefix}contentWidth`}
										render={({ field }) => (
											<CustomNumericInput fill
												{...field}
												id="width-input"
												size="small"

												min={0}
												disabled={!widthActive}
												title={!widthActive ? "Width inherited" : ""}
												intent={errors?.contentWidth ? "danger" : "none"}
												allowNumericCharactersOnly={true}></CustomNumericInput>
										)}
										rules={{
											required: { value: widthActive, message: "Width required" },
											min: { value: minWidthVal, message: `Width must be at least ${minWidthVal}` },
											max: { value: 10000, message: "Width cannot exceed 10000" },
										}}></Controller>
								) : undefined
							}
							rightLabel={props.heightDisplay !== false ? "H" : undefined}
							rightField={
								props.heightDisplay !== false ? (
									<Controller
										control={formControls.control}
										name={`${fullPrefix}contentHeight`}
										render={({ field }) => (
											<CustomNumericInput fill
												{...field}
												id="height-input"
												size="small"
												min={heightActive ? minHeightVal : undefined}
												disabled={!heightActive}
												title={!heightActive ? "Height inherited" : ""}
												intent={errors?.contentHeight ? "danger" : "none"}
											></CustomNumericInput>
										)}
										rules={{
											required: { value: heightActive, message: "Height required" },
											min: { value: minHeightVal, message: `Height must be at least ${minHeightVal}` },
											max: { value: 10000, message: "Height cannot exceed 10000" },
										}}></Controller>
								) : undefined
							}
						/>
					);
				})()}

			</ControlGroup>

			{/* Config */}
			{/* Placement Config */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: false,
					transitionDuration: 0,
				}}
				compact={true}
				title={"Placement"}
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<PlacementModeConfig fullPrefix={fullPrefix}></PlacementModeConfig>
				</ControlGroup>
			</Section>

			{/* Padding */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: false,
					transitionDuration: 0
				}}
				compact={true}
				title={"Padding"}
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<QuadField
						intent={(errors?.padding?.[0] || errors?.padding?.[1] || errors?.padding?.[2] || errors?.padding?.[3]) ? "danger" : "none"}
						helperText={(errors?.padding?.[0]?.message || errors?.padding?.[1]?.message || errors?.padding?.[2]?.message || errors?.padding?.[3]?.message)?.toString()}
						label1="Top"
						field1={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}padding.0`}
								render={({ field }) => (
									<CustomNumericInput
										{...field}
										id="padding-top-input"
										allowNegative={false}
										size="small"
										fill
										min={0}
										max={2000}
									/>
								)}
								rules={{
									min: { value: 0, message: "Padding cannot be negative" },
									max: { value: 2000, message: "Padding cannot exceed 2000" }
								}}
							/>
						}
						label2="Right"
						field2={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}padding.1`}
								render={({ field }) => (
									<CustomNumericInput
										{...field}
										id="padding-right-input"
										allowNegative={false}
										size="small"
										fill
										min={0}
										max={2000}
									/>
								)}
								rules={{
									min: { value: 0, message: "Padding cannot be negative" },
									max: { value: 2000, message: "Padding cannot exceed 2000" }
								}}
							/>
						}
						label3="Bottom"
						field3={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}padding.2`}
								render={({ field }) => (
									<CustomNumericInput
										{...field}
										id="padding-bottom-input"
										allowNegative={false}
										size="small"
										fill
										min={0}
										max={2000}
									/>
								)}
								rules={{
									min: { value: 0, message: "Padding cannot be negative" },
									max: { value: 2000, message: "Padding cannot exceed 2000" }
								}}
							/>
						}
						label4="Left"
						field4={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}padding.3`}
								render={({ field }) => (
									<CustomNumericInput
										{...field}
										id="padding-left-input"
										allowNegative={false}
										size="small"
										fill
										min={0}
										max={2000}
									/>
								)}
								rules={{
									min: { value: 0, message: "Padding cannot be negative" },
									max: { value: 2000, message: "Padding cannot exceed 2000" }
								}}
							/>
						}
					/>
				</ControlGroup>
			</Section>

			{/* Offset */}
			{!isCollection && (
				<Section
					className={sectionStyles.minimalSection}
					style={{ padding: 0 }}
					collapseProps={{
						defaultIsOpen: false,
						transitionDuration: 0,
					}}
					compact={true}
					title={
						"Offset"
					}
					collapsible={true}>
					<ControlGroup vertical={true} className={styles.formGroupContainer}>
						<DoubleField
							intent={(errors?.offset?.[0] || errors?.offset?.[1]) ? "danger" : "none"}
							helperText={(errors?.offset?.[0]?.message || errors?.offset?.[1]?.message)?.toString()}
							leftLabel="X"
							leftField={
								<Controller
									control={formControls.control}
									name={`${fullPrefix}offset.0`}
									render={({ field }) => (
										<CustomNumericInput
											{...field}
											id="offset0"
											allowNegative={true}
											min={-2000}
											max={2000}
											size="small"
											fill
											intent={errors?.offset?.[0] ? "danger" : "none"}
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
							}
							rightLabel="Y"
							rightField={
								<Controller
									control={formControls.control}
									name={`${fullPrefix}offset.1`}
									render={({ field }) => (
										<CustomNumericInput
											{...field}
											id="offset1"
											allowNegative={true}
											min={-2000}
											max={2000}
											size="small"
											fill
											intent={errors?.offset?.[1] ? "danger" : "none"}
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
							}
						/>
					</ControlGroup>
				</Section>
			)}

			{/* Advanced */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: false,
					transitionDuration: 0,
					keepChildrenMounted: true
				}}
				compact={true}
				title="Advanced"
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					{/* Size Mode */}
					<DoubleField
						label={(<InformationLabel text="Size Mode" helpType="sizeMode"></InformationLabel>)}
						leftLabel="W"
						leftField={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}sizeMode.x`}
								defaultValue={currentX}
								render={({ field }) => (
									<HTMLSelect
										{...field}
										id="size-mode-x"
										className={fieldStyles.compactHTMLSelect}
										fill
										options={sizeOptions}
										disabled={placementControl === "auto"}
									/>
								)}
							/>
						}
						rightLabel="H"
						rightField={
							<Controller
								control={formControls.control}
								name={`${fullPrefix}sizeMode.y`}
								defaultValue={currentY}
								render={({ field }) => (
									<HTMLSelect
										{...field}
										id="size-mode-y"
										className={fieldStyles.compactHTMLSelect}
										fill
										options={sizeOptions}
										disabled={placementControl === "auto"}
									/>
								)}
							/>
						}
					/>
				</ControlGroup>
			</Section>
		</>
	);
};

export default VisualForm;
