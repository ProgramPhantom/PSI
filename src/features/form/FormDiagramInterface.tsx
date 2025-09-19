import { Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon } from "@blueprintjs/core";
import { useMemo, useRef, useState } from "react";
import { ObjectInspector } from "react-inspector";
import { myToaster } from "../../app/App";
import { AllComponentTypes, UserComponentType } from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { IVisual, Visual } from "../../logic/visual";
import { LabelGroupComboForm, SubmitButtonRef } from "./LabelGroupComboForm";

interface FormHolderProps {
    target?:  Visual,
    changeTarget: (val: Visual | undefined) => void
}

export interface FormRequirements {
    target?: Visual,
    prefix?: string
}

interface FormHolderProps {
    target?:  Visual,
    targetType: AllComponentTypes,
    changeTarget: (val: Visual | undefined) => void
}

export interface FormRequirements {
    target?: Visual,
    prefix?: string
}

type SubmissionFunction = (data: any, type: UserComponentType) => void
type DeleteFunction = (val: Visual, type: UserComponentType) => void
type ModifyFunction = (data: any, type: UserComponentType, target: Visual) => Visual
type FormEffect = "submit" | "delete" | "modify"
type FormEffectFunction = SubmissionFunction | DeleteFunction | ModifyFunction
type EffectGroup = {"submit": SubmissionFunction, "modify": ModifyFunction, "delete": DeleteFunction}




function getCoreDefaults(target: Visual): IVisual {
    if (Visual.isLabelGroup(target)) {
        return target.components.coreChild.state
    } else {
        return target.state
    }
}

export function FormDiagramInterface(props: FormHolderProps) {
    const ComponentFormEffectRegistry = useMemo<Partial<Record<UserComponentType, EffectGroup>>>(() => {
        return { "svg": {
            "submit": ENGINE.handler.submitElement.bind(ENGINE.handler),
            "modify": ENGINE.handler.submitModifyElement.bind(ENGINE.handler),
            "delete": ENGINE.handler.submitDeleteElement.bind(ENGINE.handler)
        },
        "rect": {
            "submit": ENGINE.handler.submitElement.bind(ENGINE.handler),
            "modify": ENGINE.handler.submitModifyElement.bind(ENGINE.handler),
            "delete": ENGINE.handler.submitDeleteElement.bind(ENGINE.handler)
        },
        "label-group": {
            "submit": ENGINE.handler.submitElement.bind(ENGINE.handler),
            "modify": ENGINE.handler.submitModifyElement.bind(ENGINE.handler),
            "delete": ENGINE.handler.submitDeleteElement.bind(ENGINE.handler)
        },
        "channel": {
            "submit": ENGINE.handler.submitElement.bind(ENGINE.handler),
            "modify": ENGINE.handler.submitModifyElement.bind(ENGINE.handler),
            "delete": ENGINE.handler.submitDeleteElement.bind(ENGINE.handler)
        },
    
    }
    }, [ENGINE.handler])

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const submitRef = useRef<SubmitButtonRef>(null);

    // Submit function
    function dispatchFormEffect(values: IVisual, masterType: UserComponentType, effect: FormEffect) {
        var targetFunction: FormEffectFunction | undefined = ComponentFormEffectRegistry[masterType][effect];

        if (targetFunction === undefined) {
            throw new Error(`Not implemented`)
        }

        switch (effect) {
            case "submit":
                (targetFunction as SubmissionFunction)(values, masterType);
                break;
            case "modify":
                (targetFunction as ModifyFunction)(values, masterType, props.target);
                break;
            case "delete":
                (targetFunction as DeleteFunction)(props.target, masterType);
                break;
        }
        

    }

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
                        onClick={() => {dispatchFormEffect(props.target!, props.targetType as UserComponentType, "delete"); props.changeTarget(undefined); 
                        myToaster.show({message: `Deleted element '${props.target?.ref}'`, intent: "danger", timeout: 1000})}}>
                    </Button>
                    ) : <></>}
                </div>

                <Divider style={{margin: "0 0 16px 0"}}></Divider>
            </div>
        </div>
        
        <div style={{height: "100%", display: "flex", flexDirection: "column", overflow: "hidden",padding: "0px"}}>
            
            <LabelGroupComboForm ref={submitRef} objectType={props.targetType as UserComponentType} target={props.target} 
                    callback={(val: IVisual, masterType: UserComponentType) => 
                        {props.target ? dispatchFormEffect(val, masterType, "modify") :
                                        dispatchFormEffect(val, masterType, "submit");
                         props.changeTarget(undefined);
                    }}></LabelGroupComboForm>
            
            <div id="submit-area" style={{width: "100%", alignSelf: "center", margin: "4px 2px 18px 2px", height: "30px", marginTop: "auto", display: "flex", flexDirection: "column"}} >
                <Divider></Divider>
                <Button style={{width: "80%", margin: "auto", alignSelf: "center", }} onClick={() => submitRef.current?.submit()}
                    text={props.target !== undefined ? "Apply" : "Add"} icon={props.target !== undefined ? "tick" : "add"}></Button>
            </div>
        </div>

        {/* DEBUG: Inspect object dialog */}
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