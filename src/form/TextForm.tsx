import { ControlGroup, FormGroup, InputGroup, Section, Slider } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import { FormRequirements } from "./FormHolder";
import VisualForm from "./VisualForm";


interface ITextFormProps extends FormRequirements {

}

function TextForm(props: ITextFormProps) {
  var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : "";

  const formControls = useFormContext();

  return (
      <>
      <div style={{width: "100%"}}>
          <ControlGroup vertical={true}>
          {/* Text */}
          <FormGroup style={{padding: "4px 8px", margin: 0}}
            fill={false}
            inline={true}
            label="Text"
            helperText="LaTeX input"
            labelFor="text-input">
            
            <Controller control={formControls.control} name={`${fullPrefix}text`} render={({field}) => (
              <InputGroup {...field} id="text" placeholder="90o" size="small" />
              )}>
            </Controller>
            
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
                label="Font Size"
                labelFor="text-input">
                <Controller control={formControls.control} name={`${fullPrefix}.style.fontSize`} render={({field}) => (
                  <Slider {...field} max={60} min={0} labelStepSize={10}></Slider>)}>
                </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 8px", margin: 0}}
                inline={true}
                label="Colour"
                labelFor="text-input">
                <Controller control={formControls.control} name={`${fullPrefix}.style.colour`} render={({field}) => (
                  <input type={"color"} {...field}></input>)}>
                </Controller>
            </FormGroup>

            <FormGroup style={{padding: "4px 8px", margin: 0}}
                inline={true}
                label="Background"
                labelFor="text-input">

                <Controller control={formControls.control} name={`${fullPrefix}.style.background`} render={({ field: { onChange, onBlur, value, ref } }) => (
                  
                  <input type={"color"}  ></input>
                  
                  )}>
                </Controller>
            </FormGroup>
          </Section>

        </ControlGroup>
        </div>
      </>
  )
}

export default TextForm