import { Control, Controller, ControllerRenderProps, FieldPath, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { IVisual } from '../vanilla/visual';
import { ILabellable } from '../vanilla/labellable';
import { ILabel } from '../vanilla/label';
import VisualForm from './VisualForm';


function LabelForm() {
  const formControls = useFormContext<ILabel>();
  
  return (
    <>
      <ControlGroup vertical={true}>
        {/* Text */}
        <FormGroup
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

        {/* Position */}
        <FormGroup
          fill={false}
          inline={true}
          label="Position"
          helperText="Label position on parent"
          labelFor="text-input">
          
          <Controller control={formControls.control} name={"position"} render={({field}) => (
              <HTMLSelect {...field} iconName='caret-down'>
                  <option value={"top"}>Top</option>
                  <option value={"bottom"}>Bottom</option>
                  <option value={"left"}>Left</option>
                  <option value={"right"}>Right</option>
              </HTMLSelect>
            )}>
          </Controller>
        </FormGroup>
          
        {/* Visual form */}
        <VisualForm></VisualForm>

        {/* Style */}
        <Section
          collapseProps={{defaultIsOpen: false}}
          compact={true}
          title={"Style"}
          collapsible={true}>
          <FormGroup
              inline={true}
              label="Font Size"
              labelFor="text-input">
              <Controller control={formControls.control} name="text.style.fontSize" render={({field}) => (
                <Slider {...field} max={60} min={0} labelStepSize={10}></Slider>)}>
              </Controller>
          </FormGroup>

          <FormGroup
              inline={true}
              label="Colour"
              labelFor="text-input">
              <Controller control={formControls.control} name="text.style.colour" render={({field}) => (
                <input type={"color"} {...field}></input>)}>
              </Controller>
          </FormGroup>

          <FormGroup
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
    </>
  );
}
    
export default LabelForm