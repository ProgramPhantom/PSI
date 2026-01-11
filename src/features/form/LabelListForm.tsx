import { Button, Divider, Section } from "@blueprintjs/core";
import { useFormContext, useWatch } from "react-hook-form";
import { defaultLabel } from "../../logic/default/index";
import { ILabel } from "../../logic/hasComponents/label";
import { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import React from "react";
import LabelForm from "./LabelForm";
import { FormRequirements } from "./FormBase";
import { Position } from "../../logic/text";

export type LabelGroupLabels = {
	labels: Partial<Record<Position, ILabel>>;
};

interface ILabelMapProps extends FormRequirements { }

const POSITIONS: Position[] = ["top", "bottom", "left", "right"];

function LabelListForm(props: ILabelMapProps) {
	const parentFormControls = useFormContext<LabelGroupLabels>();

	// Watch the labels object to trigger re-renders
	const labels = useWatch({
		control: parentFormControls.control,
		name: "labels"
	});

	const addLabel = (pos: Position) => {
		// Set the default label at the specific position
		parentFormControls.setValue(`labels.${pos}`, structuredClone(defaultLabel), { shouldDirty: true });
	};

	const removeLabel = (pos: Position) => {
		// Unset the label at the specific position
		// passing undefined might not work depending on strict null checks, but usually it does for partial records in react-hook-form 
		// if we use unregister it completely removes the field from data.
		parentFormControls.setValue(`labels.${pos}`, undefined as any, { shouldDirty: true });
		parentFormControls.unregister(`labels.${pos}`);
	};

	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch"
				}}>

				{POSITIONS.map((pos) => {
					// Check if label exists at this position
					const hasLabel = labels?.[pos] !== undefined && labels[pos] !== null;

					return (
						<Section style={{ borderRadius: "0px", padding: "0px" }}
							key={pos}
							collapsible={hasLabel}
							title={`${pos.charAt(0).toUpperCase() + pos.slice(1)}`}
							compact={true}
							icon={
								hasLabel ? (
									<Button
										icon="trash"
										intent="danger"
										variant="minimal"
										onClick={(e) => {
											e.stopPropagation();
											removeLabel(pos);
										}}></Button>
								) : (
									<Button
										icon="add"
										intent="success"
										variant="minimal"
										onClick={(e) => {
											e.stopPropagation();
											addLabel(pos);
										}}></Button>
								)
							}>
							{hasLabel && (
								<div style={{ padding: "8px" }}>
									<LabelForm prefix={`labels.${pos}`}></LabelForm>
								</div>
							)}
						</Section>
					);
				})}
			</div>
		</>
	);
}

export default LabelListForm;
