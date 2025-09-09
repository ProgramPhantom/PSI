import { Button, FormGroup, HTMLSelect, Section, SectionCard } from "@blueprintjs/core";
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import ArrowForm from './ArrowForm';
import TextForm from './TextForm';
import { FormRequirements } from "./FormDiagramInterface";



interface ILabelArrayFormProps extends FormRequirements {

}

function LabelForm(props: ILabelArrayFormProps) {
  var fullPrefix = props.prefix !== undefined ? `${props.prefix}.` : ""
  const formControls = useFormContext();

  var defVals = formControls.getValues();
  const [textOn, setTextOn] = useState<boolean>(true);
  const [lineOn, setLineOn] = useState<boolean>(true);

  // const hasText = useWatch({ name: "label", control: formControls.control})

  useEffect(() => {
    if (textOn === false) {
      formControls.setValue("text", undefined)
    }
    if (lineOn === false) {
      formControls.setValue("line", undefined)
    }
  }, [textOn, lineOn])

  return (
    <>
      {/* Position */}
      <FormGroup style={{padding: "4px 8px", margin: 0}}
        fill={false}
        inline={true}
        label="Position"
        helperText="Label position on parent"
        labelFor="text-input">
        
        <Controller control={formControls.control} name={`${fullPrefix}labelConfig.labelPosition`} render={({field}) => (
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
        <Controller control={formControls.control} name={`${fullPrefix}labelConfig.textPosition`} render={({field}) => (
            <HTMLSelect {...field} iconName='caret-down' >
              <option value={"top"}>Top</option>
              <option value={"inline"}>Inline</option>
              <option value={"bottom"}>Bottom</option>
            </HTMLSelect>
          )}>
        </Controller>
      </FormGroup>

      {/* Text form */}
      <Section style={{padding: 0}} collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true} title={"Text"} rightElement={
            <Button icon={textOn ? "eye-open" : "eye-off"} intent="none" 
              onClick={(e) => {e.stopPropagation(); setTextOn(!textOn)}}></Button>
          }>

        <SectionCard style={{padding: "0px"}}>
          <TextForm prefix={fullPrefix + 'text'}></TextForm>
        </SectionCard>
      </Section>

      {/* Arrow form */}
      <Section style={{padding: 0}} collapseProps={{defaultIsOpen: false}} compact={true} collapsible={true} title={"Arrow"} rightElement={
            <Button icon={lineOn ? "eye-open" : "eye-off"} intent="none" 
              onClick={(e) => {e.stopPropagation(); setLineOn(!lineOn)}}></Button>
          }
      >

        <SectionCard style={{padding: "0px"}}>
          <ArrowForm prefix={fullPrefix + 'line'}></ArrowForm>
        </SectionCard>
      </Section>
    </>
  );
}
    
export default LabelForm