import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { labelInterface } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";


function LabelForm() {

  const { control, handleSubmit } = useForm({
    defaultValues: {
      label: {
        text: "bruh",
        padding: [10, 15, 0, 0],

        position: "top",
        
        style: {
          size: 10,
          colour: "#ffffff",
          background: undefined,
        }
      }
    }
  });
  const onSubmit = (data: FieldValues) => console.log(data);
  

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Label</h2>
      <ControlGroup vertical={true}>
        <FormGroup
          fill={false}
          inline={true}
          label="Text"
          helperText="LaTeX input"
          labelFor="text-input">
          
          <Controller control={control} name="label.text" render={({field}) => (
            <InputGroup {...field} id="text" placeholder="\textrm{H}" small={true} />
            )}>
          </Controller>
          
        </FormGroup>

        <FormGroup
          fill={false}
          inline={true}
          label="Position"
          labelFor="text-input">
          
          <Controller control={control} name="label.position" render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down'>
                <option>Top</option>
                <option>Right</option>
                <option>Bottom</option>
                <option>Left</option>
                <option>Centre</option>
              </HTMLSelect>
            )}>
          </Controller>
          
        </FormGroup>

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
              <Controller control={control} name="label.padding.0" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding right"
              labelFor="text-input">
              <Controller control={control} name="label.padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={control} name="label.padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding left"
              labelFor="text-input">
              <Controller control={control} name="label.padding.3" render={({field}) => (
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
              label="Size"
              labelFor="text-input">
              <Controller control={control} name="label.style.size" render={({field}) => (
                <Slider {...field} max={60} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Size"
              labelFor="text-input">
              <Controller control={control} name="label.style.colour" render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Background"
              labelFor="text-input">

              <Controller control={control} name="label.style.background" render={({ field: { onChange, onBlur, value, ref } }) => (
                
                <input type={"color"} value={value} ></input>
                
                )}>
              </Controller>
          </FormGroup>
        </Section>

      </ControlGroup>
      
      
      


      <input type="submit" />
    </form>
  );
}
    
export default LabelForm