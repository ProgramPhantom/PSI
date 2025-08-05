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


interface IFormProps {
    target?: Visual,
    changeTarget: (val: Visual | undefined) => void
}

const Form: React.FC<IFormProps> = (props) => {
    return (
        <>
            <div style={{padding: 20}}>
                <FormHolder target={props.target} changeTarget={props.changeTarget}/>
            </div>
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form // ?
}

export default Form