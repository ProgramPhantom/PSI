import { Button, Dialog, DialogBody, DialogFooter, Tab, Tabs } from "@blueprintjs/core"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as t from "ts-interface-checker"
import svgElementTypeSuite from "../../typeCheckers/SVGElement-ti"
import { UserComponentType } from "../../logic/diagramHandler"
import ENGINE from "../../logic/engine"
import { ILabelGroup } from "../../logic/hasComponents/labelGroup"
import { IRectElement } from "../../logic/rectElement"
import { ISVGElement } from "../../logic/svgElement"
import { IVisual } from "../../logic/visual"
import { LabelGroupComboForm, SubmitButtonRef } from "../form/LabelGroupComboForm"

const checker = t.createCheckers(svgElementTypeSuite);

interface INewElementDialog {
    isOpen: boolean,
    close: () => void,
    schemeName: string,
}

export default function NewElementDialog(props: INewElementDialog) {
    const [tabId, setTabId] = useState<UserComponentType>("svg")
    const submitRef = useRef<SubmitButtonRef>(null);

    const rectFormControls = useForm<IRectElement>({
        defaultValues: {contentWidth: 50, contentHeight: 50},
        mode: "onChange",
    })
    const svgFormControls = useForm<ISVGElement>({
        defaultValues: {contentWidth: 50, contentHeight: 50, mountConfig: {}},
        mode: "onChange",
    });

    function addNewTemplate(values: IVisual, masterType: UserComponentType) {
        switch (masterType) {
            case "svg":
                ENGINE.addSVGSingleton(values as ISVGElement, props.schemeName);
                break;
            case "rect":
                ENGINE.addRectSingleton(values as IRectElement, props.schemeName);
                break;
            case "label-group":
                ENGINE.addLabelGroupSingleton(values as ILabelGroup, props.schemeName);
                break;
            default:
                throw new Error(`Not implemented`)
        }

        props.close();
    }

    return (
        <>
            {/* New Element Dialog */}
            <Dialog style={{width: "600px", height: "700px"}}
                isOpen={props.isOpen}
                onClose={props.close}
                title="Add New Template Element"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
            >
                <DialogBody>
                    <Tabs id="newElementTabs" defaultSelectedTabId="rect" selectedTabId={tabId} onChange={(id) => setTabId(id as UserComponentType)}>
                        <Tab id="rect" title="Rect" panel={
                            <LabelGroupComboForm ref={submitRef} objectType={tabId} callback={addNewTemplate}>

                            </LabelGroupComboForm>
                            
                        } />
                        <Tab id="svg" title="SVG" panel={
                            <LabelGroupComboForm ref={submitRef} objectType={tabId} callback={addNewTemplate}>

                            </LabelGroupComboForm>
                        } />
                    </Tabs>
                </DialogBody>

                <DialogFooter actions={
                    <>
                    <Button 
                            text="Cancel" 
                            onClick={() => props.close()}
                            variant="minimal"/>
                    <Button onClick={() => submitRef.current?.submit()}
                            text="Submit" 
                            intent="primary"
                            />
                    </>
                }></DialogFooter>
            </Dialog>
        </>
    )
}