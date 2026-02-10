import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IRectElement } from "../../logic/rectElement";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { ControlGroup, FormGroup, InputGroup, NumericInput, Section } from "@blueprintjs/core";

interface IRectFormProps extends FormRequirements { }

const RectElementForm: React.FC<IRectFormProps> = (props) => {
	var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";
	const formControls = useFormContext<IRectElement>();

	return (
		<>
			<div style={{ width: "100%" }}>
				<ControlGroup vertical={true}>

					<VisualForm target={props.target} widthDisplay={true} heightDisplay={true} prefix={props.prefix}></VisualForm>

					{/* Style stuff */}
					<Section icon="style"
						collapseProps={{ defaultIsOpen: false }}
						compact={true}
						title={"Style"}
						collapsible={true}>

						<div style={{ padding: "8px" }}>
							<FormGroup inline={true} label="Fill" labelFor="text-input" style={{ margin: "4px 0" }}>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}style.fill` as any}
									render={({ field }) => (
										<input type={"color"} {...field}></input>
									)}></Controller>
							</FormGroup>

							<FormGroup inline={true} label="Stroke" labelFor="text-input" style={{ margin: "4px 0" }}>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}style.stroke` as any}
									render={({ field }) => (
										<input type={"color"} {...field}></input>
									)}></Controller>
							</FormGroup>

							<FormGroup inline={true} label="Stroke Width" labelFor="text-input" style={{ margin: "4px 0" }}>
								<Controller
									control={formControls.control}
									name={`${fullPrefix}style.strokeWidth` as any}
									render={({ field }) => (
										<NumericInput
											{...field}
											onValueChange={field.onChange}
											min={1}
											size={"small"}></NumericInput>
									)}></Controller>
							</FormGroup>
						</div>
					</Section>
				</ControlGroup>
			</div>
		</>
	);
};

export default RectElementForm;
