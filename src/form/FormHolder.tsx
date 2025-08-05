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


interface FormHolder {
    target?:  Visual,
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
type ModifyType = (data: any, type: ElementTypes, target: Visual) => void


export function FormHolder(props: FormHolder) {
    var elementType: ElementTypes = props.target === undefined ? "channel" : (props.target.constructor as typeof Visual).ElementType;
    const [labelType, setLabelType] = useState<boolean>((elementType === "labelled" ? true : false))


    var defaults: IVisual;
    // Decide on form and defaults
    var ElementForm: React.FC<FormRequirements> | undefined = (props.target?.constructor as typeof Visual)?.form;
    if (ElementForm === undefined) {
        ElementForm = ChannelForm
        defaults = Channel.defaults.default;
    } else {
        defaults = props.target?.state!;
    }
    
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

    
    // Create form hook

    const formControls = useForm<IVisual>({
        defaultValues:  defaults as DefaultValues<IVisual>
    });
    useEffect(() => {
        if (props.target === undefined) {
            defaults = Channel.defaults.default;
        } else {
            defaults = props.target?.state!;
        }

        formControls.reset(defaults);
    }, [props.target]); 
    // This stops some weird default value caching, don't remove it or code breaks.
    

    // Submit function
    function onSubmit(data: IVisual) {
        if (props.target === undefined) {
            submitFunction(data, elementType)
        } else {
            modifyFunction(data, elementType, props.target)
        }
    }

    console.log(formControls.control._defaultValues)
    console.log(defaults)

    return (
        <>
        <FormProvider {...formControls}>
            <form onSubmit={formControls.handleSubmit(onSubmit)}>
                <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                    <h3>{props.target ? props.target.refName : "New Channel"}</h3>

                    {props.target !== undefined ? (
                        <button style={{width: "30", height: "30", justifySelf: "end"}} onClick={() => {deleteFunction(props.target!)}}>
                                Delete
                        </button>
                    ) : <></>}
                </div>
                <Tabs defaultSelectedTabId={"core"}>
                    <Tab id={"core"} title={"Core"} panel={
                        <ElementForm target={props.target}></ElementForm>
                    }></Tab>

                    <Tab id={"label"} title={"Label"} panel={
                        <>
                        <Switch onChange={() => {setLabelType(!labelType)}}></Switch>
                        { labelType ? <LabelMapForm></LabelMapForm> : <></>}
                        </>
                    }></Tab>
                </Tabs>
                

                <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"} value={props.target !== undefined ? "Modify" : "Add"}></input>
            </form>
        </FormProvider>

        </>
    );
}