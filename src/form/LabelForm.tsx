import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";


function LabelForm(props: {control: Control<any>, change: () => void}) {

  const onSubmit = (data: FieldValues) => console.log(data);

  return (
    <form onSubmit={() => props.change()}>
      <FormGroup
          fill={false}
          inline={true}
          label="Label On"
          labelFor="text-input">
          
          <Controller control={props.control} name="labelOn" render={({field}) => (
              <Switch {...field}></Switch>
              )}>
          </Controller>
      </FormGroup>
      
      <ControlGroup vertical={true}>
        <FormGroup
          fill={false}
          inline={true}
          label="Text"
          helperText="LaTeX input"
          labelFor="text-input">
          
          <Controller control={props.control} name="label.text" render={({field}) => (
            <InputGroup {...field} id="text" placeholder="\textrm{H}" small={true} />
            )}>
          </Controller>
          
        </FormGroup>

        <FormGroup 
          fill={false}
          inline={true}
          label="Position"
          labelFor="text-input">
          
          <Controller control={props.control} name="label.position" render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down'>
                <option value="top">Top</option>
                <option value="right">Right</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="centre">Centre</option>
              </HTMLSelect>
            )}>
          </Controller>
          
        </FormGroup>

        <Section
          collapseProps={{defaultIsOpen: false}}
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
              <Controller control={props.control} name="label.padding.0" render={({field: { onChange, onBlur, value, name, ref },}) => (
                <Slider value={value} onChange={onChange} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding right"
              labelFor="text-input">
              <Controller control={props.control} name="label.padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={props.control} name="label.padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding left"
              labelFor="text-input">
              <Controller control={props.control} name="label.padding.3" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>


          </ControlGroup>
        </Section>

        <Section
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup
              inline={true}
              label="Size"
              labelFor="text-input">
              <Controller control={props.control} name="label.style.size" render={({field}) => (
                <Slider {...field} max={60} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Size"
              labelFor="text-input">
              <Controller control={props.control} name="label.style.colour" render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Background"
              labelFor="text-input">

              <Controller control={props.control} name="label.style.background" render={({ field: { onChange, onBlur, value, ref } }) => (
                
                <input type={"color"} value={value} ></input>
                
                )}>
              </Controller>
          </FormGroup>
        </Section>

      </ControlGroup>
    </form>
  );
}
    
export default LabelForm