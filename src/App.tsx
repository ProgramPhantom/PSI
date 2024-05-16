import React, { useEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import Channel from './vanilla/channel';
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { channelInterface, channelStyle } from './vanilla/channel';
import { temporalInterface } from './vanilla/temporal';
import Form from './Form';
import SequenceHandler from './vanilla/sequenceHandler';
import Errors, { errorState } from './Errors';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';
import DraggableElement from './dnd/DraggableElement';

const DESTINATIONSVGID = "moveSVGHere";

function App() {
  const [textboxValue, setTextboxValue] = useState<string>("");
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<errorState>({parseError: "", drawError: ""});

  const handle = useRef<SequenceHandler>(new SequenceHandler(""));

  function TypeEvent(script: string) {
    setTextboxValue(script);
    
  }

  function AddCommand(line: string) {
    setTextboxValue(textboxValue + "\n" + line);
  }

  function UpdateErrors(parse: string, draw: string) {
    setErrors({parseError: parse, drawError: draw});
  }

  function SaveSVG() {
    var destinationSurface = document.getElementById(DESTINATIONSVGID);
    var boarder = document.getElementById("BOARDER");
    destinationSurface?.removeChild(boarder!)

    var blob = new Blob([destinationSurface?.outerHTML!], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "sequence.svg");
  }

  function SaveScript() {
    var script = handle.current.script;

    var blob = new Blob([script], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "sequence.nmpd");
  }

  useEffect(() => {
    
    if (Object.keys(handle.current.sequence.channels).toString() !== channelNames.toString()) {
      setChannelNames(Object.keys(handle.current.sequence.channels))
    }
    
  }, [channelNames])
  

  return (
      <>

      <div style={{display: "grid", width: "100%", gridTemplateColumns: "auto 400px", gridTemplateRows: "50px auto", minHeight: "100vh", rowGap: "0", columnGap: "0"}}>

        <div style={{gridColumnStart: 1, gridColumnEnd: 3, width: "100%"}}>
          <Banner saveSVG={SaveSVG} saveScript={SaveScript}></Banner>
        </div>
        

        <div style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 3, height: "100%", display: "flex", flexDirection: "column"}}>
          <div style={{height: "100%"}} >
            <Canvas script={textboxValue} zoom={2} handler={handle.current} 
              updateChannels={setChannelNames}
              provideErrors={UpdateErrors}></Canvas>
          </div>
          
          <div style={{position: "relative", width: "100%", bottom: "0px"}}>
            <Editor handler={handle.current} Parse={TypeEvent} editorText={textboxValue} errorStatus={errors} ></Editor>
          </div>
        </div>

        <div style={{gridColumnStart: 2, gridColumnEnd: 3}}>
          <Form AddCommand={AddCommand} channelOptions={channelNames}></Form>
        </div>
        
      </div>
        
      </>
    )
}

export default App
//           
