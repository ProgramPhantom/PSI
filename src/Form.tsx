import React, { ChangeEvent, useEffect, useState } from 'react'
import DynamicForm from './DynamicForm';

function Form(props: {AddCommand: (line: string) => void, channelOptions: string[]}) {
    const [selectedEl, setSelectedEl] = useState<string>("pulse90");
    const [selectedChannel, setSelectedChannel] = useState<string>(props.channelOptions[0])

    useEffect(() => {
        setSelectedChannel(props.channelOptions[props.channelOptions.length-1]);
    }, [props.channelOptions])
    
    return (
        <>
        <div style={{minWidth: "200px"}}>
            <form style={{}}>
                <div style={{display: "flex", flexDirection: "column", paddingTop: 10, paddingBottom: 20}}>
                    <label style={{paddingBottom: 2, paddingRight: 10}}> Select element:
                    </label>
                    <select onChange={(e) => setSelectedEl(e.target.value)} defaultValue={selectedEl} style={{marginBottom: 10}}>
                        <option value={"pulse90"} key={1}>Pulse90</option>
                        <option value={"pulse180"} key={2}>Pulse180</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

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

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"span"} key={13}>Span</option>
                        <option value={"abstract"} key={14}>Abstract</option>

                        <hr style={{padding: "3px 3px", margin: "3px 3px"}}></hr>

                        <option value={"["} key={15}>Open Bracket</option>
                        <option value={"]"} key={16}>Close Bracket</option>
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
                <DynamicForm AddCommand={props.AddCommand} commandName={selectedEl} channelName={selectedChannel} key={selectedEl}></DynamicForm>
             </div>
            
           
        </div>
        </>
    ) // Use key in Dynamic form so it forces a remount, triggering the inital values in the form
}

export default Form