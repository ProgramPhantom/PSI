import { Section, SectionCard, Text, TextArea, Card, Elevation, H5, Divider, Dialog, Button, DialogFooter, DialogBody, EntityTitle, Tabs, Tab } from '@blueprintjs/core';
import React, { ChangeEvent, useEffect, useState } from 'react'
import Errors, { errorState } from './Errors';
import DraggableElement from './dnd/DraggableElement';
import DiagramHandler from './vanilla/diagramHandler';
import ENGINE from "./vanilla/engine";
import { Visual } from './vanilla/visual';
import RectElementForm from './form/RectForm';
import NewElementDialog from './NewElementDialog';


interface IElementDrawProps {

}

const ElementsDraw: React.FC<IElementDrawProps> = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | null>(null);
    const [isNewElementDialogOpen, setIsNewElementDialogOpen] = useState(false);

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

        <div style={{height: "100%", }}>
            <Section style={{padding: "0px", overflow: "visible", boxShadow: "none"}}>
                <SectionCard style={{
                    padding: "0px",
                    height: "100%",
                    overflowY: "auto",
                    overflow: "visible",
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
                        padding: "8px 16px"
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: "12px",
                            padding: "4px"
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

                            {ENGINE.RECT_TEMPLATES.map((s) => {
                                return <DraggableElement key={s.ref} element={s} onDoubleClick={handleElementDoubleClick} />
                            })}
                            {ENGINE.SVG_TEMPLATES.map((s) => {
                                return <DraggableElement key={s.ref} element={s} onDoubleClick={handleElementDoubleClick} />
                            })}
                        </div>
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
            
            <NewElementDialog isOpen={isNewElementDialogOpen} close={handleNewElementDialogClose}></NewElementDialog>
        </div>

        
    )
}

export default ElementsDraw