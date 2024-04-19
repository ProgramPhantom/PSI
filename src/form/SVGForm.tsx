import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { labelInterface } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import TemporalForm from './TemporalForm';



function SVGForm(props: {control: Control<any>, change: () => void}) {

  

  const onSubmit = (data: FieldValues) => console.log(data);
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onChange={() => {console.log("CHANGE")}} onSubmit={() => props.change()}>

      <h3>SVG Pulse</h3>

      <ControlGroup vertical={true}>
        <FormGroup
            fill={false}
            inline={true}
            label="SVG"
            labelFor="text-input">
            
            <Controller control={props.control} name="path" render={({field}) => (
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

        <Section
            compact={true}
            title={"Style"}
            collapsible={true}
            >
            <ControlGroup vertical={true}>
                <FormGroup
                inline={true}
                label="Width"
                labelFor="text-input">
                    <Controller control={props.control} name="style.width" render={({field}) => (
                        <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                    </Controller>
                </FormGroup>

                <FormGroup
                    inline={true}
                    label="Height"
                    labelFor="text-input">
                    <Controller control={props.control} name="style.height" render={({field}) => (
                        <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                    </Controller>
                </FormGroup>
            </ControlGroup>
        </Section>

        <TemporalForm control={props.control} change={props.change}></TemporalForm>

      </ControlGroup>


    </form>
  );
}
    
export default SVGForm