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
    // if (toAddLabel === undefined) {
    //   return
    // }

    var newLabels: ILabel[] = [...structuredClone(labels)]; 
    newLabels.push(toAddLabel)

    var positions: {[key in Position]?: number}  = {}
    newLabels.forEach((l) => {
      if (positions[l.labelConfig.labelPosition] !== undefined) {
        positions[l.labelConfig.labelPosition]! += 1
      } else {
        positions[l.labelConfig.labelPosition] = 1
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

      <div style={{display: "flex", flexDirection: "row"}}>
        <Text style={{width: "40%"}}>Ref</Text>
        <Text style={{width: "40%"}}>Position</Text>
        <Text style={{width: "20%"}}>Delete</Text>
      </div>

      <Divider style={{margin: "0px 0px 4px 0px"}}></Divider>

      <CardList compact={true} style={{padding: "0px"}}>
        {labels.map((label, i) => (
          <Card key={i.toString()}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
              <Text style={{width: "40%"}} >{label.ref}</Text>
              
              <Text>{label.labelConfig.labelPosition}</Text>
              <Button style={{color: "red", justifySelf: "flex-end", marginLeft: "auto" }} value={i} key={i} name="delete"
                    onClick={() => {deleteLabel(i)}}>Delete</Button>
            </div>
          </Card>
        ))}
      </CardList>

      <Divider></Divider>

      <Card compact={true} style={{padding: "0px 8px 8px 8px"}}>
        <div style={{width: "100%", margin: "0px 4px", display: "flex", flexDirection: "row", alignItems: "center"}}>
          <Icon icon="build" style={{margin: "0px 9px 0px 0px"}} size={15}></Icon>
          <h5 style={{ textDecoration: "underline"}}>Create Label</h5>

          <Button style={{margin: "4px", height: "30px", marginLeft: "auto", justifySelf: "center"}} 
               value={"Add Label"} onClick={() => {addLabel()}} icon="add"></Button>
        </div>

          <FormProvider {...labelForm}> 
            <LabelForm></LabelForm>
          </FormProvider>
      </Card>
      
    </>
  );
}
    
export default LabelMapForm