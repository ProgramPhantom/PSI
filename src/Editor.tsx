import React, { ChangeEvent, useEffect, useState } from 'react'

type InputEvent = ChangeEvent<HTMLTextAreaElement>;

interface EditorProps {
    Parse(text: string): void,
    editorText: string
}

const style: any = {width: "100%",
                    height: "150px",
                    padding: "12px 20px",
                    boxSizing: "border-box",
                    border: "2px dotted #aaa",
                    borderRadius: "4px",
                    backgroundColor: "#f8f8f8",
                    fontSize: "16px",
                    resize: "none",
                    fontFamily: "Lucida Sans Typewriter",
                }

function Editor(props: {editorText: string, Parse: (text: string) => void}) {
    const [internalState, setInternalState] = useState(props.editorText);
    useEffect(() => {

    }) 
    



    return (
        <div>
            <h2 style={{margin: "0 0 8px 7px", textDecoration: "bottomline", fontFamily: "lucidabright", fontSize: "20px"}}>Script</h2>
            <textarea rows={10} cols={100} color='grey' 
                  onChange={(e: InputEvent) => {props.Parse(e.target.value)}}
                  spellCheck="false"
                  style={style}
                  value={props.editorText}
                  ></textarea >
        </div>
    )
}

export default Editor
// Parse(e.target.value); setInternalState(e.target.value)