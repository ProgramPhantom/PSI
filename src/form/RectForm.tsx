import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IRectElement } from '../vanilla/rectElement';
import { FormRequirements } from './FormHolder';
import VisualForm from './VisualForm';

interface IRectFormProps extends FormRequirements{

}

const RectElementForm: React.FC<IRectFormProps> = (props) => {
    const formControls = useFormContext<IRectElement>();

    return (
    <>
        <VisualForm target={props.target} widthDisplay={true} heightDisplay={true}></VisualForm>
    </>
    );
}

    
export default RectElementForm