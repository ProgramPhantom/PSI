import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { IVisual, Visual } from '../vanilla/visual';


const VisualForm: React.FC = () => {
  const formControls = useFormContext<IVisual>();
  
  console.log("vals in vis")
  console.log(formControls.getValues())
  return (
      <ControlGroup vertical={true}>
        {/* Content Width */}
        <FormGroup
            inline={true}
            label="Width"
            labelFor="text-input">
                <Controller control={formControls.control} name="contentWidth" render={({field}) => (
                    <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
                </Controller>
        </FormGroup>
        
        {/* Content Height */}
        <FormGroup
            inline={true}
            label="Height"
            labelFor="text-input">
            <Controller control={formControls.control} name="contentHeight" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={1} small={true}></NumericInput>)}>
            </Controller>
        </FormGroup>
        
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
            {/* Orientation */}
            <FormGroup
                fill={false}
                inline={true}
                label="Orientation"
                labelFor="text-input">
                
                <Controller control={formControls.control} name="mountConfig.orientation" render={({field}) => (
                    <HTMLSelect {...field} iconName='caret-down'>
                        <option value={"top"}>Top</option>
                        <option value={"both"}>Both</option>
                        <option value={"bottom"}>Bottom</option>
                    </HTMLSelect>
                    )}>
                </Controller>
            </FormGroup>
            
            {/* Alignment */}
            <FormGroup
                fill={false}
                inline={true}
                label="Alignment"
                labelFor="text-input">
                
                <Controller control={formControls.control} name="mountConfig.alignment" render={({field}) => (
                    <HTMLSelect {...field} iconName='caret-down'>
                        <option value={"here"}>Left</option>
                        <option value={"centre"}>Centre</option>
                        <option value={"far"}>Right</option>
                    </HTMLSelect>
                    )}>
                </Controller>
            </FormGroup>

            {/* Inherit Width */}
            <FormGroup
                fill={false}
                inline={true}
                label="Inherit Width"
                labelFor="text-input">
                
                <Controller control={formControls.control} name="mountConfig.inheritWidth" render={({field}) => (
                    <Switch {...formControls.getFieldState}></Switch>
                    )}>
                </Controller>
            </FormGroup>

            {/* No Sections */}
            <FormGroup
              fill={false}
              inline={true}
              label="No Sections"
              labelFor="text-input">
              <Controller control={formControls.control} name="mountConfig.noSections" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={1} max={10} small={true}></NumericInput>)}>
              </Controller>
            </FormGroup>

          </ControlGroup>
        </Section>

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
              <Controller control={formControls.control} name="padding.0" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding right"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup
              fill={false}
              inline={true}
              label="Padding left"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.3" render={({field}) => (
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
          collapsible={true}>
          <ControlGroup
              vertical={true}
              >
              <FormGroup
                  fill={false}
                  inline={true}
                  label="Offset X"
                  labelFor="text-input">
                  <Controller control={formControls.control} name="offset.0" render={({field}) => (
                      <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small"></NumericInput>)}>
                  </Controller>
              </FormGroup>
                    
              <FormGroup
              fill={false}
              inline={true}
              label="Offset Y"
              labelFor="text-input">
              <Controller control={formControls.control} name="offset.1" render={({field}) => (
                  <NumericInput {...field}  min={-50} max={50} onValueChange={field.onChange}  size="small"></NumericInput>)}>
              </Controller>
              </FormGroup>
          </ControlGroup>
        </Section>
      
      </ControlGroup>
  );
}
    
export default VisualForm