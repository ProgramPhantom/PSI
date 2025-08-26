import { Alignment, Button, ButtonGroup, Checkbox, Classes, Dialog, DialogFooter, EntityTitle, FormGroup, Icon, InputGroup, Navbar, NumericInput, Popover } from '@blueprintjs/core'
import React, { useEffect, useRef, useState } from 'react'
import DraggableElement from './dnd/DraggableElement'
import { SelectionMode } from './App'
import ENGINE from './vanilla/engine'

export interface IBannerProps {
    saveSVG: () => void, 
    savePNG: (width: number, height: number, filename: string) => void,
    openConsole: () => void,
    selection: {selectionMode: SelectionMode, setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>}
}

export default function Banner(props: IBannerProps) {
    const [isPNGDialogOpen, setIsPNGDialogOpen] = useState(false);
    const [pngWidth, setPngWidth] = useState(ENGINE.handler.diagram.width);
    const [pngHeight, setPngHeight] = useState(ENGINE.handler.diagram.height);
    const [pngFilename, setPngFilename] = useState("pulse-diagram.png");

    const handleSavePNG = () => {
        props.savePNG(pngWidth, pngHeight, pngFilename);
        setIsPNGDialogOpen(false);
    };
    


    return (
        <>
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Icon icon="pulse" size={20} style={{marginRight: "10px"}}></Icon>
                <Navbar.Heading>Pulse Planner v0.2.3 (BETA)</Navbar.Heading>
                <Navbar.Divider />

                
                <Button size="small" variant="minimal" icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="media" text="Save PNG" onClick={() => setIsPNGDialogOpen(true)}/>

                <Navbar.Divider />
                <Popover renderTarget={({isOpen, ...targetProps}) => (
                    <Button {...targetProps} size="small" variant="minimal" icon="new-link" text="Annotate" />
                )} interactionKind='click' popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                content={<div>
                    
                    <Checkbox label='Draw Line' onClick={() => props.selection.setSelectionMode(props.selection.selectionMode === "select" ? "draw" : "select")} 
                    checked={props.selection.selectionMode === "select" ? false : true}></Checkbox>
                </div>} onClose={() => {}}></Popover>
                
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
    </>

    )
}

