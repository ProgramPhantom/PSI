import { Control, Controller, ControllerRenderProps, FieldPath, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Button, Card, CheckboxCard, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, SectionCard, Slider, Switch, SwitchCard, Text, Tooltip } from "@blueprintjs/core";
import { IVisual } from '../vanilla/visual';
import { ILabellable } from '../vanilla/labellable';
import { ILabel } from '../vanilla/label';
import VisualForm from './VisualForm';
import TextForm from './TextForm';
import { ChangeEventHandler, useState } from 'react';
import ArrowForm from './ArrowForm';


function LabelForm() {
  const formControls = useFormContext<ILabel>();
  var formVals: ILabel = formControls.getValues()

  const [textOn, setTextOn] = useState<boolean>(formVals.text === undefined ? false : true)
  const [lineOn, setLineOn] = useState<boolean>(formVals.line === undefined ? false : true)



  return (
    <>
      {/* Position */}
      <FormGroup
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
      <FormGroup
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
      <Section collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true}  title={
        <div style={{display: "flex", flexDirection: "row", alignSelf: "center"}}>
          <Switch style={{margin: "0px"}} type='checkbox' checked={textOn}
             size="medium" onChange={(e) => {setTextOn(e.target.checked)}}></Switch>
          <Text style={{fontWeight: 600, marginLeft: "4px"}}>Text</Text>
        </div>
      }>

        <SectionCard style={{padding: "8px"}}>
          <TextForm></TextForm>
        </SectionCard>
      </Section>

      {/* Arrow form */}
      <Section collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true} title={
        <div style={{display: "flex", flexDirection: "row", alignSelf: "center"}}>
          <Switch style={{margin: "0px"}} 
               id="switch" size="medium" onClick={(e) => {}}></Switch>
          <Text style={{fontWeight: 600, marginLeft: "4px"}}>Arrow</Text>
        </div>
      }>

        <SectionCard style={{padding: "4px"}}>
          <ArrowForm></ArrowForm>
        </SectionCard>
      </Section>
    </>
  );
}
    
export default LabelForm