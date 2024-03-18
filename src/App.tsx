import React, { useEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import Channel from './vanilla/channel';
import { SVG, extend as SVGextend, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { channelInterface, channelStyle } from './vanilla/channel';
import { temporalInterface } from './vanilla/temporal';
import Form from './Form';
import SequenceHandler from './vanilla/sequenceHandler';
import Errors from './Errors';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';

const DESTINATIONSVGID = "moveSVGHere";

function App() {
  const [textboxValue, setTextboxValue] = useState<string>("");
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<{parseError: string, drawError: string}>({parseError: "", drawError: ""});

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

      <div style={{display: "flex", flexDirection: "column"}}>

        <div style={{height: "5vh"}}>
          <Banner saveSVG={SaveSVG} saveScript={SaveScript}></Banner>
        </div>
        

        <div style={{display: "flex", flexDirection: "row", height: "90vh"}}>
          <div style={{display: "flex", flexDirection: "column", width: "80%"}}>
            <div style={{width: "100%", minHeight: 500}}>
              <Canvas script={textboxValue} zoom={2} handler={handle.current} 
                updateChannels={setChannelNames}
                provideErrors={UpdateErrors}></Canvas>
            </div>
            
            <Editor Parse={TypeEvent} editorText={textboxValue}></Editor>
            <Errors parseError={errors.parseError} drawError={errors.drawError}></Errors>
          </div>

          <div style={{minWidth: "300px", width: "20%", height: "100%", overflow: "scroll"}}>
            <Form AddCommand={AddCommand} channelOptions={channelNames}></Form>
          </div>
        </div>

        
      </div>
        
      </>
    )
}

export default App
//           
