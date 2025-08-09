import { Alignment, Button, ButtonGroup, Icon, Navbar } from '@blueprintjs/core'
import React, { useEffect, useRef, useState } from 'react'
import DraggableElement from './dnd/DraggableElement'


export default function Banner(props: {saveSVG: () => void, saveScript: () => void}) {
    return (
        <>
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Icon icon="pulse" size={20} style={{marginRight: "10px"}}></Icon>
                <Navbar.Heading>Pulse Planner v0.2.3 (BETA)</Navbar.Heading>
                <Navbar.Divider />

                <Button small={true} minimal={true} icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button small={true} minimal={true} icon="media" text="Save JPG" onClick={props.saveScript}/>
                
            </Navbar.Group>
        </Navbar>
        </>
    )
}

