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
import LabelGroup, { ILabelGroup } from "../vanilla/labelGroup";
import { AllComponentTypes, ElementBundle, UserComponentType } from "../vanilla/diagramHandler";
import { myToaster } from "../App";
import { inspect } from "util"
import ReactJson from "react18-json-view"
import { Inspector, ObjectInspector } from "react-inspector"
import { AllStructures } from "../vanilla/diagram";
import { FormRequirements } from "./FormHolder";
import { ILabel } from "../vanilla/label";


interface LabelGroupComboForm {
    target?:  Visual,
    objectType: UserComponentType,
    callback: (val: Visual | undefined) => void
}


export function LabelGroupComboForm(props: LabelGroupComboForm) {
    var parentForm: React.FC<FormRequirements>;
    var childForm: React.FC<FormRequirements> | undefined;
    var labelForm: React.FC<FormRequirements> | undefined;

    var parentDefaults: IVisual;
    var childDefaults: IVisual | undefined;
    var labelDefaults: ILabel[];

    var targetCoreChildType: AllComponentTypes | undefined = (props.target?.constructor as typeof Visual).ElementType;


    if (props.target === undefined) {
        // Use the object type to setup a clean form
        labelDefaults = [];

        switch (props.objectType) {
            case "svg":
                parentDefaults = ENGINE.schemeManager.defaultScheme.svgElements["180"];
                break;
            case "rect":
                parentDefaults = ENGINE.schemeManager.defaultScheme.rectElements["90-pulse"];
                break;
            default:
                throw new Error(`Not implemented`);
        }
    } else {
        if (LabelGroup.isLabelGroup(props.target)) {
                // Label group
        }
    }

    

    // Resetter (I don't understand why I need this...)
    useEffect(() => {
        if (props.target === undefined) {
            coreDefaults = Channel.defaults.default;
        } else {
            labelFormControls.reset(labelDefaults)
        }
        
        parentFormControls.reset(coreDefaults);
        
    }, [props.target]);
    

    // Create form hook
    const parentFormControls = useForm<IVisual>({
        defaultValues:  coreDefaults as DefaultValues<IVisual>,
        mode: "onChange"
    });

    // Create form hook
    const childFormControls = useForm<IVisual>({
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

    }


    var vals = parentFormControls.getValues(); 
    return (
        <>
        <form onSubmit={parentFormControls.handleSubmit(onSubmit)}
                style={{height: "100%", display: "flex", flexDirection: "column", overflow: "hidden",
                        padding: "0px"
                }}>
            
            <div style={{overflowY: "scroll", flex: "1 1 0",  padding: "4px"}} id="form-fields">
                <Tabs defaultSelectedTabId={"core"}>
                    <Tab style={{userSelect: "none", position: "sticky"}} id={"core"} title={"Core"} panel={
                            <FormProvider {...parentFormControls}>
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
        </>
    );
}