import { Button, Checkbox, Classes, Dialog, DialogBody, DialogFooter, FormGroup, Icon, InputGroup, Navbar, NumericInput, Popover, Text } from '@blueprintjs/core'
import React, { useRef, useState } from 'react'
import { myToaster, SelectionMode } from './App'
import { IDiagram } from './vanilla/diagram'
import ENGINE from './vanilla/engine'
import UploadArea from './UploadArea'
import SVGUploadList from './SVGUploadList'
import SchemeManager from './vanilla/default'
import { LoadStateDialog } from './LoadStateDialog'

export interface IBannerProps {
    saveSVG: () => void, 
    savePNG: (width: number, height: number, filename: string) => void,
    openConsole: () => void,
    selection: {selectionMode: SelectionMode, setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>}
}

export default function Banner(props: IBannerProps) {
    const [isPNGDialogOpen, setIsPNGDialogOpen] = useState(false);
    const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
    const [pngWidth, setPngWidth] = useState(ENGINE.handler.diagram.width);
    const [pngHeight, setPngHeight] = useState(ENGINE.handler.diagram.height);
    const [pngFilename, setPngFilename] = useState("pulse-diagram.png");


    const handleSavePNG = () => {
        props.savePNG(pngWidth, pngHeight, pngFilename);
        setIsPNGDialogOpen(false);
    };


    function copyState() {
        var stateObject: IDiagram = ENGINE.handler.diagram.state
        var stateString = JSON.stringify(stateObject, undefined, 4);

        navigator.clipboard.writeText(stateString);

        myToaster.show({
            message: "State copied to clipboard",
            intent: "success"
        })
    }

    function saveState() {
        ENGINE.save();
        myToaster.show({
            message: "State saved to localStorage",
            intent: "success"
        });
    }

    return (
        <>
        <Navbar>
            <Navbar.Group>
                <Icon icon="pulse" size={20} style={{marginRight: "10px"}}></Icon>
                <Navbar.Heading>Pulse Planner v0.5.3 (BETA)</Navbar.Heading>
                <Navbar.Divider />

                
                <Button size="small" variant="minimal" icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="media" text="Save PNG" onClick={() => setIsPNGDialogOpen(true)}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="upload" text="Load" onClick={() => setIsLoadDialogOpen(true)}/>

                <Navbar.Divider />
                <Popover renderTarget={({isOpen, ...targetProps}) => (
                    <Button {...targetProps} size="small" variant="minimal" icon="new-link" text="Annotate" />
                )} interactionKind='click' popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                content={<div>
                    
                    <Checkbox label='Draw Line' onClick={() => props.selection.setSelectionMode(props.selection.selectionMode === "select" ? "draw" : "select")} 
                    checked={props.selection.selectionMode === "select" ? false : true}></Checkbox>
                </div>} onClose={() => {}}></Popover>
                
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="cut" text="Copy state" onClick={() => copyState()}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="floppy-disk" text="Save state" onClick={() => saveState()}/>
            </Navbar.Group>
            
            <Navbar.Group align={"right"}>
                <Button 
                    size="small" 
                    variant="minimal" 
                    icon="console" 
                    text="Console" 
                    onClick={props.openConsole}
                />
            </Navbar.Group>
        </Navbar>

        {/* PNG Export Dialog */}
        <Dialog
            isOpen={isPNGDialogOpen}
            onClose={() => setIsPNGDialogOpen(false)}
            title="Export PNG Image"
            icon="media"
        >
            <div className={Classes.DIALOG_BODY}>
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
            </div>
            
            <DialogFooter
                actions={
                    <>
                        <Button text="Cancel" onClick={() => setIsPNGDialogOpen(false)} />
                        <Button text="Save" intent="primary" onClick={handleSavePNG} />
                    </>
                }
            />
        </Dialog>
        
        <LoadStateDialog close={() => setIsLoadDialogOpen(false)} isOpen={isLoadDialogOpen}></LoadStateDialog>
        </>

    )
}

