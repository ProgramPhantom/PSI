import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, NumericInput } from "@blueprintjs/core";
import { useState } from "react";
import ENGINE from "../logic/engine";

interface IPNGExportDialogProps {
    close: () => void
    isOpen: boolean,
    savePNG: (width: number, height: number, filename: string) => void,
}

export function PNGExportDialog(props: IPNGExportDialogProps) {
    const [pngWidth, setPngWidth] = useState(ENGINE.handler.diagram.width);
    const [pngHeight, setPngHeight] = useState(ENGINE.handler.diagram.height);
    const [pngFilename, setPngFilename] = useState("pulse-diagram.png");

    const handleSavePNG = () => {
        props.savePNG(pngWidth, pngHeight, pngFilename);
        props.close();
    };

    return (
        <>
        {/* PNG Export Dialog */}
        <Dialog isOpen={props.isOpen}
            onClose={props.close}
            title="Export PNG Image"
            icon="media"
        >
            <DialogBody>
                <FormGroup
                    label="Filename"
                    labelFor="filename-input"
                >
                    <InputGroup
                        id="filename-input"
                        value={pngFilename}
                        onChange={(e) => setPngFilename(e.target.value)}
                        placeholder="Enter filename..."
                    />
                </FormGroup>
                
                <FormGroup
                    label="Width (pixels)"
                    labelFor="width-input"
                >
                    <NumericInput
                        id="width-input"
                        value={pngWidth}
                        onValueChange={(value) => setPngWidth(value || ENGINE.handler.diagram.width)}
                        min={100}
                        max={4000}
                        stepSize={50}
                        majorStepSize={100}
                    />
                </FormGroup>
                
                <FormGroup
                    label="Height (pixels)"
                    labelFor="height-input"
                >
                    <NumericInput
                        id="height-input"
                        value={pngHeight}
                        onValueChange={(value) => setPngHeight(value || ENGINE.handler.diagram.height)}
                        min={100}
                        max={4000}
                        stepSize={50}
                        majorStepSize={100}
                    />
                </FormGroup>
            </DialogBody>
            
            <DialogFooter
                actions={
                    <>
                        <Button text="Cancel" onClick={props.close} />
                        <Button text="Save" intent="primary" onClick={handleSavePNG} />
                    </>
                }
            />
        </Dialog>
        </>
    )
}