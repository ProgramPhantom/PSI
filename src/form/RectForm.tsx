import React from 'react';
import VisualForm from './VisualForm';
import { FormRequirements } from './FormHolder';
import { useFormContext } from 'react-hook-form';
import { IRectElement } from '../vanilla/rectElement';
import { Visual } from '../vanilla/visual';

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