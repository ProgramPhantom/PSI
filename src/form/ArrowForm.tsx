import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';
import { IArrow } from '../vanilla/arrow';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { ILabel } from '../vanilla/label';
import VisualForm from './VisualForm';


function ArrowForm() {
  const formControls = useFormContext<ILabel>();

  return (
    <>
      <ControlGroup vertical={true} style={{width: "100%"}}>
        {/* Arrowhead style */}
        <FormGroup style={{padding: "4px 8px", margin: 0}}
          fill={false}
          inline={true}
          label="Arrowhead style"
          labelFor="text-input">
          <Controller control={formControls.control} name="line.arrowStyle.headStyle" render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down' >
                <option value={"default"}>Default</option>
                <option value={"thin"}>Thin</option>
                <option value={"None"}>None</option>
              </HTMLSelect>
            )}>
          </Controller>
        </FormGroup>

        {/* Visual form */}
        <VisualForm widthDisplay={false} heightDisplay={false}></VisualForm>

        <Section 
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Stroke thickness"
              labelFor="text-input">
              <Controller control={formControls.control} name="line.style.thickness" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={0} small={true}></NumericInput>)}>
              </Controller>
          </FormGroup>


          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Stroke"
              labelFor="text-input">

              <Controller control={formControls.control} name="line.style.stroke" render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>

          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Dashing"
              labelFor="text-input">

              <div style={{display: "flex", flexDirection: "row"}}>
                <Controller control={formControls.control} name="line.style.dashing.0" render={({field}) => (
                  <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
                </Controller>
                <Controller control={formControls.control} name="line.style.dashing.1" render={({field}) => (
                  <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
                </Controller>
              </div>
          </FormGroup>

        </Section>
        
        {/* Adjustment */}
        <FormGroup  style={{padding: "4px 8px", margin: 0}}
            inline={true}
            label="Adjustment"
            labelFor="text-input">

            <div style={{display: "flex", flexDirection: "row"}}>
              <Controller control={formControls.control} name="line.adjustment.0" render={({field}) => (
                <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
              </Controller>
              <Controller control={formControls.control} name="line.adjustment.1" render={({field}) => (
                <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
              </Controller>
            </div>
        </FormGroup>
      </ControlGroup>
    </>
  );
}
    
export default ArrowForm