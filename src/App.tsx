import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import Channel from './vanilla/channel';
import { SVG, extend as SVGextend, Element, Svg } from '@svgdotjs/svg.js'
import { IChannel, IChannelStyle } from './vanilla/channel';
import Positional, { IPositional } from './vanilla/positional';
import Form from './Form';
import SequenceHandler from './vanilla/sequenceHandler';
import Errors, { errorState } from './Errors';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';
import DraggableElement from './dnd/DraggableElement';
import SVGForm from './form/SVGForm';
import ChannelForm from './form/ChannelForm';
import { Visual } from './vanilla/visual';
import { UpdateObj } from './vanilla/util';
import { svgPulses } from './vanilla/default/data/svgPulse';
import SVGElement, { ISVG, PositionalSVG } from './vanilla/svgElement';

const DESTINATIONSVGID = "moveSVGHere";

function App() {
  const [textboxValue, setTextboxValue] = useState<string>("");
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<errorState>({parseError: "", drawError: ""});
  const svgDrawObj = useRef<Svg>();

  const handle = useRef<SequenceHandler>(new SequenceHandler(svgDrawObj.current!, Refresh));
  
  const [id, setId] = useState<string>(handle.current.id);

  const canvas: ReactNode = <Canvas script={textboxValue} zoom={2} handler={handle.current} 
                                    updateChannels={setChannelNames}
                                    provideErrors={UpdateErrors}
                                    drawSurface={svgDrawObj} sequenceId={id} select={SelectPositional}></Canvas>

  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | null>(null);

  function Refresh(uid: string) {
    setId(uid);
  }

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
    var script = handle.current.parser.script;

    var blob = new Blob([script], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "sequence.nmpd");
  }

  function SelectPositional<T extends Visual>(positional: Positional<T> | undefined) {
    if (positional === undefined) {
      setSelectedElement(null);
      setForm(null);
      return
    }


    setSelectedElement(positional.element);
    // console.log(typeof positional.element)
    // console.log(SVGElement.toString())

    if (positional.element instanceof SVGElement) {
      // React Hook Forms breaks if the class object is used as the default vals.
      // Therefore, this keeps only the properties concerned for ISVG
      var elementSVGData = UpdateObj(svgPulses[180], positional.element);
      
      var newForm: ReactNode = <SVGForm handler={handle.current} 
                defaultVals={(elementSVGData as PositionalSVG)} 
                target={((positional as any) as Positional<SVGElement>)} channel={positional.channel}></SVGForm>
    
      setForm(newForm)
    }


  }

  useEffect(() => {
    
    if (Object.keys(handle.current.sequence.channelsDic).toString() !== channelNames.toString()) {
      setChannelNames(Object.keys(handle.current.sequence.channelsDic))
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
            {canvas}
          </div>
          
          <div style={{position: "relative", width: "100%", bottom: "0px"}}>
            <Editor handler={handle.current} Parse={TypeEvent} editorText={textboxValue} errorStatus={errors} ></Editor>
          </div>
        </div>

        <div style={{gridColumnStart: 2, gridColumnEnd: 3}}>
          <Form AddCommand={AddCommand} channelOptions={channelNames} sequence={handle.current} form={form}></Form>
        </div>
        
      </div>
        
      </>
    )
}

export default App
//           
