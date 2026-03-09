import {
	Button,
	ControlGroup,
	FormGroup,
	HTMLSelect
} from "@blueprintjs/core";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ENGINE from "../../logic/engine";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import SVGUploadDialog from "./SVGUploadDialog";

interface ISVGElementFormProps extends FormRequirements { }

const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
	const fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

	const formControls = useFormContext();

	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	return (
		<>
			{/* SVG Specific fields */}
			<FormGroup fill={false} inline={true} label="SVG" labelFor="text-input">
				<ControlGroup>
					<Controller
						control={formControls.control}
						name={`${fullPrefix}asset`}
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<HTMLSelect
								{...fieldProps}
								id="svgDataRef-select"
								fill={true}
								value={typeof value === 'object' ? value?.id || "" : value || ""}
								onChange={(e) => {
									const selectedId = e.target.value;
									const entry = ENGINE.svgDict[selectedId];
									if (entry) {
										onChange({ id: selectedId, ref: entry.ref });
									} else {
										onChange({ id: "", ref: "" });
									}
								}}
								options={[
									...Object.entries(ENGINE.svgDict).map(([id, entry]) => ({
										label: entry.ref,
										value: id,
									})),
								]}
							/>
						)}
					/>
					<Button
						icon="plus"
						onClick={() => setIsUploadDialogOpen(true)}
						title="Add new SVG"
					/>
				</ControlGroup>
			</FormGroup>

			<VisualForm target={props.target} heightDisplay={true} widthDisplay={true}></VisualForm>

			<SVGUploadDialog
				isOpen={isUploadDialogOpen}
				onClose={() => setIsUploadDialogOpen(false)}
			/>
		</>
	);
};

export default SVGElementForm;
