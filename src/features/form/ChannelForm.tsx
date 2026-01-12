import {
	ControlGroup,
	Divider,
	Section,
} from "@blueprintjs/core";
import React from "react";
import { useFormContext } from "react-hook-form";
import { IChannel } from "../../logic/hasComponents/channel";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import TextForm from "./TextForm";
import RectForm from "./RectForm";
import FormDivider from "./FormDivider";

interface ChannelFormProps extends FormRequirements { }

const ChannelForm: React.FC<ChannelFormProps> = (props) => {
	const formControls = useFormContext<IChannel>();

	return (
		<>
			<ControlGroup vertical={true}>

				<FormDivider title="Channel" topMargin={0} />

				<VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>

				<FormDivider title="Label" />
				<Section icon="label"
					style={{ borderRadius: 0 }}
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Label"}
					collapsible={true}>
					<div style={{ padding: "8px" }}>
						<TextForm prefix="label" target={props.target} />
					</div>
				</Section>


				<FormDivider title="Bar" />
				<Section icon="rectangle"
					style={{ borderRadius: 0 }}
					collapseProps={{ defaultIsOpen: false }}
					compact={true}
					title={"Bar"}
					collapsible={true}>
					<div style={{ padding: "8px" }}>
						<RectForm prefix="bar" target={props.target} />
					</div>
				</Section>




			</ControlGroup>
		</>
	);
};

export default ChannelForm;
