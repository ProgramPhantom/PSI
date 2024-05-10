import React, { ChangeEvent, useEffect, useState } from 'react'

export interface errorState {
    parseError: string,
    drawError: string
}

function Errors(props: {parseError: string, drawError: string}) {
    return (
        <>
        <div style={{display: "flex", flexDirection: "column", paddingRight: "20px", gap: "10px"}}>
            <label>Parse Errors</label>
            <input value={props.parseError} readOnly={true} style={{}}></input>
            
            <label>Draw Errors</label>
            <input value={props.drawError} readOnly={true} style={{}}></input>
        </div>
        </>
    )
}

export default Errors