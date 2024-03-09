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
                    <select onChange={(e) => {setSelectedEl(e.target.value); console.log("selected ", e.target.value)}}>
                        <option value={"pulse90"} key={1}>Pulse90</option>
                        <option value={"pulse180"} key={2}>Pulse180</option>
                    </select>
                </label>

                <label> Select channel:
                    <select onChange={(e) => {setSelectedChannel(e.target.value); console.log("selected ", e.target.value)}}>
                        <option selected={true} style={{display: "none"}}></option>
                        {props.channelOptions.map((name, index) => {
                            return (<option value={name} key={index}>{name}</option>)

                        })}

                    </select>
                </label>
            </form>
            
            <DynamicForm AddCommand={props.AddCommand} temporalName={selectedEl} channelName={selectedChannel}></DynamicForm>
            
           
        </div>
        </>
    )
}

export default Form