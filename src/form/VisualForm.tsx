import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import MountableForm from './MonutableForm';


function VisualForm(props: {control: Control<any>, change: () => void}) {
  const onSubmit = (data: FieldValues) => {};
  // onSubmit={handleSubmit(onSubmit)}x

  return (
    <form onSubmit={() => props.change()}>
      <ControlGroup vertical={true}>
        {/* Content Size */}
        <FormGroup
            inline={true}
            label="Width"
            labelFor="text-input">
                <Controller control={props.control} name="contentWidth" render={({field}) => (
                    <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                </Controller>
        </FormGroup>

        <FormGroup
            inline={true}
            label="Height"
            labelFor="text-input">
            <Controller control={props.control} name="contentHeight" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
            </Controller>
        </FormGroup>
        
        {/* Positional */}
        <MountableForm control={props.control} change={() => {}}></MountableForm>
      </ControlGroup>
    </form>
  );
}
    
export default VisualForm