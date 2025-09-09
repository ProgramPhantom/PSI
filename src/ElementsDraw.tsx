import { Button, Dialog, DialogBody, DialogFooter, Divider, EntityTitle, H5, Section, SectionCard, Tab, Tabs, Text } from '@blueprintjs/core';
import React, { useState, useSyncExternalStore } from 'react';
import TemplateDraggableElement from './dnd/TemplateDraggableElement';
import NewElementDialog from './NewElementDialog';
import SchemeManager from './vanilla/default';
import ENGINE, { SingletonStorage } from "./vanilla/engine";
import { Visual } from './vanilla/visual';


interface IElementDrawProps {

}

const ElementsDraw: React.FC<IElementDrawProps> = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | null>(null);
    const [isNewElementDialogOpen, setIsNewElementDialogOpen] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(SchemeManager.DefaultSchemeName);

    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
    const [singletons, setSingletons] = useState<SingletonStorage>(ENGINE.singletons);

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

                        <Tabs vertical={true} defaultSelectedTabId={"default"} fill={true} selectedTabId={selectedScheme}>
                            <style>{`.bp5-tab-panel { width: 100%; height: 100%; !important; max-width: 100% !important; box-sizing: border-box; display: block; 
                                                      overflow: "auto" }`}</style>
                            
                            {Object.entries(singletons).map(([schemeName, singletonDict]) => {
                                var noElements: number = singletonDict.SVG_TEMPLATES.length + singletonDict.RECT_TEMPLATES.length + 
                                                         singletonDict.LABELGROUP_TEMPLATES.length;
                                return (
                                    <Tab style={{width: "100%", overflow: "auto"}} title={schemeName} tagProps={{round: true}} tagContent={noElements} id={schemeName} panel={
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
                                                    </div>

                                                    {singletonDict.RECT_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                                    {singletonDict.SVG_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                                    {singletonDict.LABELGROUP_TEMPLATES.map((s) => {
                                                        return <TemplateDraggableElement key={s.ref} element={s} onDoubleClick={handleElementDoubleClick} schemeName={schemeName}/>
                                                    })}
                                            </div>
                                        </div>             
                                    }>

                                    </Tab>)

                            })}

                            
                        </Tabs>

                    </div>
                </SectionCard>
            </Section>

            <Dialog
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                title="Edit element"
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
                
            >
                <DialogBody>
                    <Text>
                        Editing element: {selectedElement?.ref}
                    </Text>
                </DialogBody>
                    
                {/* Add your form content here */}

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
        </div>

        
    )
}

export default ElementsDraw