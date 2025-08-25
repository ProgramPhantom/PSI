import { Alignment, Button, ButtonGroup, Checkbox, Classes, EntityTitle, Icon, Navbar, Popover } from '@blueprintjs/core'
import React, { useEffect, useRef, useState } from 'react'
import DraggableElement from './dnd/DraggableElement'
import { SelectionMode } from './App'

export interface IBannerProps {
    saveSVG: () => void, 
    openConsole: () => void,
    selection: {selectionMode: SelectionMode, setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>}
}

export default function Banner(props: IBannerProps) {
    return (
        <>
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Icon icon="pulse" size={20} style={{marginRight: "10px"}}></Icon>
                <Navbar.Heading>Pulse Planner v0.2.3 (BETA)</Navbar.Heading>
                <Navbar.Divider />

                
                <Button size="small" variant="minimal" icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="media" text="Save JPG" disabled={true}/>

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
        </>
    )
}

