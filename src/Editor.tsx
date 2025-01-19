import { Section, SectionCard, Text, TextArea } from '@blueprintjs/core';
import React, { ChangeEvent, useEffect, useState } from 'react'
import Errors, { errorState } from './Errors';
import DraggableElement from './dnd/DraggableElement';
import SequenceHandler from './vanilla/sequenceHandler';
import ENGINE from "./vanilla/engine";

type InputEvent = ChangeEvent<HTMLTextAreaElement>;

interface EditorProps {
    Parse(text: string): void,
    editorText: string
}

const style: any = {width: "100%",
                    height: "150px",
                    padding: "12px 20px 20px 20px",
                    boxSizing: "border-box",
                    border: "2px dotted #aaa",
                    borderRadius: "4px",
                    backgroundColor: "#f8f8f8",
                    fontSize: "16px",
                    resize: "vertical",
                    fontFamily: "Lucida Sans Typewriter",
                    
                }

interface IEditorProps {
    handler: SequenceHandler, 
}

const Editor: React.FC<IEditorProps> = (props) => {


    
    return (
        <div style={{padding: 10}}>

            <Section collapsible={true} title={"Blocks"} icon={"waves"} compact={true}>
                <SectionCard>
                    <div style={{display: 'flex', flexDirection: "row", gap: "10px", margin: "10px"}}>
                        <DraggableElement element={ENGINE.PULSE90} handler={props.handler}></DraggableElement>

                    </div>
                    

                </SectionCard>
                
            </Section>

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

export default Editor