import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import IForm, { FormDescriptor } from "./FormBase";
import { ElementTypes, IElement } from "../vanilla/point";
import { IVisual, Visual } from "../vanilla/visual";
import Channel, { IChannel } from "../vanilla/channel";
import { defaultChannel } from "../vanilla/default/data";
import ChannelForm from "./ChannelForm"
import ENGINE from "../vanilla/engine";
import { Switch, Tab, Tabs } from "@blueprintjs/core";
import LabelMapForm from "./LabelMapForm";
import { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useState } from "react";
import { ILabellable } from "../vanilla/labellable";
import { ElementBundle } from "../vanilla/sequenceHandler";


interface FormHolderProps {
    target?:  Visual,
    changeTarget: (val: Visual | undefined) => void
}

export interface FormRequirements {
    target?: Visual
}

interface FormActions {
    submit: (data: any) => void
    delete: (data: any) => void
}

type SubmissionType = (data: any, type: ElementTypes) => void
type DeleteType = (val: Visual) => void
type ModifyType = (data: any, type: ElementTypes, target: Visual) => Visual


function getCoreDefaults(target: Visual): IVisual {
    if (Visual.isLabellable(target)) {
        return target.parentElement.state
    } else {
        return target.state
    }
}

export function FormHolder(props: FormHolderProps) {
    var isLabellable: boolean;
    var elementType: ElementTypes;
    var coreDefaults: IVisual;
    var labelDefaults: ILabellable;
    var ElementForm: React.FC<FormRequirements> | undefined;

    // Target exists. Decide element type, form type and defaults
    if (props.target) {
        

        if (Visual.isLabellable(props.target)) {
            isLabellable = true;
            elementType =  (props.target.parentElement.constructor as typeof Visual).ElementType;
            ElementForm = (props.target?.parentElement.constructor as typeof Visual).form;
            coreDefaults = props.target.parentElement.state;
            labelDefaults = props.target.state;
        } else {
            isLabellable = false;
            elementType =  (props.target.constructor as typeof Visual).ElementType;
            ElementForm = (props.target.constructor as typeof Visual).form;
            coreDefaults = props.target.state;
        }
    } else {
        isLabellable = false;
        elementType = "channel";
        ElementForm = ChannelForm
        coreDefaults = Channel.defaults.default;
    }


    const [labelType, setLabelType] = useState<boolean>(false);
    useEffect(() => { setLabelType(isLabellable)}, [props.target])


    
    // Decide on submit and delete function
    var submitFunction: SubmissionType;
    var deleteFunction: DeleteType = () => {};
    var modifyFunction: ModifyType = ENGINE.handler.submitModifyElement.bind(ENGINE.handler);
    if (props.target === undefined) {
        submitFunction = ENGINE.handler.submitElement.bind(ENGINE.handler)
        // Have to "bind" the function to the object it's on for some reason....
    } else {
        submitFunction = ENGINE.handler.submitElement.bind(ENGINE.handler)
        deleteFunction = ENGINE.handler.submitDeleteElement.bind(ENGINE.handler)
    }

    // Resetter (I don't understand why I need this...)
    useEffect(() => {
        if (props.target === undefined) {
            coreDefaults = Channel.defaults.default;
        } else {
            labelFormControls.reset(labelDefaults)
        }
        
        coreFormControls.reset(coreDefaults);
        
    }, [props.target]); 
    

    // Create form hook
    const coreFormControls = useForm<IVisual>({
        defaultValues:  coreDefaults as DefaultValues<IVisual>
    });

    // This stops some weird default value caching, don't remove it or code breaks.

    // Create label hook form
    const labelFormControls = useForm<ILabellable>({
        defaultValues:  coreDefaults as DefaultValues<ILabellable>
    });


    // Submit function
    function onSubmit(data: IVisual) {
        var coreValues = coreFormControls.getValues();
        var labelValues = labelFormControls.getValues();
        var formData: ElementBundle = {...coreValues, 
                                       "labels": labelValues.labels}
        
        if (props.target === undefined) {
            submitFunction(data, elementType)
        } else {
            var newElement = modifyFunction(formData, elementType, props.target)
            props.changeTarget(newElement)
        }
    }


    return (
        <>
        <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <h3>{props.target ? props.target.refName : "New Channel"}</h3>

            {props.target !== undefined ? (
                <button style={{width: "30", height: "30", justifySelf: "end"}} 
                onClick={() => {deleteFunction(props.target!); props.changeTarget(undefined)}}>
                        Delete
                </button>
            ) : <></>}
        </div>
        
            <form onSubmit={coreFormControls.handleSubmit(onSubmit)}>

                <Tabs defaultSelectedTabId={"core"}>
                    
                        <Tab id={"core"} title={"Core"} panel={
                            <FormProvider {...coreFormControls}>
                                <ElementForm target={props.target}></ElementForm>
                            </FormProvider>
                        }></Tab>
                    

                    <Tab id={"label"} title={"Label"} panel={
                        <>
                        <Switch onChange={() => {setLabelType(!labelType)}} checked={labelType}></Switch>
                        { labelType ? 
                        <FormProvider {...labelFormControls}>
                            <LabelMapForm target={props.target}></LabelMapForm> 
                        </FormProvider>
                        : <></>}
                        </>
                    }></Tab>
                </Tabs>
                

                <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"} value={props.target !== undefined ? "Apply" : "Add"}></input>
            </form>
        </>
    );
}