import { Section, SectionCard, Text, TextArea, Card, Elevation, H5, Divider } from '@blueprintjs/core';
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

}

const ElementsDraw: React.FC<IEditorProps> = () => {
    return (

        <div style={{height: "100%", }}>
            <Section style={{padding: "0px", overflow: "visible", boxShadow: "none"}}>
                <SectionCard style={{
                    padding: "0px",
                    height: "100%",
                    overflowY: "auto",
                    overflow: "visible",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <div style={{
                        position: "sticky", 
                        top: "0px",
                        backgroundColor: "white",
                        zIndex: 10,
                        padding: "8px 16px 4px 16px",
                        
                    }}>
                        <H5 style={{margin: "0 0 4px 0", color: "#182026", userSelect: "none"}}>
                            Elements
                        </H5>
                        <Text style={{color: "#5c7080", fontSize: "12px", marginBottom: "8px", userSelect: "none"}}>
                            Drag and drop these elements onto the canvas
                        </Text>
                        <Divider style={{margin: "0 0 0px 0"}} />
                    </div>

                    <div style={{
                        padding: "8px 16px"
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: "12px",
                            padding: "4px"
                        }}>
                            <DraggableElement element={ENGINE.PULSE90} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.PULSE180} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.P180} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.AMP} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.ACQUIRE} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.CHIRPHILO} handler={ENGINE.handler} />
                            <DraggableElement element={ENGINE.CHIRPLOHI} handler={ENGINE.handler} />
                        </div>
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

export default ElementsDraw