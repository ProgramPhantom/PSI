import { Button, Checkbox, Classes, Dialog, DialogFooter, FormGroup, Icon, InputGroup, Navbar, NumericInput, Popover } from '@blueprintjs/core'
import React, { useRef, useState } from 'react'
import { myToaster, SelectionMode } from './App'
import { IDiagram } from './vanilla/diagram'
import ENGINE from './vanilla/engine'
import UploadArea from './UploadArea'

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSavePNG = () => {
        props.savePNG(pngWidth, pngHeight, pngFilename);
        setIsPNGDialogOpen(false);
    };

    const handleLoadFile = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const stateData = JSON.parse(e.target?.result as string);
                    ENGINE.handler.constructDiagram(stateData);
                    myToaster.show({
                        message: "State loaded successfully",
                        intent: "success"
                    });
                    setIsLoadDialogOpen(false);
                    setSelectedFile(null);
                } catch (error) {
                    console.error(error)
                    myToaster.show({
                        message: "Invalid file format. Please select a valid state file.",
                        intent: "danger"
                    });
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleFileSelect = (file: File) => {
        if (file.type === "application/json" || file.name.endsWith('.json')) {
            setSelectedFile(file);
        } else {
            myToaster.show({
                message: "Please select a JSON file",
                intent: "warning"
            });
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                <Navbar.Heading>Pulse Planner v0.2.3 (BETA)</Navbar.Heading>
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

        {/* Load State Dialog */}
        <Dialog
            isOpen={isLoadDialogOpen}
            onClose={() => {
                setIsLoadDialogOpen(false);
                setSelectedFile(null);
            }}
            title="Load State File"
            icon="upload"
        >
            <div className={Classes.DIALOG_BODY}>
                <UploadArea
                    selectedFile={selectedFile}
                    onFileSelected={handleFileSelect}
                    onRemoveFile={removeFile}
                    accept={'.json'}
                    promptText={'Drag and drop a JSON state file here, or'}
                    buttonText={'Choose File'}
                    setInputRef={(el) => {
                        if (fileInputRef) (fileInputRef as any).current = el
                    }}
                />
            </div>
            
            <DialogFooter
                actions={
                    <>
                        <Button 
                            text="Cancel" 
                            onClick={() => {
                                setIsLoadDialogOpen(false);
                                setSelectedFile(null);
                            }} 
                        />
                        <Button 
                            text="Load" 
                            intent="primary" 
                            onClick={handleLoadFile}
                            disabled={!selectedFile}
                        />
                    </>
                }
            />
        </Dialog>
    </>

    )
}

