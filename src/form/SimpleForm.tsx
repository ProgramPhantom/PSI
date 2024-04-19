import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { labelInterface } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import TemporalForm from './TemporalForm';
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';



function SimpleForm(props: {control: Control<any>, change: () => void}) {

  

  const onSubmit = (data: FieldValues) => console.log(data);
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onChange={() => {console.log("CHANGE")}} onSubmit={() => props.change()}>
        <h3>Simple Pulse</h3>

        <Tabs defaultSelectedTabId={"core"}>
            <Tab id="core" title="Core" panel={
                <>
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
    
                    <FormGroup
                        inline={true}
                        label="Fill"
                        labelFor="text-input">
    
                        <Controller control={props.control} name="style.fill" render={({field}) => (
                            <input type={"color"} {...field}></input>)}>
                        </Controller>
                    </FormGroup>
    
                    <FormGroup
                        inline={true}
                        label="Stroke"
                        labelFor="text-input">
    
                        <Controller control={props.control} name="style.stroke" render={({field}) => (
                            <input type={"color"} {...field}></input>)}>
                        </Controller>
                    </FormGroup>
    
                    <FormGroup
                        inline={true}
                        label="Stroke Width"
                        labelFor="text-input">
                        <Controller control={props.control} name="style.strokeWidth" render={({field}) => (
                            <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                        </Controller>
                    </FormGroup>
                </ControlGroup>
                </Section>
    
    
                <TemporalForm control={props.control} change={props.change}></TemporalForm>
                </>
                
            } />
            <Tab id="label" title="Label" panel={<LabelForm control={props.control} change={props.change}></LabelForm>}/>
            <Tab id="arrow" title="Arrow" panel={<ArrowForm control={props.control} change={props.change}></ArrowForm>} />

            </Tabs>
        <ControlGroup vertical={true}>
        

      </ControlGroup>


    </form>
  );
}
    
export default SimpleForm