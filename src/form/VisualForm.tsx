import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { ILabel } from '../vanilla/label';

import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import PositionalForm from './PositionalForm';


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
        <PositionalForm control={props.control} change={() => {}}></PositionalForm>
      </ControlGroup>
    </form>
  );
}
    
export default VisualForm