import React, { ChangeEvent, useState } from 'react'
import DynamicForm from './DynamicForm';

function Form(props: {AddCommand: (line: string) => void, channelOptions: string[]}) {
    const [selectedEl, setSelectedEl] = useState<string>("pulse90");
    const [selectedChannel, setSelectedChannel] = useState<string>(props.channelOptions[0])

    
    return (
        <>
        <div style={{minWidth: "200px"}}>
            <form style={{}}>
                <label> Select element:
                    <select onChange={(e) => setSelectedEl(e.target.value)}>
                        <option value={"pulse90"} key={1}>Pulse90</option>
                        <option value={"pulse180"} key={2}>Pulse180</option>

                        <option value={"180"} key={3}>180</option>
                        <option value={"amp"} key={4}>Amp Series</option>
                        <option value={"aquire"} key={5}>Aquire</option>
                        <option value={"chirphilo"} key={6}>ChirpHiLo</option>
                        <option value={"chirplohi"} key={7}>ChirpHiLo</option>
                        <option value={"halfsine"} key={8}>Halfsine</option>
                        <option value={"saltirehilo"} key={9}>SaltireHiLo</option>
                        <option value={"saltirelohi"} key={10}>SaltireLoHi</option>
                        <option value={"talltrap"} key={11}>Tall Trapezium</option>
                        <option value={"trap"} key={12}>Trapezium</option>

                        <option value={"span"} key={13}>Span</option>
                        <option value={"abstract"} key={14}>Abstract</option>
                    </select>
                </label>

                <label> Select channel:
                    <select onChange={(e) => setSelectedChannel(e.target.value)}>
                        <option selected={true} style={{display: "none"}}></option>
                        {props.channelOptions.map((name, index) => {
                            return (<option value={name} key={index}>{name}</option>)

                        })}

                    </select>
                </label>
            </form>
            
             
            <DynamicForm AddCommand={props.AddCommand} temporalName={selectedEl} channelName={selectedChannel} key={selectedEl}></DynamicForm>
            
           
        </div>
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form
}

export default Form