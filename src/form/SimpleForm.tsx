import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, Divider, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import PositionalForm from './PositionalForm';
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import { Divide } from '@blueprintjs/icons';



function SimpleForm(props: {control: Control<any>, change: () => void}) {

  

  const onSubmit = (data: FieldValues) => console.log(data);
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onChange={() => {console.log("CHANGE")}} onSubmit={() => props.change()}>
        <h3>Simple Pulse</h3>

        <Tabs defaultSelectedTabId={"core"} animate={false}>
            <Tab id="core" title="Core" panel={
                <>
                <Section
                    style={{borderRadius: 0}}
                    collapseProps={{defaultIsOpen: false}}
                    compact={true}
                    title={"Style"}
                    collapsible={true}
                    >
                    <ControlGroup vertical={true} style={{padding: 10, gap: 6, alignContent: "center", justifyContent: "center"}}>
                        <FormGroup
                            label="Width"
                            labelFor="text-input">
                            <Controller control={props.control} name="style.width" render={({field}) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true} fill={true}></NumericInput>)}>
                            </Controller>
                        </FormGroup>
        
                        <FormGroup
                            label="Height"
                            labelFor="text-input">
                            <Controller control={props.control} name="style.height" render={({field}) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true} fill={true}></NumericInput>)}>
                            </Controller>
                        </FormGroup>

                        <Divider></Divider>
        
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
    
    
                <PositionalForm control={props.control} change={props.change}></PositionalForm>
                </>
                
            } />
            <Tab id="label" title="Label" panel={<LabelForm control={props.control} change={props.change}></LabelForm>}/>
            <Tab id="arrow" title="Arrow" panel={<ArrowForm control={props.control} change={props.change}></ArrowForm>} />

        </Tabs>

    </form>
  );
}
    
export default SimpleForm