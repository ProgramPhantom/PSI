import {
	ControlGroup,
	HTMLSelect
} from "@blueprintjs/core";
import React, { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { IChannel } from "../../logic/hasComponents/channel";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import ENGINE from "../../logic/engine";
import { SimpleField } from "./fields/SimpleField";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

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


	return (
		<>
			<ControlGroup vertical={true} className={styles.formGroupContainer}>
				<SimpleField
					label="Sequence"
					labelFor="sequence-select"
				>
					<Controller defaultValue={ENGINE.handler.diagram.sequences[0]?.id}
						control={formControls.control}
						name="parentId"
						render={({ field }) => (
							<HTMLSelect
								{...field}
								className={fieldStyles.compactHTMLSelect}
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
				</SimpleField>
			</ControlGroup>

			<VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>
		</>
	);
};

export default ChannelForm;
