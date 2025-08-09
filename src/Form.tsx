import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import ChannelForm from './form/ChannelForm';
import { FieldValue, FieldValues, useForm } from 'react-hook-form';
import { IChannel } from './vanilla/channel';
import { defaultChannel } from './vanilla/default/data';
import SequenceHandler from './vanilla/sequenceHandler';
import SVGElementForm from './form/SVGElementForm';
import { FormHolder } from './form/FormHolder';
import { Visual } from './vanilla/visual';
import ENGINE from './vanilla/engine';
import { Card } from '@blueprintjs/core';


interface IFormProps {
    target?: Visual,
    changeTarget: (val: Visual | undefined) => void
}

const Form: React.FC<IFormProps> = (props) => {
    return (
        <>
        <Card style={{ padding: "4px 12px", height: "100%",  overflow: "hidden", display: "flex", flexDirection: 
            "column", borderLeft: "1px solid #c3c3c4"}}>
                <FormHolder target={props.target} changeTarget={props.changeTarget}/>
        </Card>
            
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form // ?
}

export default Form