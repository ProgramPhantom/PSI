import { ControlGroup, FormGroup, HTMLSelect, NumericInput, Section } from "@blueprintjs/core";
import { Controller, useFormContext } from 'react-hook-form';
import { ILine } from "../../logic/line";
import { getByPath } from "../../logic/util";
import { FormRequirements } from "./FormDiagramInterface";
import VisualForm from './VisualForm';


interface IArrowFormProps extends FormRequirements {

}

function ArrowForm(props: IArrowFormProps) {
  var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : ""
  const formControls = useFormContext();

  var rawVals = formControls.getValues();
  var values: Partial<ILine> | undefined = getByPath(formControls.getValues(), props.prefix);

  return (
    <>
      <ControlGroup vertical={true} style={{width: "100%"}}>
        {/* Arrowhead style */}
        <FormGroup style={{padding: "4px 8px", margin: 0}}
          fill={false}
          inline={true}
          label="Arrowhead style"
          labelFor="text-input">
          <Controller control={formControls.control} name={`${fullPrefix}arrowStyle.headStyle`} render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down' >
                <option value={"default"}>Default</option>
                <option value={"thin"}>Thin</option>
                <option value={"None"}>None</option>
              </HTMLSelect>
            )}>
          </Controller>
        </FormGroup>

        {/* Adjustment */}
        <FormGroup  style={{padding: "4px 8px", margin: 0}}
            inline={true}
            label="Adjustment"
            labelFor="text-input">

            <div style={{display: "flex", flexDirection: "row"}}>
              <Controller control={formControls.control} name={`${fullPrefix}adjustment.0`} render={({field}) => (
                <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
              </Controller>
              <Controller control={formControls.control} name={`${fullPrefix}adjustment.1`} render={({field}) => (
                <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
              </Controller>
            </div>
        </FormGroup>

        {/* Visual form */}
        <VisualForm widthDisplay={false} heightDisplay={false} prefix={props.prefix}></VisualForm>


        {/* Style */}
        <Section 
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Stroke thickness"
              labelFor="text-input">
              <Controller control={formControls.control} name={`${fullPrefix}style.thickness`} render={({field}) => (
                <NumericInput {...field} onValueChange={field.onChange} min={0} small={true}></NumericInput>)}>
              </Controller>
          </FormGroup>


          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Stroke"
              labelFor="text-input">

              <Controller control={formControls.control} name={`${fullPrefix}style.stroke`} render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>

          <FormGroup style={{padding: "4px 8px", margin: 0}}
              inline={true}
              label="Dashing"
              labelFor="text-input">

              <div style={{display: "flex", flexDirection: "row"}}>
                <Controller control={formControls.control} name={`${fullPrefix}style.dashing.0`} render={({field}) => (
                  <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
                </Controller>
                <Controller control={formControls.control} name={`${fullPrefix}style.dashing.1`} render={({field}) => (
                  <NumericInput {...field} min={-50} max={50} onValueChange={field.onChange} size="small" style={{width: "50%"}}></NumericInput>)}>
                </Controller>
              </div>
          </FormGroup>

        </Section>
        
        
      </ControlGroup>
    </>
  );
}
    
export default ArrowForm