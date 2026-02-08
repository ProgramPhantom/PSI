import { Card } from "@blueprintjs/core";
import React from "react";
import { AllComponentTypes } from "../logic/point";
import Visual from "../logic/visual";
import { FormDiagramInterface } from "./form/FormDiagramInterface";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedElementId } from "../redux/applicationSlice";
import ENGINE from "../logic/engine";


interface IFormProps {
}

const Form: React.FC<IFormProps> = (props) => {
	const selectedElementId = useAppSelector((state) => state.application.selectedElementId);
	const dispatch = useAppDispatch();
	const target = ENGINE.handler.identifyElement(selectedElementId ?? "");

	var targetType: AllComponentTypes = target
		? (target.constructor as typeof Visual).ElementType
		: "channel";

	return (
		<>
			<Card
				style={{
					padding: "4px 12px",
					height: "100%",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					borderLeft: "1px solid #c3c3c4"
				}}>
				<FormDiagramInterface
					target={target}
					changeTarget={(val) => dispatch(setSelectedElementId(val?.id))}
					targetType={targetType}
				/>
			</Card>
		</>
	); // Use key in Dynamic form so it forces a remount, triggering the initial values in the form // ?
};

export default Form;
