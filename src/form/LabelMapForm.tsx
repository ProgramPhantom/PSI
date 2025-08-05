import { Control, Controller, FieldValue, FieldValues, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Button, ControlGroup, FormGroup, HTMLSelect, InputGroup, Section, Slider, Switch, Tooltip } from "@blueprintjs/core";
import { IVisual } from '../vanilla/visual';
import { ILabellable } from '../vanilla/labellable';
import LabelForm from './LabelForm';


function LabelMapForm() {
  const formControls = useFormContext<ILabellable>();

  
  return (
    <>
      {/* Top */}
      <FormGroup 
          fill={false}
          inline={true}
          label="Position"
          labelFor="text-input">
          
          <Controller control={formControls.control} name="labelMap.top" render={({field}) => (
              <LabelForm></LabelForm>
            )}>
          </Controller>
        </FormGroup>


    </>
  );
}
    
export default LabelMapForm