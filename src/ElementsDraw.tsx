import { Section, SectionCard, Text, TextArea, Card, Elevation, H5, Divider, Dialog, Button, DialogFooter, DialogBody, EntityTitle } from '@blueprintjs/core';
import React, { ChangeEvent, useEffect, useState } from 'react'
import Errors, { errorState } from './Errors';
import DraggableElement from './dnd/DraggableElement';
import SequenceHandler from './vanilla/sequenceHandler';
import ENGINE from "./vanilla/engine";
import { Visual } from './vanilla/visual';


interface IElementDrawProps {

}

const ElementsDraw: React.FC<IElementDrawProps> = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | null>(null);

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
                            <DraggableElement element={ENGINE.PULSE90} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.PULSE180} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.P180} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.AMP} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.ACQUIRE} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.CHIRPHILO} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
                            <DraggableElement element={ENGINE.CHIRPLOHI} handler={ENGINE.handler} onDoubleClick={handleElementDoubleClick} />
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

            {/*
            <Section collapsible={true} title={"Script"} icon={"code"} collapseProps={{defaultIsOpen: false}} compact={true}>
                <SectionCard>
                    <TextArea
                        onChange={(e: InputEvent) => {props.Parse(e.target.value)}}
                        
                        style={{width: "100%", resize: "vertical", minHeight: 100}}
                        value={props.editorText}
                    ></TextArea >
                </SectionCard>

                <SectionCard>
                    <Errors parseError={props.errorStatus.parseError} drawError={props.errorStatus.drawError}></Errors>
                </SectionCard>
            </Section> */}

        </div>

        
    )
}

export default ElementsDraw