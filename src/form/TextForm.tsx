import { ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, Slider } from "@blueprintjs/core";
import { Controller, useFormContext } from "react-hook-form";
import VisualForm from "./VisualForm";
import { ILabel } from "../vanilla/label";


function TextForm() {
    const formControls = useFormContext<ILabel>();

    var vals = formControls.getValues()
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
              
              <Controller control={formControls.control} name={"text.text"} render={({field}) => (
                <InputGroup {...field} id="text" placeholder="90o" size="small" />
                )}>
              </Controller>
              
            </FormGroup>


            {/* Visual form */}
            <VisualForm widthDisplay={false} heightDisplay={false}></VisualForm>

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
                  <Controller control={formControls.control} name="text.style.fontSize" render={({field}) => (
                    <Slider {...field} max={60} min={0} labelStepSize={10}></Slider>)}>
                  </Controller>
              </FormGroup>

              <FormGroup style={{padding: "4px 8px", margin: 0}}
                  inline={true}
                  label="Colour"
                  labelFor="text-input">
                  <Controller control={formControls.control} name="text.style.colour" render={({field}) => (
                    <input type={"color"} {...field}></input>)}>
                  </Controller>
              </FormGroup>

              <FormGroup style={{padding: "4px 8px", margin: 0}}
                  inline={true}
                  label="Background"
                  labelFor="text-input">

                  <Controller control={formControls.control} name="text.style.background" render={({ field: { onChange, onBlur, value, ref } }) => (
                    
                    <input type={"color"} value={value} ></input>
                    
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