import { Controller, useFormContext } from "react-hook-form";
import { FormRequirements } from "./FormBase";
import { IGrid } from "../../logic/grid";
import { useState } from "react";
import { ControlGroup, FormGroup, Label } from "@blueprintjs/core";
import VisualForm from "./VisualForm";



interface IGridFormProps extends FormRequirements { }



export const GridForm: React.FC<IGridFormProps> = (props) => {
	const formControls = useFormContext<IGrid>();

	var formSate = formControls.getValues();
	return (
		<>
			<VisualForm target={props.target} heightDisplay={true} widthDisplay={true}></VisualForm>
		</>
	);
};