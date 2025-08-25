import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import SequenceHandler from '../vanilla/sequenceHandler';
import SVGElement, { ISVG } from '../vanilla/svgElement';
import { svgPulses } from '../vanilla/default/data/svgPulse';
import { dataTypes } from '@data-driven-forms/react-form-renderer';
import { ClassProperties, UpdateObj } from '../vanilla/util';
import Channel from '../vanilla/channel';
import { Visual } from '../vanilla/visual';
import Labellable from '../vanilla/labellable';
import VisualForm from './VisualForm';
import { FormRequirements } from './FormHolder';

interface ISVGElementFormProps extends FormRequirements {

}


const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
    const formControls = useFormContext<ISVG>();

    return (
    <>

        {/* SVG Specific fields */}
        <FormGroup
            fill={false}
            inline={true}
            label="SVG"
            labelFor="text-input">
            <Controller control={formControls.control} name="path" render={({field}) => (
                <HTMLSelect {...field} iconName='caret-down'>
                    <option value={"\\src\\assets\\aquire2.svg"}>Aquire</option>
                    <option value={"\\src\\assets\\saltirelohi.svg"}>SaltireHiLo</option>
                    <option value={"\\src\\assets\\saltirehilo.svg"}>SaltireLoHi</option>
                    <option value={"\\src\\assets\\halfsine.svg"}>Half Sine</option>
                    <option value={"\\src\\assets\\chirphilo.svg"}>ChripHiLo</option>
                    <option value={"\\src\\assets\\chirplohi.svg"}>ChirpLoHi</option>
                    <option value={"\\src\\assets\\ampseries.svg"}>Amp Series</option>
                    <option value={"\\src\\assets\\180.svg"}>Soft 180</option>
                    <option value={"\\src\\assets\\trapezium.svg"}>Trapezium</option>
                    <option value={"\\src\\assets\\talltrapezium.svg"}>Tall Trapezium</option>
                </HTMLSelect>
                )}>
            </Controller>
        </FormGroup>
        
        <VisualForm target={props.target} heightDisplay={true} widthDisplay={true}></VisualForm>
    </>
    );
}

    
export default SVGElementForm