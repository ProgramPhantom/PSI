import { Tab, Tabs } from "@blueprintjs/core";
import React, { useEffect, useImperativeHandle } from "react";
import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import Arrow from "../vanilla/arrow";
import Channel from "../vanilla/channel";
import Diagram from "../vanilla/diagram";
import { AllComponentTypes, UserComponentType } from "../vanilla/diagramHandler";
import Label, { ILabel } from "../vanilla/label";
import LabelGroup, { ILabelGroup } from "../vanilla/labelGroup";
import { Line } from "../vanilla/line";
import RectElement from "../vanilla/rectElement";
import Sequence from "../vanilla/sequence";
import Space from "../vanilla/space";
import SVGElement from "../vanilla/svgElement";
import { IVisual, Visual } from "../vanilla/visual";
import { FormRequirements } from "./FormHolder";
import LabelListForm, { LabelGroupLabels } from "./LabelListForm";


interface LabelGroupComboForm {
    target?:  Visual,
    objectType: UserComponentType,
    callback: (val: IVisual | undefined, masterType: UserComponentType) => void

    ref?: React.RefObject<SubmitButtonRef>
}

export type SubmitButtonRef = {
    submit: () => void
}

export interface FormBundle<T extends IVisual=IVisual> {
    form: React.FC,
    defaults: T,
    allowLabels: boolean
}

const correspondence: Partial<Record<UserComponentType, typeof Visual>> = {
    "rect": RectElement,
    "svg": SVGElement,
    "arrow": Arrow,
    "channel": Channel,
    "diagram": Diagram,
    "line": Line,
    "sequence": Sequence,
    "space": Space,
    "label-group": LabelGroup,
    "label": Label
}


export const LabelGroupComboForm = React.forwardRef<SubmitButtonRef, LabelGroupComboForm>((props, ref) => {
    var MasterForm: React.FC<FormRequirements>;
    var ChildForm: React.FC<FormRequirements> | undefined;
    var LabelForm: React.FC<FormRequirements> = Label.formData.form;

    var masterDefaults: IVisual;
    var childDefaults: IVisual | undefined;
    var labelDefaults: LabelGroupLabels = {labels: []}

    var allowLabels: boolean = true;
    var parentType: AllComponentTypes; 
    if (props.target !== undefined) {
        parentType = (props.target?.constructor as typeof Visual).ElementType;
    } else {
        parentType = props.objectType;
    }


    var targetIsLabelGroup: boolean = false;
    if (props.target === undefined) {
        // Use the object type to setup a clean form
        MasterForm = correspondence[props.objectType].formData.form;
        masterDefaults = correspondence[props.objectType].formData.defaults;
        allowLabels = correspondence[props.objectType].formData.allowLabels;
    } else {
        MasterForm = (props.target.constructor as typeof Visual).formData.form;
        masterDefaults = props.target.state;
        allowLabels = (props.target.constructor as typeof Visual).formData.allowLabels;

        if (LabelGroup.isLabelGroup(props.target)) {
            ChildForm = (props.target.coreChild.constructor as typeof Visual).formData.form;
            childDefaults = (props.target.coreChild.constructor as typeof Visual).formData.defaults;

            targetIsLabelGroup = true;
        } 
    }

    
    // Create form hook
    const masterFormControls = useForm<IVisual>({
        defaultValues:  masterDefaults as DefaultValues<IVisual>,
        mode: "onChange"
    });

    // Create form hook
    const childFormControls = useForm<IVisual>({
        defaultValues: childDefaults as DefaultValues<IVisual>,
        mode: "onChange"
    });

    // Create label hook form
    const labelListControls = useForm<LabelGroupLabels>({
        defaultValues: labelDefaults as DefaultValues<LabelGroupLabels>,
        mode: "onChange"
    });

    // Make sure form changes (this is needed for unknown reasons)
    useEffect(() => {
        masterFormControls.reset(masterDefaults);
        childFormControls.reset(masterDefaults);
        labelListControls.reset(labelDefaults);
        
    }, [props.target]);


    // Jiggery pokery. 
    useImperativeHandle(ref, () => ({
        submit: onSubmit
    }));

    // Submit function
    const onSubmit = masterFormControls.handleSubmit((data) => {
        var masterFormData: IVisual = masterFormControls.getValues();
        var childFormData: IVisual | undefined = childFormControls.getValues();
        var labelListFormData: ILabel[] = labelListControls.getValues().labels;
        

        if (targetIsLabelGroup === false) {
            
            if (labelListFormData.length > 0) {
                // Convert into a label group!

                // Normalise core child:
                childFormData = {...masterFormData}
                childFormData.padding = [0, 0, 0, 0];
                childFormData.offset = [0, 0];

                var result: ILabelGroup = {
                    coreChild: childFormData,
                    coreChildType: props.objectType as UserComponentType,
                    labels: labelListFormData,

                    ...masterFormData
                }

                props.callback(result, "label-group")
            } else {
                props.callback(masterFormData, props.objectType)
            }
        } else {
            // Already label type

            var result: ILabelGroup = {
                coreChild: childFormData,
                coreChildType: (masterFormData as ILabelGroup).coreChildType,
                labels: labelListFormData,

                ...masterFormData
            }
            props.callback(result, "label-group")
        }

        
    })


    var vals = masterFormControls.getValues(); 
    return (
        <>
        <form onSubmit={onSubmit}
                style={{display: "flex", flexDirection: "column", overflow: "hidden",
                        padding: "0px", height: "100%"
                }}>
            
            <div style={{overflowY: "scroll", flex: "1 1 0",  padding: "4px"}} id="form-fields">
                <Tabs defaultSelectedTabId={"properties"}>
                    <Tab style={{userSelect: "none", position: "sticky"}} id={"properties"} title={"Properties"} panel={
                            <FormProvider {...masterFormControls}>
                                <MasterForm target={props.target}></MasterForm>
                            </FormProvider>
                    }></Tab>
                

                    {allowLabels ? 
                        <Tab style={{userSelect: "none"}} id={"label"} title={"Labels"} panel={
                            <>
                                <FormProvider {...labelListControls}>
                                    <LabelListForm target={props.target}></LabelListForm> 
                                </FormProvider>
                            </>
                        }></Tab>
                    : <></>}
                </Tabs>
            </div>
        </form>
        </>
    );
})

