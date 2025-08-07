import { Control, Controller, FieldValue, FieldValues, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Button, Card, CardList, ControlGroup, Divider, FormGroup, HTMLSelect, InputGroup, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { IVisual, Visual } from '../vanilla/visual';
import { ILabellable } from '../vanilla/labellable';
import LabelForm from './LabelForm';
import Label, { ILabel } from '../vanilla/label';
import { useEffect, useState } from 'react';


interface ILabelMapProps {
  target?: Visual 
}


function LabelMapForm(props: ILabelMapProps) {

  const parentFormControls = useFormContext<ILabellable>();
  const [labels, setLabels] = useState<ILabel[]>(parentFormControls.getValues("labels") ?? [])

  const labelForm = useForm<ILabel>({
    defaultValues: Label.defaults["default"]
  })

  function addLabel() {
    var toAddLabel: ILabel = structuredClone(labelForm.getValues());
    var newLabels: ILabel[] = [...structuredClone(labels)]; 
    newLabels.push(toAddLabel)

    setLabels([...newLabels])
    parentFormControls.setValue("labels", newLabels)
  }

  function deleteLabel(index: number) {
    var labelsCopy = structuredClone(labels)
    labelsCopy.splice(index, 1)

    setLabels(labelsCopy)
    parentFormControls.setValue("labels", labelsCopy)
  }

  return (
    <>
      {/* Top */}
      <FormGroup 
          fill={false}
          inline={true}
          label="Top"
          labelFor="text-input">
        </FormGroup>

      <CardList compact={true}>
        {labels.map((label, i) => (
          <Card key={i.toString()}>
            <span style={{width: "100%"}} >{label.text.text}</span>
            <Button style={{color: "red"}} value={i} key={i} name="delete"
                    onClick={() => {deleteLabel(i)}}>Delete</Button>
          </Card>
        ))}
      </CardList>

      <Divider></Divider>

      <div>
        <h4>Add Label</h4>
          <FormProvider {...labelForm}> 
            <LabelForm></LabelForm>
          </FormProvider>

        <Button style={{margin: "4px 20px 18px 20px", height: "30px"}} 
               value={"Add Label"} onClick={() => {addLabel()}}>+ Add label</Button>
      </div>
      
    </>
  );
}
    
export default LabelMapForm