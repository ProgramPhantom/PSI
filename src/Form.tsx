import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import ChannelForm from './form/ChannelForm';
import { FieldValue, FieldValues, useForm } from 'react-hook-form';
import { IChannel } from './vanilla/channel';
import { PositionalSVG } from './vanilla/svgElement';
import { PositionalRect } from './vanilla/rectElement';
import { defaultChannel } from './vanilla/default/data';
import SequenceHandler from './vanilla/sequenceHandler';
import SVGForm from './form/SVGForm';

type FormStructures = IChannel | PositionalSVG | PositionalRect

interface IFormProps {
    sequence: SequenceHandler, 
    form: ReactNode | null
}

const Form: React.FC<IFormProps> = (props) => {
    var channelData: IChannel = (defaultChannel as any);

    return (
        <>
            <div style={{padding: 20}}>
                {
                    props.form === null ? 
                        (<ChannelForm sequence={props.sequence} defaultVals={channelData}></ChannelForm>)
                     :  (props.form)
                }
            </div>
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form
}

export default Form