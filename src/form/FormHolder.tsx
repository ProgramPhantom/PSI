import { Controller, DefaultValues, FormProvider, useForm } from "react-hook-form";
import IForm, { FormDescriptor } from "./FormBase";
import { IElement } from "../vanilla/point";
import { IVisual, Visual } from "../vanilla/visual";
import Channel, { IChannel } from "../vanilla/channel";
import { defaultChannel } from "../vanilla/default/data";
import ChannelForm from "./ChannelForm"
import ENGINE from "../vanilla/engine";
import { Button, Card, Dialog, DialogBody, Divider, EditableText, EntityTitle, FormGroup, H5, Icon, InputGroup, Label, Section, SectionCard, Switch, Tab, Tabs, Text } from "@blueprintjs/core";
import LabelMapForm from "./LabelMapForm";
import { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useState } from "react";
import Labellable, { ILabellable } from "../vanilla/labellable";
import { AllComponentTypes, ElementBundle, UserComponentType } from "../vanilla/diagramHandler";
import { myToaster } from "../App";
import { inspect } from "util"
import ReactJson from "react18-json-view"
import { Inspector, ObjectInspector } from "react-inspector"
import { AllStructures } from "../vanilla/diagram";


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

type SubmissionType = (data: any, type: AllComponentTypes) => void
type DeleteType = (val: Visual, type: AllComponentTypes) => void
type ModifyType = (data: any, type: AllComponentTypes, target: Visual) => Visual


function getCoreDefaults(target: Visual): IVisual {
    if (Visual.isLabellable(target)) {
        return target.coreChild.state
    } else {
        return target.state
    }
}

export function FormHolder(props: FormHolderProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    var isLabellable: boolean;
    var elementType: AllComponentTypes;
    var coreDefaults: IVisual;
    var labelDefaults: ILabellable = Labellable.defaults["default"];
    var ElementForm: React.FC<FormRequirements> | undefined;

    // Target exists. Decide element type, form type and defaults
    if (props.target) {
        if (Visual.isLabellable(props.target)) {
            isLabellable = true;
            elementType =  (props.target.coreChild.constructor as typeof Visual).ElementType;
            ElementForm = (props.target?.coreChild.constructor as typeof Visual).form;
            coreDefaults = props.target.coreChild.state;
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
        defaultValues:  coreDefaults as DefaultValues<IVisual>,
        mode: "onChange"
    });

    // This stops some weird default value caching, don't remove it or code breaks.

    // Create label hook form
    const labelFormControls = useForm<ILabellable>({
        defaultValues: labelDefaults as DefaultValues<ILabellable>,
        mode: "onChange"
    });


    // Submit function
    function onSubmit(data: IVisual) {
        var coreValues = coreFormControls.getValues();
        var labelValues = labelFormControls.getValues();
        var formData: ElementBundle = {...coreValues, 
                                       "labels": labelValues.labels}
        
        if (props.target === undefined) {
            submitFunction(formData, elementType)
        } else {
            // if (formData.mountConfig) {  // TODO: Add a field so this gets done automatically  
            //     formData.mountConfig.index = props.target!.mountConfig!.index;
            // }
            
            var newElement = modifyFunction(formData, elementType, props.target);
            props.changeTarget(newElement);
        }
    }


    var vals = coreFormControls.getValues(); 
    return (
        <>
        <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <div style={{width: "100%"}}>
                
                <div style={{width: "100%", padding: "16px 8px 16px 8px", display: "flex", flexDirection: "row", alignItems: "center"}}>
                    { props.target === undefined ? (<>
                        <EntityTitle title={"Create Channel"}
                        icon={<Icon icon="cube-add" onClick={() => {setIsDialogOpen(true)}} style={{cursor: "help"}}></Icon>} heading={H5} ></EntityTitle></>
                    ) : (<>
                        <EntityTitle title={`Modify '${props.target.ref}'`}
                        icon={<Icon icon="add-child" onClick={() => {setIsDialogOpen(true)}} style={{cursor: "help"}}></Icon>} heading={H5}></EntityTitle>
                    </>)}

                    {props.target !== undefined ? (
                    <Button style={{height: "30px", alignSelf: "center", marginLeft: "auto"}} icon="trash" intent="danger"
                        onClick={() => {deleteFunction(props.target!, elementType); props.changeTarget(undefined); 
                        myToaster.show({message: `Deleted element '${props.target?.ref}'`, intent: "danger", timeout: 1000})}}>
                    </Button>
                    ) : <></>}
                </div>

                <Divider style={{margin: "0 0 16px 0"}}></Divider>

                <Divider></Divider>

                
            </div>
        </div>
        
        <form onSubmit={coreFormControls.handleSubmit(onSubmit)}
                style={{height: "100%", display: "flex", flexDirection: "column", overflow: "hidden",
                        padding: "0px"
                }}>
            
            <div style={{overflowY: "scroll", flex: "1 1 0",  padding: "4px"}} id="form-fields">
                <Tabs defaultSelectedTabId={"core"}>
                    <Tab style={{userSelect: "none", position: "sticky"}} id={"core"} title={"Core"} panel={
                            <FormProvider {...coreFormControls}>
                                <ElementForm target={props.target}></ElementForm>
                            </FormProvider>
                    }></Tab>
                

                <Tab style={{userSelect: "none"}} id={"label"} title={"Label"} panel={
                    <>
                        <p style={{display: "inline-block"}}>Use Labels</p>
                        <Switch onChange={() => {setLabelType(!labelType)}} checked={labelType} 
                                style={{display: "inline-block", marginLeft: "10px"}}></Switch>
                        
                        { labelType ? 
                        <FormProvider {...labelFormControls}>
                            <LabelMapForm target={props.target}></LabelMapForm> 
                        </FormProvider>
                        : <></>}
                    </>
                }></Tab>
                </Tabs>
            </div>
            
            <div id="submit-area" style={{width: "100%", alignSelf: "center", margin: "4px 2px 18px 2px", height: "30px", marginTop: "auto", display: "flex", flexDirection: "column"}} >
                <Divider></Divider>
                <Button style={{width: "80%", margin: "auto", alignSelf: "center", }}
                    type={"submit"} text={props.target !== undefined ? "Apply" : "Add"} icon={props.target !== undefined ? "tick" : "add"}></Button>
            </div>

        </form>


        <Dialog style={{width: "800px", height: "500px"}}
            isOpen={isDialogOpen}
            onClose={() => {setIsDialogOpen(false)}}
            title="Element details"
            canOutsideClickClose={true}
            canEscapeKeyClose={true} icon="wrench"
        >
            <DialogBody style={{overflowY: "scroll"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <EntityTitle title={"State"} icon="wrench-time"></EntityTitle>

                    <ObjectInspector data={props.target}></ObjectInspector>

                    <Divider style={{ marginBottom: "8px"}}></Divider>
                    <EntityTitle title={"Bindings"} icon="bring-data"></EntityTitle>
                    
                    <ObjectInspector data={props.target?.bindings.map((b) => b)}></ObjectInspector>

                    <Divider style={{ marginBottom: "8px"}}></Divider>
                    <EntityTitle title={"Binds to this"} icon="bring-forward"></EntityTitle>
                    
                    <ObjectInspector data={props.target?.bindingsToThis.map((b) => b)}></ObjectInspector>

                    <Divider style={{ marginBottom: "8px"}}></Divider>
                    <EntityTitle title={"All elements"} icon="zoom-in"></EntityTitle>
                    
                    <ObjectInspector data={ENGINE.handler.allElements}></ObjectInspector>
                </div>
            </DialogBody>
        </Dialog>
        </>
    );
}