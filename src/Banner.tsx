import React, { useEffect, useRef, useState } from 'react'


export default function Banner(props: {saveSVG: () => void, saveScript: () => void}) {
    return (
        <>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyItems: "flex-start", width: "100%"}}>
            <div style={{width: "25%", verticalAlign: "middle", textAlign: "center"}}>
                <h1 style={{verticalAlign: "middle",  margin: "auto", fontFamily: "Lucida Bright", textAlign: "center", }}>
                    Pulse Sequence Imager
                </h1>
            </div>

            <div style={{justifySelf: "flex-end", display: "flex", flexDirection: "row", alignItems: "center", height: "100%", gap: "10px", marginLeft: "auto"}}>
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
        </>
    )
}

