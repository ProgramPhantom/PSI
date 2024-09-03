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

function Form(props: {AddCommand: (line: string) => void, channelOptions: string[], sequence: SequenceHandler, form: ReactNode | null}) {
    const [selectedEl, setSelectedEl] = useState<string>("~");
    const [selectedChannel, setSelectedChannel] = useState<string>(props.channelOptions[0])

    useEffect(() => {
        setSelectedChannel(props.channelOptions[props.channelOptions.length-1]);
    }, [props.channelOptions])

    var channelData: IChannel = (defaultChannel as any);

    
    return (
        <>
            <div style={{padding: 20}}>
                {
                    props.form === null ? 
                        (<ChannelForm sequence={props.sequence} defaultVals={channelData}></ChannelForm>)
                     :  (props.form )
                }
                
            </div>
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form
}

export default Form

{/* 
<form>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{paddingBottom: 2, paddingRight: 10}}> Select element:
                    </label>
                    <select onChange={(e) => setSelectedEl(e.target.value)} defaultValue={selectedEl} style={{marginBottom: 10}}>
                        <option value={"~"} key={0}>Channel</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"pulse90"} key={1}>Pulse90</option>
                        <option value={"pulse180"} key={2}>Pulse180</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"180"} key={3}>180</option>
                        <option value={"amp"} key={4}>Amp Series</option>
                        <option value={"aquire"} key={5}>Aquire</option>
                        <option value={"chirphilo"} key={6}>ChirpHiLo</option>
                        <option value={"chirplohi"} key={7}>ChirpLoHi</option>
                        <option value={"halfsine"} key={8}>Halfsine</option>
                        <option value={"saltirehilo"} key={9}>SaltireHiLo</option>
                        <option value={"saltirelohi"} key={10}>SaltireLoHi</option>
                        <option value={"talltrap"} key={11}>Tall Trapezium</option>
                        <option value={"trap"} key={12}>Trapezium</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"span"} key={13}>Span</option>
                        <option value={"abstract"} key={14}>Abstract</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"section"} key={15}>Section</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"["} key={16}>Open Bracket</option>
                        <option value={"]"} key={17}>Close Bracket</option>

                        <option value={"|"} key={18}>Horizontal Rule</option>
                    </select>

                    <label style={{paddingBottom: 2, paddingRight: 10}}> Select channel:</label>
                    <select style={{marginBottom: 10}} onChange={(e) => {setSelectedChannel(e.target.value)}}
                            value={selectedChannel}>
                            <option style={{display: "none"}} value={"DEFAULT"}>Select a channel</option>
                            {props.channelOptions.map((name, index) => {
    
                                return (<option value={name} key={index}>{name}</option>)
                            })}
                    </select>
                </div>

            </form>    

    <div>
                <ElementForm AddCommand={props.AddCommand} commandName={selectedEl} channelName={selectedChannel} key={selectedEl}></ElementForm>
             </div>        
    
*/}