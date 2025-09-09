import { Button, Dialog, DialogBody, DialogFooter, Divider, EntityTitle, H5, Section, SectionCard, Tab, Tabs, Text, InputGroup, FormGroup, Icon, Classes } from '@blueprintjs/core';
import React, { useState, useSyncExternalStore, useRef } from 'react';
import TemplateDraggableElement from './dnd/TemplateDraggableElement';
import NewElementDialog from './NewElementDialog';
import SchemeManager, { SchemeSet, IUserSchemeData } from './vanilla/default';
import ENGINE, { SchemeSingletonStore, SingletonStorage } from "./vanilla/engine";
import { Visual } from './vanilla/visual';
import { Input } from '@blueprintjs/icons';
import { ObjectInspector } from 'react-inspector';
import { myToaster } from './App';


interface IElementDrawProps {

}

const ElementsDraw: React.FC<IElementDrawProps> = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | null>(null);
    const [isNewElementDialogOpen, setIsNewElementDialogOpen] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(SchemeManager.InternalSchemeName);
    const [isNewSchemeDialogOpen, setIsNewSchemeDialogOpen] = useState(false);
    const [newSchemeName, setNewSchemeName] = useState('');
    const [isDeleteSchemeDialogOpen, setIsDeleteSchemeDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
    const [schemeState, setSchemeState] = useState<SchemeSet>(ENGINE.schemeManager.allSchemes);

    const handleElementDoubleClick = (element: Visual) => {
        setSelectedElement(element);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedElement(null);
    };

    const handleSubmit = () => {
        // Handle form submission here
        console.log('Editing element:', selectedElement?.ref);
        handleDialogClose();
    };

    const handleNewElementDialogClose = () => {
        setIsNewElementDialogOpen(false);
    };

    const handleNewElementSubmit = () => {
        // Handle new element form submission here
        console.log('Creating new element');
        handleNewElementDialogClose();
    };

    const handleNewSchemeDialogClose = () => {
        setIsNewSchemeDialogOpen(false);
        setNewSchemeName('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNewSchemeSubmit = () => {
        if (newSchemeName.trim() && !ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim())) {
            if (selectedFile) {
                // Parse JSON file and create scheme with data
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const schemeData = JSON.parse(e.target?.result as string) as IUserSchemeData;
                        ENGINE.addScheme(newSchemeName.trim(), schemeData);
                        setSchemeState(ENGINE.schemeManager.allSchemes);
                        handleNewSchemeDialogClose();
                        myToaster.show({
                            message: "Scheme created successfully from JSON file",
                            intent: "success"
                        });
                    } catch (error) {
                        console.error(error);
                        myToaster.show({
                            message: "Invalid JSON file format. Please select a valid scheme file.",
                            intent: "danger"
                        });
                    }
                };
                reader.readAsText(selectedFile);
            } else {
                // Create new scheme with empty data
                ENGINE.addBlankScheme(newSchemeName.trim());
                setSchemeState(ENGINE.schemeManager.allSchemes);
                handleNewSchemeDialogClose();
            }
        }
    };

    const handleDeleteSchemeClick = () => {
        if (selectedScheme === SchemeManager.InternalSchemeName) {
            myToaster.show({
                message: "Cannot delete the internal scheme",
                intent: "danger"
            });
        } else {
            setIsDeleteSchemeDialogOpen(true);
        }
    };

    const handleDeleteSchemeDialogClose = () => {
        setIsDeleteSchemeDialogOpen(false);
    };

    const handleDeleteSchemeConfirm = () => {
        ENGINE.removeScheme(selectedScheme);
        setSchemeState(ENGINE.schemeManager.allSchemes);
        setSelectedScheme(SchemeManager.InternalSchemeName);
        setIsDeleteSchemeDialogOpen(false);
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
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

    return (

        <div style={{height: "100%", overflow: "hidden"}}>
            <Section style={{padding: "0px", overflow: "visible", boxShadow: "none", height: "100%"}}>
                <SectionCard style={{
                    padding: "0px",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <div style={{
                        position: "sticky", 
                        top: "0px",
                        backgroundColor: "white",
                        zIndex: 10,
                        padding: "8px 16px 4px 16px",
                        userSelect: "none"
                        
                    }}>
                        <EntityTitle title={"Elements"} subtitle={"Drag and drop these elements onto the canvas"} 
                        icon="new-object" heading={H5}></EntityTitle>

                        
                    </div>

                    <Divider style={{margin: "4px 8px 0 8px"}} />

                    <div style={{
                        padding: "8px 16px", width: "100%", height: "100%"
                    }}>
                        <style>{`.bp5-tabs { height: 100% }`}</style>

                        <Tabs onChange={(id) => setSelectedScheme(id as string)} vertical={true} defaultSelectedTabId={"default"} fill={true} selectedTabId={selectedScheme}>
                            <style>{`.bp5-tab-panel { width: 100%; height: 100%; !important; max-width: 100% !important; box-sizing: border-box; display: block; 
                                                      overflow: "auto" }`}</style>
                            
                            {Object.entries(schemeState).map(([schemeName, singletonDict]) => {
                                var singletons: SchemeSingletonStore | undefined = ENGINE.singletons[schemeName];
                                if (singletons === undefined) {return <></>}

                                var noElements: number = singletons.SVG_TEMPLATES.length + singletons.RECT_TEMPLATES.length + 
                                                         singletons.LABELGROUP_TEMPLATES.length;
                                return (
                                    <Tab key={schemeName} title={schemeName}
                                    style={{width: "100%", overflow: "auto"}} 
                                     tagProps={{round: true}} tagContent={noElements} id={schemeName} panel={
                                        <div style={{width: "100%", display: "flex", flexDirection: "row", height: "100%"}}>
                                            <Divider style={{}} ></Divider>
                                            <div style={{width: "100%",
                                                display: 'grid', overflow: "auto",
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                gridTemplateRows: "repeat(auto-fill, 120px)",
                                                gap: "12px",
                                                padding: "4px",
                                                }}>
                                                    {/* Plus button for adding new elements */}
                                                    {schemeName !== SchemeManager.InternalSchemeName ? 
                                                    <div 
                                                        style={{
                                                            width: "120px",
                                                            height: "120px", 
                                                            padding: "12px 8px",
                                                            border: "1px solid #d3d8de",
                                                            borderRadius: "4px",
                                                            backgroundColor: "white",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                                            transition: "all 0.2s ease",
                                                            userSelect: "none"
                                                        }} 
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
                                                            e.currentTarget.style.transform = "translateY(-1px)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                        }}
                                                        onClick={() => setIsNewElementDialogOpen(true)}
                                                        title="Add new template element"
                                                    >
                                                        <div style={{
                                                            fontSize: "32px",
                                                            color: "#5c7080",
                                                            marginBottom: "8px"
                                                        }}>
                                                            +
                                                        </div>
                                                        <span style={{
                                                            fontSize: "12px",
                                                            color: "#5c7080",
                                                            fontWeight: "600",
                                                            textAlign: "center",
                                                            lineHeight: "1.4"
                                                        }}>
                                                            Add New
                                                        </span>
                                                    </div> : <></>}

                                                    {singletons.RECT_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} 
                                                        element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                                    {singletons.SVG_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} 
                                                        element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                                    {singletons.LABELGROUP_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} 
                                                        element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                            </div>
                                        </div>             
                                    }>

                                    </Tab>)

                            })}

                            
                        </Tabs>
                        
                        {/* Add New Scheme Button */}
                        <div style={{
                            position: "absolute",
                            bottom: "16px",
                            left: "20px",
                            zIndex: 10,
                            width: "60px"
                        }}>
                            <Button
                                icon="plus"
                                variant='outlined'
                                intent="primary"
                                onClick={() => setIsNewSchemeDialogOpen(true)}
                                style={{
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        </div>

                        {/* Delete Scheme button */}
                        <div style={{
                            position: "absolute",
                            bottom: "16px",
                            left: "60px",
                            zIndex: 10,
                            width: "60px"
                        }}>
                            <Button
                                icon="trash"
                                variant='outlined'
                                intent="danger"
                                onClick={handleDeleteSchemeClick}
                                disabled={selectedScheme === SchemeManager.InternalSchemeName}
                                style={{
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        </div>
                        
                    </div>
                    
                    
                    
                </SectionCard>
            </Section>

            
             {/* Edit template dialog */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                title="Edit element"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
            >
                <DialogBody>
                    <Text>
                        Editing element: {selectedElement?.ref} (WIP)
                    </Text>

                    <ObjectInspector data={selectedElement}></ObjectInspector>
                </DialogBody>

                <DialogFooter actions={
                    <>
                    <Button 
                            text="Cancel" 
                            onClick={handleDialogClose}
                            variant="minimal"/>
                    <Button 
                            text="Submit" 
                            intent="primary"
                            onClick={handleSubmit}/>
                    </>
                }></DialogFooter>
            </Dialog>
            
            <NewElementDialog isOpen={isNewElementDialogOpen} close={handleNewElementDialogClose} schemeName={selectedScheme}></NewElementDialog>
            
            {/* New Scheme Dialog */}
            <Dialog
                isOpen={isNewSchemeDialogOpen}
                onClose={handleNewSchemeDialogClose}
                title="Create New Scheme"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
            >
                <div className={Classes.DIALOG_BODY}>
                    <Text>
                        Enter a name for the new scheme:
                    </Text>
                    <FormGroup
                        intent={!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? "danger" : "primary"}
                        helperText={!newSchemeName.trim() ? "Cannot be empty" : 
                        (ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? "Cannot have duplicate names" : undefined)}>
                        <InputGroup 
                            intent={!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim()) ? "danger" : "primary"}
                            value={newSchemeName}
                            onChange={(e) => setNewSchemeName(e.target.value)}
                            placeholder="Scheme name"
                            style={{ marginTop: "8px" }}>

                        </InputGroup>
                    </FormGroup>

                    <Divider style={{ margin: "16px 0" }} />

                    <Text style={{ marginBottom: "12px" }}>
                        Optionally upload a JSON file to populate the scheme:
                    </Text>
                    
                    <div
                        style={{
                            border: `2px dashed ${isDragOver ? '#137cbd' : '#c1c1c1'}`,
                            borderRadius: '8px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {selectedFile ? (
                            <div style={{ width: '100%' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    backgroundColor: '#e1f5fe',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #b3e5fc'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon icon="document" size={16} style={{ marginRight: '8px' }} />
                                        <span style={{ fontWeight: '500' }}>{selectedFile.name}</span>
                                    </div>
                                    <Button
                                        icon="cross"

                                        onClick={removeFile}
                                        style={{ marginLeft: '8px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Icon icon="upload" size={48} style={{ marginBottom: '16px', color: '#5c7080' }} />
                                <p style={{ marginBottom: '16px', color: '#5c7080' }}>
                                    Drag and drop a JSON scheme file here, or
                                </p>
                                <Button
                                    icon="folder-open"
                                    intent="primary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                />
                            </>
                        )}
                    </div>
                </div>
                
                <DialogFooter actions={
                    <>
                    <Button 
                            text="Cancel" 
                            onClick={handleNewSchemeDialogClose}
                            variant="minimal"/>
                    <Button 
                            text="Create" 
                            intent="primary"
                            onClick={handleNewSchemeSubmit}
                            disabled={!newSchemeName.trim() || ENGINE.schemeManager.schemeNames.includes(newSchemeName.trim())}/>
                    </>
                }></DialogFooter>
            </Dialog>

            {/* Delete Scheme Confirmation Dialog */}
            <Dialog
                isOpen={isDeleteSchemeDialogOpen}
                onClose={handleDeleteSchemeDialogClose}
                title="Delete Scheme"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
            >
                <DialogBody>
                    <Text>
                        Are you sure you want to delete the scheme "{selectedScheme}"? This action cannot be undone.
                    </Text>
                </DialogBody>
                
                <DialogFooter actions={
                    <>
                    <Button 
                            text="Cancel" 
                            onClick={handleDeleteSchemeDialogClose}
                            variant="minimal"/>
                    <Button 
                            text="Delete" 
                            intent="danger"
                            onClick={handleDeleteSchemeConfirm}/>
                    </>
                }></DialogFooter>
            </Dialog>
        </div>

        
    )
}

export default ElementsDraw