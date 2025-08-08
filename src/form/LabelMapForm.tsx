import { Control, Controller, FieldValue, FieldValues, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Alert, Button, Card, CardList, ControlGroup, Divider, FormGroup, HTMLSelect, Icon, InputGroup, Section, Slider, Switch, Tooltip, Text } from "@blueprintjs/core";
import { IVisual, Visual } from '../vanilla/visual';
import { ILabellable } from '../vanilla/labellable';
import LabelForm from './LabelForm';
import Label, { ILabel } from '../vanilla/label';
import { useEffect, useState } from 'react';
import { Position } from '../vanilla/text';
import { myToaster } from '../App';


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

    var positions: {[key in Position]?: number}  = {}
    newLabels.forEach((l) => {
      if (positions[l.position] !== undefined) {
        positions[l.position]! += 1
      } else {
        positions[l.position] = 1
      }
    })
    if (Object.values(positions).some(n => n > 1)) {
      myToaster.show({message: "Cannot put two labels in the same place", intent: "danger"},)
      return
    }

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
          labelFor="text-input">
        </FormGroup>

      <CardList compact={true}>
        {labels.map((label, i) => (
          <Card key={i.toString()}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
              <Text style={{width: "40%"}} >{label.text.text}</Text>
              
              <Text>{label.position}</Text>
              <Button style={{color: "red", justifySelf: "flex-end", marginLeft: "auto" }} value={i} key={i} name="delete"
                    onClick={() => {deleteLabel(i)}}>Delete</Button>
            </div>
          </Card>
        ))}
      </CardList>

      <Divider></Divider>

      <div>
        <div style={{width: "100%", margin: "10px 0px", display: "flex", flexDirection: "row", alignItems: "center"}}>
          <Icon icon="build" style={{margin: "0px 9px 0px 0px"}} size={15}></Icon>
          <h5 style={{ textDecoration: "underline"}}>Create Label</h5>

          <Button style={{margin: "4px", height: "30px", marginLeft: "auto", justifySelf: "center"}} 
               value={"Add Label"} onClick={() => {addLabel()}} icon="add"> Add label</Button>
        </div>

          <FormProvider {...labelForm}> 
            <LabelForm></LabelForm>
          </FormProvider>
      </div>
      
    </>
  );
}
    
export default LabelMapForm