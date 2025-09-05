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
            labelFor="ref-input"
            intent={formControls.formState.errors.ref ? "danger" : "none"}
            helperText={formControls.formState.errors.ref?.message}>
            <Controller control={formControls.control} name="ref" render={({field}) => (
                <InputGroup defaultValue='reference' id="ref-input" {...field}  size="small" intent={formControls.formState.errors.ref ? "danger" : "none"}/>
                )} 
                rules={{
                  required: "Reference is required", // message shown if empty
                  validate: value => value.trim() !== "" || "Reference cannot be empty", // extra safeguard against only-spaces
                }}>
            </Controller>
        </FormGroup>


        { /* Width and height */ }
        {/* Content Width */}
        { vals.contentWidth !== undefined && props.widthDisplay ? <>
          <FormGroup
              intent={formControls.formState.errors.contentWidth ? "danger" : "none"}
              helperText={formControls.formState.errors.contentWidth?.message}
              inline={true}
              label="Width"
              labelFor="width-input">
                  <Controller control={formControls.control} name="contentWidth" render={({field}) => (
                      <NumericInput defaultValue={50} {...field} id="width-input" onValueChange={field.onChange} min={1} max={400} size="small"
                      disabled={!widthActive} title={!widthActive ? "Width inherited" : ""}
                      intent={formControls.formState.errors.contentWidth ? "danger" : "none"}
                      allowNumericCharactersOnly={true}></NumericInput>)}
                      rules={{
                        required: "Width is required",
                        min: { value: 1, message: "Width must be at least 1" },
                        max: { value: 400, message: "Width cannot exceed 400" },
                      }}
                      >
                  </Controller>
          </FormGroup>
        </> : <></>}
        
        {/* Content Height */}
        { vals.contentHeight !== undefined && props.heightDisplay ? <> 
        <FormGroup
            intent={formControls.formState.errors.contentHeight ? "danger" : "none"}
            helperText={formControls.formState.errors.contentHeight?.message}
            inline={true}
            label="Height"
            labelFor="height-input">
            <Controller control={formControls.control} name="contentHeight" render={({field}) => (
              <NumericInput defaultValue={50} {...field} id="height-input" onValueChange={field.onChange} min={1} max={400} size="small"
              disabled={!widthActive} title={!heightActive ? "Height inherited" : ""}
              intent={formControls.formState.errors.contentHeight ? "danger" : "none"}
              allowNumericCharactersOnly={true}></NumericInput>)}
              rules={{
                required: "Height is required",
                min: { value: 1, message: "Height must be at least 1" },
                max: { value: 400, message: "Height cannot exceed 400" },
              }}
              >
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
                inline={true}
                label="Orientation"
                labelFor="text-input">
                  <Controller control={formControls.control} name="mountConfig.orientation" render={({field}) => (
                      <HTMLSelect defaultValue={"top"} {...field} iconName='caret-down'>
                          <option value={"top"}>Top</option>
                          <option value={"both"}>Both</option>
                          <option value={"bottom"}>Bottom</option>
                      </HTMLSelect>
                      )}>
                  </Controller>
              </FormGroup>
              
              {/* Alignment */}
              <FormGroup style={{padding: "4px 8px"}}
                inline={true}
                label="Alignment"
                labelFor="text-input">
                <Controller control={formControls.control} name="mountConfig.alignment" render={({field}) => (
                    <HTMLSelect defaultValue={"centre"} {...field} iconName='caret-down'>
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
                intent={formControls.formState.errors.mountConfig?.noSections ? "danger" : "none"}
                helperText={formControls.formState.errors.mountConfig?.noSections?.message}
                inline={true}
                label="No. Sections"
                labelFor="sections-input">
                <Controller control={formControls.control} name="mountConfig.noSections" render={({field}) => (
                  <NumericInput defaultValue={1} {...field} id="sections-input" onValueChange={field.onChange} min={1} max={5} size="small"
                    intent={formControls.formState.errors.mountConfig?.noSections ? "danger" : "none"}
                    allowNumericCharactersOnly={true}></NumericInput>)}
                    rules={{
                      required: "No. sections is required",
                      min: { value: 1, message: "No. Sections must be at least 1" },
                      max: { value: 5, message: "No. Sections cannot exceed 5" },
                    }}
                    >
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
              label="Padding top"
              labelFor="text-input">
              <Controller defaultValue={0} control={formControls.control} name="padding.0" render={({field}) => (
                  <Slider {...field} min={0} max={30} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px"}}
              label="Padding right"
              labelFor="text-input">
              <Controller defaultValue={0} control={formControls.control} name="padding.1" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px"}}
              label="Padding bottom"
              labelFor="text-input">
              <Controller defaultValue={0} control={formControls.control} name="padding.2" render={({field}) => (
                <Slider {...field} max={30} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 16px", margin: 0}}
              label="Padding left"
              labelFor="slider3">
              <Controller defaultValue={0} control={formControls.control} name="padding.3" render={({field}) => (
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
              <FormGroup style={{padding: "4px 8px", margin: 0}}
                intent={formControls.formState.errors.offset?.[0] ? "danger" : "none"}
                helperText={formControls.formState.errors.offset?.[0]?.message}
                inline={true}
                label="Offset X"
                labelFor="offset0">
                <Controller control={formControls.control} name="offset.0" render={({field}) => (
                  <NumericInput defaultValue={0} {...field} id="offset0" onBlur={field.onChange} onValueChange={field.onChange}  min={-2000} max={2000} size="small"
                    intent={formControls.formState.errors.offset?.[1] ? "danger" : "none"}
                    allowNumericCharactersOnly={true}></NumericInput>)}
                  rules={{
                    required: "Offset is required",
                    min: { value: -2000, message: "Offset must be greater than -2000" },
                    max: { value: 2000, message: "Offset cannot exceed 2000" },
                  }}
                  >
                </Controller>
              </FormGroup>
                    
              <FormGroup style={{padding: "4px 8px",  margin: 0}}
                intent={formControls.formState.errors.offset?.[1] ? "danger" : "none"}
                helperText={formControls.formState.errors.offset?.[1]?.message}
                inline={true}
                label="Offset Y"
                labelFor="offset1">
              <Controller defaultValue={0} control={formControls.control} name="offset.1" render={({field}) => (
                  <NumericInput defaultValue={0} {...field} id="offset1" onBlur={field.onChange} onValueChange={field.onChange}  min={-2000} max={2000} size="small"
                    intent={formControls.formState.errors.offset?.[1] ? "danger" : "none"}
                    allowNumericCharactersOnly={true}></NumericInput>)}
                  rules={{
                      required: "Offset is required",
                      min: { value: -2000, message: "Offset must be greater than -2000" },
                      max: { value: 2000, message: "Offset cannot exceed 2000" },
                    }}
                  >
              </Controller>
              </FormGroup>
          </ControlGroup>
        </Section>
      
      </ControlGroup>
  );
}
    
export default VisualForm