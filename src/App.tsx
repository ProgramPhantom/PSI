import React, { useState } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import Channel from './vanilla/channel';
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { channelInterface, channelStyle } from './vanilla/channel';
import { temporalInterface } from './vanilla/temporal';

function App() {
  const [textboxValue, setTextboxValue] = useState<string>("");

  
  function TypeEvent(script: string) {
    

    setTextboxValue(script);
  }



  return (
      <>
      <button onClick={() => TypeEvent}>Draw</button>

      <div id={"canvasDiv"}></div>
      <Canvas props={textboxValue}></Canvas>
      <Editor Parse={TypeEvent}></Editor>
      
      </>
    )
}

export default App
