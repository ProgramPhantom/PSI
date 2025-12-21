import {
	ControlGroup,
	Divider,
	FormGroup,
	InputGroup,
	NumericInput,
	Section,
	Slider
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IChannel } from "../../logic/hasComponents/channel";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";

interface ChannelFormProps extends FormRequirements {
	onSubmit: (data: IChannel) => void;
}

const ChannelForm: React.FC<ChannelFormProps> = (props) => {
	const formControls = useFormContext<IChannel>();

	return (
		<>
			<ControlGroup vertical={true}>
				{/* Text */}
				<FormGroup
					fill={false}
					inline={true}
					label="Label"
					helperText="LaTeX"
					labelFor="text-input">
					<Controller
						control={formControls.control}
						name={"label.text"}
						render={({field}) => (
							<InputGroup
								{...field}
								id="text"
								placeholder="_1\textrm{H}"
								size="small"
							/>
						)}></Controller>
				</FormGroup>

				<VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>

				{/* Label stuff */}
				<Section
					collapseProps={{defaultIsOpen: false}}
					compact={true}
					title={"Style"}
					collapsible={true}>
					<FormGroup label="Thickness" labelFor="text-input">
						<Controller
							control={formControls.control}
							name="style.thickness"
							render={({field}) => (
								<NumericInput
									{...field}
									onValueChange={field.onChange}
									min={1}
									small={true}
									fill={true}></NumericInput>
							)}></Controller>
					</FormGroup>

					<Divider></Divider>

					<FormGroup inline={true} label="Fill" labelFor="text-input">
						<Controller
							control={formControls.control}
							name="style.barStyle.fill"
							render={({field}) => (
								<input type={"color"} {...field}></input>
							)}></Controller>
					</FormGroup>

					<FormGroup inline={true} label="Stroke" labelFor="text-input">
						<Controller
							control={formControls.control}
							name="style.barStyle.stroke"
							render={({field}) => (
								<input type={"color"} {...field}></input>
							)}></Controller>
					</FormGroup>

					<FormGroup inline={true} label="Stroke Width" labelFor="text-input">
						<Controller
							control={formControls.control}
							name="style.barStyle.strokeWidth"
							render={({field}) => (
								<NumericInput
									{...field}
									onValueChange={field.onChange}
									min={1}
									small={true}></NumericInput>
							)}></Controller>
					</FormGroup>
				</Section>
			</ControlGroup>
		</>
	);
};

export default ChannelForm;
