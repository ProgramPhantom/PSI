import { Button, Dialog, DialogBody, DialogFooter, Tab, Tabs, Text } from "@blueprintjs/core"
import RectElementForm from "./form/RectForm"
import { FormProvider, useForm } from "react-hook-form"
import { IRectElement } from "./vanilla/rectElement"
import SVGElement, { ISVGElement } from "./vanilla/svgElement"
import SVGElementForm from "./form/SVGElementForm"
import ENGINE from "./vanilla/engine"


interface INewElementDialog {
    isOpen: boolean,
    close: () => void,
    schemeName: string,
}

export default function NewElementDialog(props: INewElementDialog) {
    const rectFormControls = useForm<IRectElement>({
        defaultValues: {contentWidth: 50, contentHeight: 50},
        mode: "onChange",
    })
    const svgFormControls = useForm<ISVGElement>({
        defaultValues: {contentWidth: 50, contentHeight: 50, mountConfig: {}},
        mode: "onChange",
    });

    function addNewTemplate() {
        var values: ISVGElement = svgFormControls.getValues();
        var newSVG: SVGElement = new SVGElement(values);


        ENGINE.addSVGSingleton(values, props.schemeName)
        props.close();
    }

    return (
        <>
            {/* New Element Dialog */}
            <Dialog style={{width: "400px", height: "600px"}}
                isOpen={props.isOpen}
                onClose={props.close}
                title="Add New Template Element"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
            >
                <DialogBody>
                    <Tabs id="newElementTabs" defaultSelectedTabId="rect">
                        <Tab id="rect" title="Rect" panel={
                            <FormProvider {...rectFormControls}>
                                <RectElementForm></RectElementForm>
                            </FormProvider>
                            
                        } />
                        <Tab id="svg" title="SVG" panel={
                            <FormProvider {...svgFormControls}>
                                <SVGElementForm ></SVGElementForm>
                            </FormProvider>
                        } />
                        <Tab id="label-group" title="Label Group" panel={
                            <div style={{ padding: "16px 0" }}>
                                <Text>Label group element form will go here</Text>
                            </div>
                        } />
                    </Tabs>
                </DialogBody>

                <DialogFooter actions={
                    <>
                    <Button 
                            text="Cancel" 
                            onClick={close}
                            variant="minimal"/>
                    <Button onClick={() => addNewTemplate()}
                            text="Submit" 
                            intent="primary"
                            />
                    </>
                }></DialogFooter>
            </Dialog>
        </>
    )
}