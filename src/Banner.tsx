import { Alignment, Button, ButtonGroup, Navbar } from '@blueprintjs/core'
import React, { useEffect, useRef, useState } from 'react'
import DraggableElement from './dnd/DraggableElement'


export default function Banner(props: {saveSVG: () => void, saveScript: () => void}) {
    return (
        <>
        {/*
<div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyItems: "flex-start"}}>
            <div style={{width: "25%", verticalAlign: "middle", textAlign: "center"}}>
                <h1 style={{verticalAlign: "middle",  margin: "auto", fontFamily: "Lucida Bright", textAlign: "center", }}>
                    Pulse Sequence Imager
                </h1>
            </div>

            <div style={{justifySelf: "flex-end", display: "flex", flexDirection: "row", alignItems: "center", height: "100%", gap: "10px"}}>
                <div style={{textAlign: "center"}}>
                    <button onClick={props.saveSVG}>
                        <p style={{ margin: "auto",  fontFamily: "Lucida Bright"}}>
                            Save SVG
                        </p>
                    </button>
                </div>

                <div style={{textAlign: "center"}}>
                    <button onClick={props.saveScript}>
                        <p style={{ margin: "auto",  fontFamily: "Lucida Bright"}}>
                            Save Script
                        </p>
                    </button>
                </div>

                <div style={{textAlign: "center"}}>
                    <button>
                        <p style={{ margin: "auto",  fontFamily: "Lucida Bright"}}>
                            Save JPG
                        </p>
                    </button>
                </div>
            </div>

        </div>
        */}
        

        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>Pulse Planner v0.0.7</Navbar.Heading>
                <Navbar.Divider />

                <Button small={true} minimal={true} icon="cloud-download" text="Save SVG" onClick={props.saveSVG}/>
                <Navbar.Divider />
                <Button small={true} minimal={true} icon="document-share" text="Save Script" onClick={props.saveScript}/>
                <Navbar.Divider />
                <Button small={true} minimal={true} icon="media" text="Save JPG" onClick={props.saveScript}/>
                
            </Navbar.Group>
        </Navbar>
        </>
    )
}

