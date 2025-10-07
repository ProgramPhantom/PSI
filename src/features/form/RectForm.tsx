import React from "react";
import {useFormContext} from "react-hook-form";
import {IRectElement} from "../../logic/rectElement";
import {FormRequirements} from "./FormDiagramInterface";
import VisualForm from "./VisualForm";

interface IRectFormProps extends FormRequirements {}

const RectElementForm: React.FC<IRectFormProps> = (props) => {
  const formControls = useFormContext<IRectElement>();

  return (
    <>
      <VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>
    </>
  );
};

export default RectElementForm;
