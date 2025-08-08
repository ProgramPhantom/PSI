import { Alignment, Button, ButtonGroup, Navbar } from '@blueprintjs/core'
import React, { useEffect, useRef, useState } from 'react'
import DraggableElement from './dnd/DraggableElement'


export default function Banner(props: {saveSVG: () => void, saveScript: () => void}) {
    return (
        <>
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>Pulse Planner v0.1.3</Navbar.Heading>
                <Navbar.Divider />

                <Button small={true} minimal={true} icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button small={true} minimal={true} icon="media" text="Save JPG" onClick={props.saveScript}/>
                
            </Navbar.Group>
        </Navbar>
        </>
    )
}

