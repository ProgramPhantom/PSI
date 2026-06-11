import {
	Button,
	Callout,
	ControlGroup,
	FormGroup,
	HTMLSelect,
	Intent
} from "@blueprintjs/core";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ENGINE from "../../logic/engine";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import SVGUploadDialog from "./SVGUploadDialog";
import styles from "./styles/FormGroup.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ISVGElementFormProps extends FormRequirements { }

const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
	const fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	return (
		<>
			{/* SVG Specific fields */}
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				<Controller
					control={formControls.control}
					name={`${fullPrefix}asset`}
					render={({ field: { value, onChange, ...fieldProps } }) => {
						const currentId = typeof value === 'object' ? value?.id : value;
						const currentRef = typeof value === 'object' ? value?.ref : "";
						const isMissing = !!currentId && !ENGINE.svgDict[currentId as string];

						const options = [
							...Object.entries(ENGINE.svgDict).map(([id, entry]) => ({
								label: entry.ref,
								value: id,
							})),
						];

						if (isMissing) {
							options.unshift({
								label: `asset missing`,
								value: currentId as string,
							});
						}

						return (
							<>
								{isMissing && (

									<Callout intent={"warning"} title="Required Asset Missing"
										style={{ marginBottom: "16px", wordBreak: "break-all" }}>
										The required asset is missing. Reference: {currentRef || "Unknown"},
										ID: {currentId}.

										Please upload it using the plus button or select a different asset.
									</Callout>

								)}
								<div className={styles.inlineContainer}>
									<FormGroup className={styles.simpleGroup} fill={false} inline={true} label="SVG" labelFor="svgDataRef-select">

										<HTMLSelect
											{...fieldProps}
											className={fieldStyles.compactHTMLSelect}
											id="svgDataRef-select"
											fill={true}
											value={(currentId as string) || ""}
											onChange={(e) => {
												const selectedId = e.target.value;
												const entry = ENGINE.svgDict[selectedId];
												if (entry) {
													onChange({ id: selectedId, ref: entry.ref });
												} else {
													onChange({ id: selectedId, ref: currentRef });
												}
											}}
											options={options}
										/>


									</FormGroup >
									<Button size="small"
										icon="plus"
										onClick={() => setIsUploadDialogOpen(true)}
										title="Add new SVG"
									/>
								</div>
							</>
						);
					}}
				/>
			</ControlGroup >

			<VisualForm target={props.target} heightDisplay={true} widthDisplay={true}></VisualForm>

			<SVGUploadDialog
				isOpen={isUploadDialogOpen}
				onClose={() => setIsUploadDialogOpen(false)}
			/>
		</>
	);
};

export default SVGElementForm;
