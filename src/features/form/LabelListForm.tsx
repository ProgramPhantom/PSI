import { Button, Divider, Section, SectionCard } from "@blueprintjs/core";
import { useFieldArray, useFormContext } from 'react-hook-form';
import Label, { ILabel } from '../../logic/label';
import { FormRequirements } from "./FormDiagramInterface";
import LabelForm from './LabelForm';


export type LabelGroupLabels = {
  labels: ILabel[]
}

interface ILabelMapProps extends FormRequirements {
  
}


function LabelListForm(props: ILabelMapProps) {
  
  const parentFormControls = useFormContext<LabelGroupLabels>();


  const { fields, append, remove } = useFieldArray({
    control: parentFormControls.control,
    name: "labels",
    
  })

  return (
    <>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>

        <Divider style={{margin: "0px 0px 4px 0px"}}></Divider>

        { fields.length === 0 ? <><p>No labels</p></> : <></>}

        {fields.map((field, index) => (
          <>
            <Section collapsible={true} title={`Label ${index}`} compact={true} rightElement={
              <Button icon="trash" intent="danger" onClick={(e) => {e.stopPropagation(); remove(index)}}></Button>
            }>
              <SectionCard>
                <LabelForm prefix={`labels.${index}`} ></LabelForm>
              </SectionCard>
            </Section>
          </>
        ))}

        <Button style={{width: "80%", marginTop: "16px", alignSelf: "center"}}
          intent="success"
          icon="add"
          type="button"
          onClick={() => append(Label.formData.defaults)}
        >
          Add Label
        </Button>
      </div>
      
    </>
  );
}
    
export default LabelListForm