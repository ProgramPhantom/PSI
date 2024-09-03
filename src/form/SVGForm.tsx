import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import PositionalForm from './PositionalForm';
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import SequenceHandler from '../vanilla/sequenceHandler';
import SVGElement, { ISVG } from '../vanilla/svgElement';
import { svgPulses } from '../vanilla/default/data/svgPulse';
import { dataTypes } from '@data-driven-forms/react-form-renderer';
import { ClassProperties } from '../vanilla/util';

interface ISVGForm {
    sequence: SequenceHandler, 
    defaultVals: ISVG
}

const SVGForm: React.FC<ISVGForm> = (props) => {
    try {
        Object.setPrototypeOf(props.defaultVals, null)
    } catch {}
    
    console.log(props.defaultVals)
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<ISVG>({
        defaultValues: {...props.defaultVals},
        mode: "onChange"
    });
  

  const onSubmit = (data: ISVG) => {
    console.log(`New data: ${data}`);
  };
  

  return (
    <form onChange={() => {console.log("CHANGE")}} onSubmit={() => handleSubmit(onSubmit)}>

      <h3>SVG Pulse</h3>

      <Tabs defaultSelectedTabId={"core"} animate={false}>
            <Tab id="core" title="Core" panel={
                <>
                <FormGroup
                    fill={false}
                    inline={true}
                    label="SVG"
                    labelFor="text-input">
                <Controller control={control} name="path" render={({field}) => (
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

                <Section style={{borderRadius: 0}}
                    collapseProps={{defaultIsOpen: false}}
                    compact={true}
                    title={"Style"}
                    collapsible={true}
                    >
                    <ControlGroup vertical={true}>
                        <FormGroup
                        inline={true}
                        label="Width"
                        labelFor="text-input">
                            <Controller control={control} name="style.width" render={({field}) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                            </Controller>
                        </FormGroup>

                        <FormGroup
                            inline={true}
                            label="Height"
                            labelFor="text-input">
                            <Controller control={control} name="style.height" render={({field}) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                            </Controller>
                        </FormGroup>
                    </ControlGroup>
                </Section>
    
                <PositionalForm control={control} change={() => {}}></PositionalForm>
                </>
                
            } />
            <Tab id="label" title="Label" panel={<LabelForm control={control} change={() => {}}></LabelForm>}/>
            <Tab id="arrow" title="Arrow" panel={<ArrowForm control={control} change={() => {}}></ArrowForm>} />

      </Tabs>
    </form>
  );
}
    
export default SVGForm