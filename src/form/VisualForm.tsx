import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { IVisual, Visual } from '../vanilla/visual';
import { FormRequirements } from './FormHolder';

interface IVisualFormProps extends FormRequirements {
  widthDisplay?: boolean,
  heightDisplay?: boolean,
}


const VisualForm: React.FC<IVisualFormProps> = (props) => {
  const formControls = useFormContext<IVisual>();

  var widthActive = props.target ? (props.target.sizeSource.x === "inherited" ? false : true) : true;
  var heightActive = props.target ? (props.target.sizeSource.y === "inherited" ? false : true) : true;

  var vals = formControls.getValues();
  return (
      <ControlGroup vertical={true}>
        
        {/* Text */}
        <FormGroup style={{userSelect: "none"}}
            fill={false}
            inline={true}
            label="Reference"
            labelFor="text-input">
        
            <Controller control={formControls.control} name="ref" render={({field}) => (
                <InputGroup {...field} id="text" size="small"/>
                )}>
            </Controller>
        </FormGroup>


        { /* Width and height */ }
        {/* Content Width */}
        { vals.contentWidth !== undefined && props.widthDisplay ? <>
          <FormGroup
              inline={true}
              label="Width"
              labelFor="text-input">
                  <Controller control={formControls.control} name="contentWidth" render={({field}) => (
                      <NumericInput {...field} onValueChange={field.onChange} min={1} size="small"
                      disabled={!widthActive} title={!widthActive ? "Width inherited" : ""}></NumericInput>)}>
                  </Controller>
          </FormGroup>
        </> : <></>}
        
        {/* Content Height */}
        { vals.contentHeight !== undefined && props.heightDisplay ? <> 
        <FormGroup
            inline={true}
            label="Height"
            labelFor="text-input">
            <Controller control={formControls.control} name="contentHeight" render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={1} size="small"
                disabled={!heightActive} title={!widthActive ? "Height inherited" : ""}></NumericInput>)}>
            </Controller>
        </FormGroup>
        </> : <></>}

        {/* Config */}
        { vals.mountConfig !== undefined ? 
          <>
          
          <Section style={{borderRadius: 0, }}
            collapseProps={{defaultIsOpen: false}}
            compact={true}
            title={"Config"}
            collapsible={true}
            >
            <ControlGroup
              vertical={true}
              >
              {/* Orientation */}
              <FormGroup style={{padding: "4px 8px"}}
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
              <FormGroup style={{padding: "4px 8px"}}
                  fill={false}
                  inline={true}
                  label="Alignment"
                  labelFor="text-input">
                  
                  <Controller control={formControls.control} name="mountConfig.alignment" render={({field}) => (
                      <HTMLSelect {...field} iconName='caret-down'>
                          <option value={"here"}>Left</option>
                          <option value={"centre"}>Centre</option>
                          <option value={"far"}>Right</option>
                          <option value={"stretch"}>Stretch</option>
                      </HTMLSelect>
                      )}>
                  </Controller>
              </FormGroup>

              {/* No Sections */}
              <FormGroup style={{padding: "4px 8px", margin: 0}}
                fill={false}
                inline={true}
                label="No Sections"
                labelFor="text-input">
                <Controller control={formControls.control} name="mountConfig.noSections" render={({field}) => (
                  <NumericInput {...field} onValueChange={field.onChange} size="small"></NumericInput>)}>
                </Controller>
              </FormGroup>

            </ControlGroup>
          </Section>
          </>  : <></>
        }
        

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
            <FormGroup style={{padding: "4px 16px"}}
              fill={false}
              label="Padding top"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.0" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px"}}
              fill={false}
              label="Padding right"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px"}}
              fill={false}
              label="Padding bottom"
              labelFor="text-input">
              <Controller control={formControls.control} name="padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px", margin: 0}}
              fill={false}
              label="Padding left"
              labelFor="slider3">
              <Controller  control={formControls.control} name="padding.3" render={({field}) => (
                <Slider  {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
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
              <FormGroup style={{padding: "4px 8px", margin: 0}}
                  fill={false}
                  inline={true}
                  label="Offset X"
                  labelFor="text-input">
                  <Controller control={formControls.control} name="offset.0" render={({field}) => (
                      <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small"></NumericInput>)}>
                  </Controller>
              </FormGroup>
                    
              <FormGroup style={{padding: "4px 8px",  margin: 0}}
              fill={false}
              inline={true}
              label="Offset Y"
              labelFor="text-input">
              <Controller control={formControls.control} name="offset.1" render={({field}) => (
                  <NumericInput {...field}  min={-50} max={50} onValueChange={field.onChange} size="small"></NumericInput>)}>
              </Controller>
              </FormGroup>
          </ControlGroup>
        </Section>
      
      </ControlGroup>
  );
}
    
export default VisualForm