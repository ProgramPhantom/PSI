import { Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon, Switch, Tab, Tabs } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import { ObjectInspector } from "react-inspector";
import { myToaster } from "../App";
import Channel from "../vanilla/channel";
import { AllComponentTypes, ElementBundle } from "../vanilla/diagramHandler";
import ENGINE from "../vanilla/engine";
import LabelGroup, { ILabelGroup } from "../vanilla/labelGroup";
import { IVisual, Visual } from "../vanilla/visual";
import ChannelForm from "./ChannelForm";
import LabelListForm from "./LabelListForm";


interface FormHolderProps {
    target?:  Visual,
    changeTarget: (val: Visual | undefined) => void
}

export interface FormRequirements {
    target?: Visual,
    prefix?: string
}

interface FormActions {
    submit: (data: any) => void
    delete: (data: any) => void
}

type SubmissionType = (data: any, type: AllComponentTypes) => void
type DeleteType = (val: Visual, type: AllComponentTypes) => void
type ModifyType = (data: any, type: AllComponentTypes, target: Visual) => Visual


function getCoreDefaults(target: Visual): IVisual {
    if (Visual.isLabelGroup(target)) {
        return target.coreChild.state
    } else {
        return target.state
    }
}

export function FormHolder(props: FormHolderProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    var isLabelGroup: boolean;
    var elementType: AllComponentTypes;
    var coreDefaults: IVisual;
    var labelDefaults: ILabelGroup = LabelGroup.defaults["default"];
    var ElementForm: React.FC<FormRequirements> | undefined;

    // Target exists. Decide element type, form type and defaults
    if (props.target) {
        if (Visual.isLabelGroup(props.target)) {
            isLabelGroup = true;
            elementType =  (props.target.coreChild.constructor as typeof Visual).ElementType;
            ElementForm = (props.target?.coreChild.constructor as typeof Visual).formDataPair.form;
            coreDefaults = props.target.coreChild.state;
            labelDefaults = props.target.state;
        } else {
            isLabelGroup = false;
            elementType =  (props.target.constructor as typeof Visual).ElementType;
            ElementForm = (props.target.constructor as typeof Visual).formDataPair.form;
            coreDefaults = props.target.state;
        }
    } else {
        isLabelGroup = false;
        elementType = "channel";
        ElementForm = ChannelForm
        coreDefaults = Channel.defaults.default;
    }


    const [labelType, setLabelType] = useState<boolean>(false);
    useEffect(() => { setLabelType(isLabelGroup)}, [props.target])


    
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
    const labelFormControls = useForm<ILabelGroup>({
        defaultValues: labelDefaults as DefaultValues<ILabelGroup>,
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
                        <FormProvider {...labelFormControls}>
                            <LabelListForm target={props.target}></LabelListForm> 
                        </FormProvider>
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