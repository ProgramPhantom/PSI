import React, { useEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import Channel from './vanilla/channel';
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { channelInterface, channelStyle } from './vanilla/channel';
import { temporalInterface } from './vanilla/temporal';
import Form from './Form';
import SequenceHandler from './vanilla/sequenceHandler';

function App() {
  const [textboxValue, setTextboxValue] = useState<string>("");
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const handle = useRef<SequenceHandler>(new SequenceHandler(""));

  function TypeEvent(script: string) {
    setTextboxValue(script);
    
  }

  function AddCommand(line: string) {
    setTextboxValue(textboxValue + "\n" + line);
    
  }

  function GetChannels(c: string[]) {
    // setChannels(c)
    
  }
  console.log("channel names:", channelNames)

  useEffect(() => {
    
    if (Object.keys(handle.current.sequence.channels).toString() !== channelNames.toString()) {
      setChannelNames(Object.keys(handle.current.sequence.channels))
    }
    
  }, [channelNames])
  

  return (
      <>
      <div style={{display: "flex", }}>
        <div style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "80%"}}>
          <Canvas script={textboxValue} zoom={2} handler={handle.current} updateChannels={setChannelNames}></Canvas>
          <Editor Parse={TypeEvent} editorText={textboxValue}></Editor>
        </div>
        <div style={{minWidth: "300px", width: "20%"}}>
          <Form AddCommand={AddCommand} channelOptions={channelNames}></Form>
        </div>
        
      </div>
        
      </>
    )
}

export default App
