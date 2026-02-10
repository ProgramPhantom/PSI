import {
	ControlGroup,
	Divider,
	Section,
} from "@blueprintjs/core";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { IChannel } from "../../logic/hasComponents/channel";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import TextForm from "./TextForm";
import RectForm from "./RectForm";
import FormDivider from "./FormDivider";
import ENGINE from "../../logic/engine";
import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import { Controller } from "react-hook-form";

import Collection from "../../logic/collection";

interface ChannelFormProps extends FormRequirements {
}

const ChannelForm: React.FC<ChannelFormProps> = (props) => {
	const formControls = useFormContext<IChannel>();

	// Auto populate sequence if not set (yes this is required... 😩)
	// HTMLSelect breaks if undefined is passed, and defaultValue doesn't work
	useEffect(() => {
		if (!formControls.getValues("parentId") && ENGINE.handler.diagram.sequences.length > 0) {
			formControls.setValue("parentId", ENGINE.handler.diagram.sequences[0].id);
		}
	}, [formControls]);

	let vals = formControls.getValues();

	let labelPrefix: string | undefined = undefined;
	let barPrefix: string | undefined = undefined;

	if (Collection.isCollection(vals)) {
		const labelIndex = (vals.children || []).findIndex(
			(c) => c.role === "label"
		);
		if (labelIndex !== -1) labelPrefix = `children.${labelIndex}`;

		const barIndex = (vals.children || []).findIndex(
			(c) => c.role === "bar"
		);
		if (barIndex !== -1) barPrefix = `children.${barIndex}`;
	}
	return (
		<>
			<ControlGroup vertical={true}>

				<FormDivider title="Channel" topMargin={0} />

				<FormGroup
					label="Sequence"
					labelFor="sequence-select"
					style={{ marginBottom: "10px", }}
				>
					<Controller defaultValue={ENGINE.handler.diagram.sequences[0]?.id}
						control={formControls.control}
						name="parentId"
						render={({ field }) => (
							<HTMLSelect
								{...field}
								id="sequence-select"
								fill={true}
								options={[
									...ENGINE.handler.diagram.sequences.map((seq) => ({
										label: `${seq.ref} (id: ${seq.id})`,
										value: seq.id,
									})),
								]}
							/>
						)}
					/>
				</FormGroup>

				<VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>



				{/* ----------------- Label ----------------- */}


				{labelPrefix && (
					<>
						<FormDivider title="Label" />
						<Section
							icon="label"
							style={{ borderRadius: 0 }}
							collapseProps={{ defaultIsOpen: false }}
							compact={true}
							title={"Label"}
							collapsible={true}
						>
							<div style={{ padding: "8px" }}>
								<TextForm
									prefix={labelPrefix}
									target={props.target}
								/>
							</div>
						</Section>
					</>
				)}


				{/* ----------------- Bar ----------------- */}
				{barPrefix && (
					<>
						<FormDivider title="Bar" />
						<Section
							icon="rectangle"
							style={{ borderRadius: 0 }}
							collapseProps={{ defaultIsOpen: false }}
							compact={true}
							title={"Bar"}
							collapsible={true}
						>
							<div style={{ padding: "8px" }}>
								<RectForm
									prefix={barPrefix}
									target={props.target}
								/>
							</div>
						</Section>
					</>
				)}




			</ControlGroup>
		</>
	);
};

export default ChannelForm;
