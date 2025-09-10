import { Button, Checkbox, Classes, Dialog, DialogFooter, FormGroup, Icon, InputGroup, Navbar, NumericInput, Popover, Text } from '@blueprintjs/core'
import React, { useRef, useState } from 'react'
import { myToaster, SelectionMode } from './App'
import { IDiagram } from './vanilla/diagram'
import ENGINE from './vanilla/engine'
import UploadArea from './UploadArea'
import SVGUploadList from './SVGUploadList'
import SchemeManager from './vanilla/default'

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
    const [isSVGDialogOpen, setIsSVGDialogOpen] = useState(false);
    const [pendingState, setPendingState] = useState<IDiagram | null>(null);
    const [svgUploads, setSvgUploads] = useState<Record<string, string>>({});
    const [stateSvgElements, setStateSvgElements] = useState<Array<{ name: string; element: any }>>([]);

    const svgRefExistsInSchemeManager = (svgRef: string): boolean => {
        const svgString: string | undefined = (ENGINE as any).AllSvgStrings?.[svgRef];
        return svgString !== undefined;
    };
    const isSvgRefSatisfied = (svgRef: string): boolean => {
        if (svgRefExistsInSchemeManager(svgRef)) return true;
        if (Object.prototype.hasOwnProperty.call(svgUploads, svgRef)) return true;
        return false;
    };
    const allStateSvgsSatisfied = stateSvgElements.length === 0 || stateSvgElements.every(({ element }) => isSvgRefSatisfied(element?.svgDataRef));

    const extractSvgElements = (stateData: IDiagram): Array<{ name: string; element: any }> => {
        const out: Array<{ name: string; element: any }> = [];
        stateData.sequences?.forEach((seq) => {
            seq.channels?.forEach((ch) => {
                ch.mountedElements?.forEach((el: any, idx: number) => {
                    const hasRef = el && (el.type === 'svg' || el.svgDataRef !== undefined);
                    if (hasRef) {
                        const name = el.ref || `${ch.sequenceID}-${idx}`;
                        out.push({ name, element: el });
                    }
                });
            });
        });
        return out;
    };

    const handleSavePNG = () => {
        props.savePNG(pngWidth, pngHeight, pngFilename);
        setIsPNGDialogOpen(false);
    };

    const handleLoadFile = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const stateData = JSON.parse(e.target?.result as string) as IDiagram;
                    const svgs = extractSvgElements(stateData);
                    setPendingState(stateData);
                    setStateSvgElements(svgs);
                    setSvgUploads({});
                    if (svgs.length === 0 || svgs.every(({ element }) => isSvgRefSatisfied(element?.svgDataRef))) {
                        ENGINE.handler.constructDiagram(stateData);
                        myToaster.show({ message: "State loaded successfully", intent: "success" });
                        setIsLoadDialogOpen(false);
                        setSelectedFile(null);
                        setPendingState(null);
                    } else {
                        setIsSVGDialogOpen(true);
                    }
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

    const confirmSvgUploads = () => {
        if (!pendingState) { setIsSVGDialogOpen(false); return; }
        // Ensure all refs satisfied
        const missing = stateSvgElements.filter(({ element }) => !isSvgRefSatisfied(element?.svgDataRef));
        if (missing.length > 0) {
            myToaster.show({ message: 'Please upload missing SVG files before continuing.', intent: 'danger' });
            return;
        }
        // Commit uploads to internal scheme
        Object.entries(svgUploads).forEach(([ref, str]) => {
            ENGINE.schemeManager.addSVGStrData(str, ref, SchemeManager.InternalSchemeName);
        });
        // Now construct diagram
        try {
            ENGINE.handler.constructDiagram(pendingState);
            myToaster.show({ message: 'State loaded successfully', intent: 'success' });
        } catch (e) {
            console.error(e);
            myToaster.show({ message: 'Failed to construct diagram.', intent: 'danger' });
        }
        setIsSVGDialogOpen(false);
        setIsLoadDialogOpen(false);
        setSelectedFile(null);
        setPendingState(null);
        setSvgUploads({});
        setStateSvgElements([]);
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

        {/* SVG Requirements Dialog after loading state */}
        <Dialog
            isOpen={isSVGDialogOpen}
            onClose={() => {
                // Cancel upload if user closes without resolving
                setIsSVGDialogOpen(false);
                setPendingState(null);
                setSvgUploads({});
                setStateSvgElements([]);
            }}
            title="Missing SVG Data"
            icon="warning-sign"
        >
            <div className={Classes.DIALOG_BODY}>
                <Text style={{ marginBottom: 8 }}>Some SVG elements in the uploaded state are missing their SVG data. Please upload the missing SVG files.</Text>
                <SVGUploadList
                    title={'SVG requirements'}
                    elements={stateSvgElements as any}
                    uploads={svgUploads}
                    setUploads={setSvgUploads}
                />
                {!allStateSvgsSatisfied && (
                    <Text style={{ color: '#a82a2a', marginTop: 8 }}>Please upload missing SVG files before continuing.</Text>
                )}
            </div>
            <DialogFooter
                actions={
                    <>
                        <Button
                            text="Cancel"
                            onClick={() => {
                                setIsSVGDialogOpen(false);
                                setPendingState(null);
                                setSvgUploads({});
                                setStateSvgElements([]);
                            }}
                        />
                        <Button
                            text="Continue"
                            intent="primary"
                            onClick={confirmSvgUploads}
                            disabled={!allStateSvgsSatisfied}
                        />
                    </>
                }
            />
        </Dialog>
    </>

    )
}

