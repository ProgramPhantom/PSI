import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
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
import { defaultPositional } from './vanilla/default/data';
import RectElement, { PositionalRect } from './vanilla/rectElement';
import { simplePulses } from './vanilla/default/data/simplePulse';
import RectForm from './form/RectForm';
import ENGINE from './vanilla/engine';

const DESTINATIONSVGID = "moveSVGHere";



function App() {
  console.log("CREATING APP")

  const svgDrawObj = useRef<Svg>();

  useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
  
  const canvas: ReactNode = <Canvas zoom={2} 
                                    handler={ENGINE.handler} 
                                    drawSurface={svgDrawObj} 
                                    sequenceId={ENGINE.getSnapshot()} 
                                    select={SelectPositional}></Canvas>

  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | null>(null);


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

    if (positional.element instanceof SVGElement) {
        // React Hook Forms breaks if the class object is used as the default vals.
        // Therefore, this keeps only the properties concerned for ISVG
        var elementSVGData = UpdateObj({...svgPulses[180], ...defaultPositional}, positional.element);
        // Currently "svgPulses[180]" is used simply to have an object with all data required for UpdateObj
        // to work. Every piece of data will be overriden.
        
        var newForm: ReactNode = <SVGForm 
                  handler={handle.current} 
                  values={(elementSVGData as PositionalSVG)} 
                  target={((positional as any) as Positional<SVGElement>)} channel={positional.channel}
                  reselect={SelectPositional}></SVGForm>
      
        setForm(newForm)
    } 
    else if (positional.element instanceof RectElement) {
      var elementRectData = UpdateObj({...simplePulses["pulse180"], ...defaultPositional}, positional.element);

      var newForm: ReactNode = <RectForm 
                handler={ENGINE.handler} 
                values={(elementRectData as PositionalRect)} 
                target={((positional as any) as Positional<RectElement>)} channel={positional.channel}
                reselect={SelectPositional}></RectForm>
      setForm(newForm)

    }
  }


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
            <Editor handler={ENGINE.handler}  ></Editor>
          </div>
        </div>

        <div style={{gridColumnStart: 2, gridColumnEnd: 3}}>
          <Form sequence={ENGINE.handler} form={form}></Form>
        </div>
      </div>
        
      </>
    )
}

export default App
