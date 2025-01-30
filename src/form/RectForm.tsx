import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import * as ReactDOM from 'react-dom';
import { Control, Controller, FieldValue, FieldValues, useForm, useWatch } from 'react-hook-form';
import { IText } from '../vanilla/text';

import { Button, ControlGroup, Divider, FormGroup, HTMLSelect, InputGroup, NumericInput, Section, Slider, Switch, Tab, Tabs, Tooltip } from "@blueprintjs/core";
import MountableForm from './MonutableForm';
import LabelForm from './LabelForm';
import ArrowForm from './ArrowForm';
import { Divide } from '@blueprintjs/icons';
import SequenceHandler from '../vanilla/sequenceHandler';
import RectElement, { IRect } from '../vanilla/rectElement';
import { Visual } from '../vanilla/visual';
import Channel from '../vanilla/channel';
import VisualForm from './VisualForm';

interface IRectForm {
    handler: SequenceHandler, 
    values: IRect,
    target?: RectElement,
    reselect: (element: Visual | undefined) => void
}

const RectForm: React.FC<IRectForm> = (props) => {
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<IRect>({
        defaultValues: {...props.values},
        mode: "onChange"
    });

    const onSubmit = (data: IRect) => {
        // Create the new positional
        var newRect: RectElement = new RectElement(data)
    
        if (props.target !== undefined) {
            // MODIFICATION
            props.handler.replaceElement(props.target, newRect)
            // props.handler.softModify(props.target, data);
        } else {
            // ADDITION
            props.handler.mountElementFromTemplate(data, "90pulse")
        }
    
        // Select this new element
        props.reselect(newRect);
      };
    
    const deleteMe = () => {
        if (props.target === undefined) {return} 

        props.handler.deleteElement(props.target);
        props.reselect(undefined);
    }

    return (
        <>
            <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                <h3>{props.target ? props.target.refName : "Rect pulse"}</h3>
                {props.target !== undefined ? (
                <button style={{width: "30", height: "30", justifySelf: "end"}} onClick={() => deleteMe()}>
                    delete
                </button>) : <></>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <h3>Simple Pulse</h3>

                <Tabs defaultSelectedTabId={"core"} animate={false}>
                    <Tab id="core" title="Core" panel={
                        <VisualForm control={control} change={() => {}}></VisualForm>
                    }>
                    </Tab>

                    <Tab id="label" title="Label" panel={<LabelForm control={control} change={() => {}}></LabelForm>}/>
                    <Tab id="arrow" title="Arrow" panel={<ArrowForm control={control} change={() => {}}></ArrowForm>} />
                </Tabs>

                <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"} value={props.target !== undefined ? "Modify" : "Add"}></input>
            </form>
        </>

        
    );
}
    
export default RectForm