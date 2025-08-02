import { Controller, useForm } from "react-hook-form";
import Labellable, { ILabellable } from "../vanilla/labellable";
import SequenceHandler from "../vanilla/sequenceHandler";
import { Visual } from "../vanilla/visual";
import { FormGroup, HTMLSelect, Tab, Tabs } from "@blueprintjs/core";


interface ILabellableForm<T extends Visual = Visual> {
    handler: SequenceHandler, 
    values: ILabellable,
    target?:  Labellable<T>, 
    reselect: (element: Visual | undefined) => void
}


const LabellableForm: React.FC<ILabellableForm> = (props) => {
  return (
    <>


    <form onSubmit={() => {}}>
      <Tabs defaultSelectedTabId={"core"} animate={false}>
            <Tab id="core" title="Element" panel={
                <>
                <VisualForm control={control} change={() => {}}></VisualForm>
                </>
            } />

            {/* 
            <Tab id="label" title="Label" panel={<LabelForm control={control} change={() => {}}></LabelForm>}/>
            <Tab id="arrow" title="Arrow" panel={<ArrowForm control={control} change={() => {}}></ArrowForm>} />*/}
      </Tabs>

    </form>
    </>
  );
}
    
export default LabellableForm