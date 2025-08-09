import React from 'react';
import VisualForm from './VisualForm';
import { FormRequirements } from './FormHolder';
import { useFormContext } from 'react-hook-form';
import { IRect } from '../vanilla/rectElement';



const RectElementForm: React.FC<FormRequirements> = () => {
    const formControls = useFormContext<IRect>();

    return (
    <>
        <VisualForm></VisualForm>
    </>
    );
}

    
export default RectElementForm