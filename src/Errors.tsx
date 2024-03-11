import React, { ChangeEvent, useEffect, useState } from 'react'

function Errors(props: {parseError: string, drawError: string}) {
    return (
        <>
        <div style={{display: "flex", flexDirection: "column"}}>
            <input value={props.parseError} readOnly={true} style={{}}></input>
            <input value={props.drawError} readOnly={true} style={{}}></input>
        </div>
        </>
    )
}

export default Errors