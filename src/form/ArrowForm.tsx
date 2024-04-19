import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { labelInterface } from '../vanilla/label';
import { arrowInterface } from '../vanilla/arrow';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";


function ArrowForm(props: {control: Control<any>, change: () => void}) {

  

  const onSubmit = (data: FieldValues) => console.log(data);
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onChange={() => {console.log("CHANGE")}}>
      <FormGroup
          fill={false}
          inline={true}
          label="Arrow On"
          labelFor="text-input">
          
          <Controller control={props.control} name="arrowOn" render={({field}) => (
              <Switch {...field}></Switch>
              )}>
          </Controller>
      </FormGroup>

      <ControlGroup vertical={true}>
        <FormGroup
          fill={false}
          inline={true}
          label="Position"
          labelFor="text-input">
          
          <Controller control={props.control} name="arrow.position" render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down' >
                <option value={"top"}>Top</option>
                <option value={"inline"}>Inline</option>
                <option value={"bottom"}>Bottom</option>
              </HTMLSelect>
            )}>
          </Controller>
          
        </FormGroup>

        {/* PADDING */}
        <Section
          compact={true}
          title={"Padding"}
          collapsible={true}
          >
          <ControlGroup
            vertical={true}
            >
            <FormGroup
              fill={false}
              inline={true}
              label="Padding top"
              labelFor="text-input">
              <Controller control={props.control} name="arrow.padding.0" render={({field: { onChange, onBlur, value, name, ref },}) => (
                <Slider value={value} onChange={onChange} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding right"
              labelFor="text-input">
              <Controller control={props.control} name="arrow.padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={props.control} name="arrow.padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding left"
              labelFor="text-input">
              <Controller control={props.control} name="arrow.padding.3" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>
          </ControlGroup>
        </Section>

        <Section
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup
              inline={true}
              label="Thickness"
              labelFor="text-input">
              <Controller control={props.control} name="arrow.style.thickness" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={0} small={true}></NumericInput>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Head Style"
              labelFor="text-input">

              <Controller control={props.control} name="arrow.style.headStyle" render={({field}) => (
                <HTMLSelect {...field} iconName='caret-down'>
                  <option value={"default"}>Default</option>
                  <option value={"thin"}>Thin</option>
                </HTMLSelect>
                )}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Stroke"
              labelFor="text-input">

              <Controller control={props.control} name="arrow.style.stroke" render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>
        </Section>

      </ControlGroup>
    </form>
  );
}
    
export default ArrowForm