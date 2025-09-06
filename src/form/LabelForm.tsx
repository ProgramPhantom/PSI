import { Control, Controller, ControllerRenderProps, FieldPath, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Button, Card, CheckboxCard, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, SectionCard, Slider, Switch, SwitchCard, Text, Tooltip } from "@blueprintjs/core";
import { IVisual } from '../vanilla/visual';
import { ILabelGroup } from '../vanilla/labelGroup';
import { ILabel } from '../vanilla/label';
import VisualForm from './VisualForm';
import TextForm from './TextForm';
import { ChangeEventHandler, useEffect, useState } from 'react';
import ArrowForm from './ArrowForm';


function LabelForm() {
  const formControls = useFormContext<ILabel>();
  var formVals: ILabel = formControls.getValues()

  const [textOn, setTextOn] = useState<boolean>(formVals.text === undefined ? false : true)
  const [lineOn, setLineOn] = useState<boolean>(formVals.line === undefined ? false : true)

  // const hasText = useWatch({ name: "label", control: formControls.control})

  useEffect(() => {
    if (textOn === false) {
      formControls.setValue("text", undefined)
    }
    if (lineOn === false) {
      formControls.setValue("line", undefined)
    }
  })

  return (
    <>
      {/* Position */}
      <FormGroup style={{padding: "4px 8px", margin: 0}}
        fill={false}
        inline={true}
        label="Position"
        helperText="Label position on parent"
        labelFor="text-input">
        
        <Controller control={formControls.control} name={"labelConfig.labelPosition"} render={({field}) => (
            <HTMLSelect {...field} iconName='caret-down'>
                <option value={"top"}>Top</option>
                <option value={"bottom"}>Bottom</option>
                <option value={"left"}>Left</option>
                <option value={"right"}>Right</option>
            </HTMLSelect>
          )}>
        </Controller>
      </FormGroup>
      
      {/* Text position */}
      <FormGroup style={{padding: "4px 8px", margin: 0}}
        fill={false}
        inline={true}
        label="Text Position"
        labelFor="text-input" helperText="Text position relative to arrow">
        <Controller control={formControls.control} name="labelConfig.textPosition" render={({field}) => (
            <HTMLSelect {...field} iconName='caret-down' >
              <option value={"top"}>Top</option>
              <option value={"inline"}>Inline</option>
              <option value={"bottom"}>Bottom</option>
            </HTMLSelect>
          )}>
        </Controller>
      </FormGroup>

      {/* Text form */}
      <Section style={{padding: 0}} collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true}  title={
        <div style={{display: "flex", flexDirection: "row", alignSelf: "center"}}>
          <Switch style={{margin: "0px"}} type='checkbox' checked={textOn}
             size="medium" onChange={(e) => {setTextOn(e.target.checked)}}></Switch>
          <Text style={{fontWeight: 600, marginLeft: "4px"}}>Text</Text>
        </div>
      }>

        <SectionCard style={{padding: "0px"}}>
          <TextForm></TextForm>
        </SectionCard>
      </Section>

      {/* Arrow form */}
      <Section style={{padding: 0}} collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true} title={
        <div style={{display: "flex", flexDirection: "row", alignSelf: "center"}}>
          <Switch style={{margin: "0px"}} checked={lineOn}
               id="switch" size="medium" onChange={(e) => {setLineOn(e.target.checked)}}></Switch>
          <Text style={{fontWeight: 600, marginLeft: "4px"}}>Arrow</Text>
        </div>
      }>

        <SectionCard style={{padding: "0px"}}>
          <ArrowForm></ArrowForm>
        </SectionCard>
      </Section>
    </>
  );
}
    
export default LabelForm