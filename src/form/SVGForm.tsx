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
import { ClassProperties, UpdateObj } from '../vanilla/util';
import Channel from '../vanilla/channel';
import { Visual } from '../vanilla/visual';
import Positional from '../vanilla/positional';
import VisualForm from './VisualForm';

interface ISVGForm {
    handler: SequenceHandler, 
    values: PositionalSVG,
    channel: Channel,
    target?:  Positional<SVGElement>,
    reselect: (positional: Positional<Visual> | undefined) => void
}

const SVGForm: React.FC<ISVGForm> = (props) => {
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<PositionalSVG>({
        defaultValues: {...props.values},
        mode: "onChange"
    });
  

  const onSubmit = (data: PositionalSVG) => {
    // Create new element
    var newSVG: SVGElement = new SVGElement(data);

    // Create the new positional
    var positionalSVG: Positional<SVGElement> = new Positional<SVGElement>(newSVG, props.channel, {config: data.config})

    if (props.target !== undefined) {
        // MODIFICATION
        props.handler.modifyPositional(props.target, positionalSVG)
    } else {
        // ADDITION
        props.handler.positional("180", props.handler.channels[0].identifier, data)
    }

    // Select this new element
    props.reselect(positionalSVG);
  };

  const deleteMe = () => {
    if (props.target === undefined) {return} 

    props.handler.deletePositional(props.target);
    props.reselect(undefined);
  }
  
  return (
    <>
<div style={{display: "flex", flexDirection: "row", width: "100%"}}>
        <h3>{props.target ? props.target.element.refName : "Rect pulse"}</h3>
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
                
                <VisualForm control={control} change={() => {}}></VisualForm>
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