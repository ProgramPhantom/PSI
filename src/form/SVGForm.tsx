import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import PositionalForm from './PositionalForm';
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import SequenceHandler from '../vanilla/sequenceHandler';
import SVGElement, { ISVG, PositionalSVG } from '../vanilla/svgElement';
import { svgPulses } from '../vanilla/default/data/svgPulse';
import { dataTypes } from '@data-driven-forms/react-form-renderer';
import { ClassProperties } from '../vanilla/util';
import Channel from '../vanilla/channel';
import { Visual } from '../vanilla/visual';
import Positional from '../vanilla/positional';

interface ISVGForm {
    handler: SequenceHandler, 
    defaultVals: PositionalSVG,
    channel: Channel 
    target?:  Positional<SVGElement>,
}

const SVGForm: React.FC<ISVGForm> = (props) => {

    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<PositionalSVG>({
        defaultValues: {...props.defaultVals},
        mode: "onChange"
    });
  

  const onSubmit = (data: PositionalSVG) => {
    console.log(`New data: ${data}`);

    var newSVG: SVGElement = new SVGElement(data);
    var positionalSVG: Positional<SVGElement> = new Positional<SVGElement>(newSVG, props.channel, {config: data.config})
    
    if (props.target !== undefined) {
        props.handler.modifyPositional(props.target, positionalSVG)
    } else {
        props.handler.positional("180", props.handler.channels[0].identifier, data)
    }

    props.target = positionalSVG;
  };

  const deleteMe = () => {
    if (props.target === undefined) {return} 

    console.log("deleting positional!")
    props.handler.deletePositional(props.target);
  }
  

  return (
    <>
    <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
        <h3>SVG Pulse</h3>
        {props.target !== undefined ? (
        <button style={{width: "30", height: "30", justifySelf: "end"}} onClick={() => deleteMe()}>
            delete
        </button>) : <></>}


      </div>

    <form onChange={() => {console.log("CHANGE")}} onSubmit={handleSubmit(onSubmit)}>
    
      

      

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
                <FormGroup
                        inline={true}
                        label="Width"
                        labelFor="text-input">
                            <Controller control={control} name="contentWidth" render={({field}) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                            </Controller>
                </FormGroup>

                <FormGroup
                    inline={true}
                    label="Height"
                    labelFor="text-input">
                    <Controller control={control} name="contentHeight" render={({field}) => (
                        <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                    </Controller>
                </FormGroup>
    
                <PositionalForm control={control} change={() => {}}></PositionalForm>
                </>
                
            } />
            <Tab id="label" title="Label" panel={<LabelForm control={control} change={() => {}}></LabelForm>}/>
            <Tab id="arrow" title="Arrow" panel={<ArrowForm control={control} change={() => {}}></ArrowForm>} />

      </Tabs>

      <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
             type={"submit"} value={props.target !== undefined ? "Modify" : "Add"}></input>
    </form>
    </>
  );
}
    
export default SVGForm