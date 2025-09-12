import { Button, Checkbox, Classes, Icon, Navbar, Popover } from '@blueprintjs/core'
import React, { useState } from 'react'
import { myToaster, Tool } from "../../app/App"
import { IDiagram } from "../../logic/diagram"
import ENGINE from "../../logic/engine"
import { LoadStateDialog } from './LoadStateDialog'
import { PNGExportDialog } from './PNGExportDialog'
import { AnnotateDropdown } from './AnnotateDropdown'
import Line from '../../logic/line'

export interface IBannerProps {
    saveSVG: () => void, 
    savePNG: (width: number, height: number, filename: string) => void,
    openConsole: () => void,

    selectedTool: Tool
    setTool: (tool: Tool) => void
}

export default function Banner(props: IBannerProps) {
    const [isPNGDialogOpen, setIsPNGDialogOpen] = useState(false);
    const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

    const copyState = () => {
        var stateObject: IDiagram = ENGINE.handler.diagram.state
        var stateString = JSON.stringify(stateObject, undefined, 4);

        navigator.clipboard.writeText(stateString);

        myToaster.show({
            message: "State copied to clipboard",
            intent: "success"
        })
    }

    const selectLineTool = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (props.selectedTool.type === "arrow") {
            props.setTool({type: "select", config: {}})
            e.preventDefault()
            e.stopPropagation()
        } else {
            props.setTool({type: "arrow", config: {lineStyle: Line.defaults["default"].lineStyle, mode: "bind"}})
        }
    }

    const saveState = () => {
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
                
                
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="cut" text="Copy state" onClick={() => copyState()}/>
                <Navbar.Divider />
                <Button size="small" variant="minimal" icon="floppy-disk" text="Save state" onClick={() => saveState()}/>

                <Navbar.Divider />
                <Navbar.Divider />
                <AnnotateDropdown selectedTool={props.selectedTool} setTool={props.setTool}></AnnotateDropdown>
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

        <PNGExportDialog close={() => setIsPNGDialogOpen(false)} isOpen={isPNGDialogOpen} savePNG={props.savePNG}></PNGExportDialog>
        
        <LoadStateDialog close={() => setIsLoadDialogOpen(false)} isOpen={isLoadDialogOpen}></LoadStateDialog>
        </>

    )
}

