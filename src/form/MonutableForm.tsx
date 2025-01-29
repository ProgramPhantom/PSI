import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";


function MountableForm(props: {control: Control<any>, change: () => void}) {
  const onSubmit = (data: FieldValues) => console.log(data);
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onSubmit={() => props.change()}>
      <ControlGroup vertical={true}>
        {/* Padding */}
        <Section style={{borderRadius: 0}}
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Padding"}
          collapsible={true}
          >
          <ControlGroup
            vertical={true}
            style={{gap: 10}}
            >
            <FormGroup
              fill={false}
              inline={true}
              label="Padding top"
              labelFor="text-input">
              <Controller control={props.control} name="padding.0" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding right"
              labelFor="text-input">
              <Controller control={props.control} name="padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={props.control} name="padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding left"
              labelFor="text-input">
              <Controller control={props.control} name="padding.3" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>
          </ControlGroup>
        </Section>

        {/* Offset */}
        <Section style={{borderRadius: 0}}
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Offset"}
          collapsible={true}
          >
          <ControlGroup
            vertical={true}
            >
            <FormGroup
              fill={false}
              inline={true}
              label="Offset X"
              labelFor="text-input">
              <Controller control={props.control} name="offset.0" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={-50} max={50} small={true}></NumericInput>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Offset Y"
              labelFor="text-input">
              <Controller control={props.control} name="offset.1" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={-50} max={50} small={true}></NumericInput>)}>
              </Controller>
            </FormGroup>
          </ControlGroup>
        </Section>

        {/* Config */}
        <Section style={{borderRadius: 0}}
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Config"}
          collapsible={true}
          >
          <ControlGroup
            vertical={true}
            >
            <FormGroup
                fill={false}
                inline={true}
                label="Orientation"
                labelFor="text-input">
                
                <Controller control={props.control} name="mountConfig.orientation" render={({field}) => (
                    <HTMLSelect {...field} iconName='caret-down'>
                        <option value={"top"}>Top</option>
                        <option value={"both"}>Both</option>
                        <option value={"bottom"}>Bottom</option>
                    </HTMLSelect>
                    )}>
                </Controller>
            </FormGroup>
            

            <FormGroup
                fill={false}
                inline={true}
                label="Alignment"
                labelFor="text-input">
                
                <Controller control={props.control} name="mountConfig.alignment" render={({field}) => (
                    <HTMLSelect {...field} iconName='caret-down'>
                        <option value={"here"}>Left</option>
                        <option value={"centre"}>Centre</option>
                        <option value={"far"}>Right</option>
                    </HTMLSelect>
                    )}>
                </Controller>
            </FormGroup>

            <FormGroup
                fill={false}
                inline={true}
                label="Inherit Width"
                labelFor="text-input">
                
                <Controller control={props.control} name="mountConfig.inheritWidth" render={({field}) => (
                    <Switch {...field}></Switch>
                    )}>
                </Controller>
            </FormGroup>


            <FormGroup
              fill={false}
              inline={true}
              label="No Sections"
              labelFor="text-input">
              <Controller control={props.control} name="mountConfig.noSections" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={1} max={10} small={true}></NumericInput>)}>
              </Controller>
            </FormGroup>

          </ControlGroup>
        </Section>
      </ControlGroup>
    </form>
  );
}
    
export default MountableForm