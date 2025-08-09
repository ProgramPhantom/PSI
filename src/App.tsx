import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import { SVG, extend as SVGextend, Element, Svg } from '@svgdotjs/svg.js'
import Form from './Form';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';
import SVGElementForm from './form/SVGElementForm';
import { Visual } from './vanilla/visual';
import { UpdateObj } from './vanilla/util';
import { svgPulses } from './vanilla/default/data/svgPulse';
import SVGElement, { ISVG } from './vanilla/svgElement';
import { defaultMountable } from './vanilla/default/data';
import RectElement, { IRect } from './vanilla/rectElement';
import { simplePulses } from './vanilla/default/data/simplePulse';
import RectForm from './form/RectForm';
import ENGINE from './vanilla/engine';
import Channel from './vanilla/channel';
import Labellable from './vanilla/labellable';
import { OverlayToaster, Toaster } from '@blueprintjs/core';

ENGINE.surface = SVG().attr({"pointer-events": 'bounding-box'});

export const myToaster: Toaster = await OverlayToaster.create({ position: "bottom",  });


const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  background: "#f0f0f0"
};

function App() {
  console.log("CREATING APP")

  useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
  
  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);

  const canvas: ReactNode = <Canvas select={SelectElement} selectedElement={selectedElement}></Canvas>

  function SaveSVG() {
    throw new Error("Not implemented")
  }

  function SaveScript() {
    // var script = ENGINE.handler.parser.script;
// 
    // var blob = new Blob([script], {type: "text/plain;charset=utf-8"});
    // FileSaver.saveAs(blob, "sequence.nmpd");
  }

  function SelectElement(element: Visual | undefined) {
    if (element === undefined) {
      setSelectedElement(undefined);
      setForm(null);
      return
    }

    setSelectedElement(element);
  }


  return (
      <>

      <div style={{display: "grid", height: "100%", width: "100%", gridTemplateColumns: "auto 400px", gridTemplateRows: "50px auto", rowGap: "0", columnGap: "0"}}>
        <div style={{gridColumnStart: 1, gridColumnEnd: 3, width: "100%"}}>
          <Banner saveSVG={SaveSVG} saveScript={SaveScript}></Banner>
        </div>
        
        <div style={{gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 3, height: "100%", display: "flex", flexDirection: "column"}}>
          <div style={{height: "100%", position: "relative"}} >
            {canvas}
          </div>
          
          <div style={{position: "relative", width: "100%", bottom: "0px"}}>
            <Editor></Editor>
          </div>
        </div>

        <div style={{gridColumnStart: 2, gridColumnEnd: 3, overflow: "hidden",}}>
          <Form target={selectedElement} changeTarget={setSelectedElement}></Form>
        </div>
      </div>
      </>
    )
}

export default App
