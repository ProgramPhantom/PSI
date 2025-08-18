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
import { OverlayToaster, Toaster, Drawer, Position } from '@blueprintjs/core';
import ComponentResizer from './ComponentResizer';
import Console from './Console';

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
  console.info("Application initialized successfully")

  useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
  
  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

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

  function openConsole() {
    setIsConsoleOpen(true);
  }


  return (
      <>

      <div style={{display: "flex", height: "100%", width: "100%", flexDirection: "column"}}>
        <div style={{width: "100%"}}>
          <Banner saveSVG={SaveSVG} saveScript={SaveScript} openConsole={openConsole}></Banner>
        </div>
        
        <div style={{display: "flex", height: "100%", width: "100%"}}>
          <div style={{flex: "1 1", height: "100%", display: "flex", flexDirection: "column"}}>
            <div style={{height: "100%", position: "relative"}} >
              {canvas}
            </div>
            
            
              <div style={{position: "relative", bottom: "0px", display: "flex", flexDirection: "column"}}>
                <ComponentResizer resizeDirection="vertical" defaultHeight={250} panelName="Elements">
                  <Editor></Editor>
                </ComponentResizer>
              </div>
            

          </div>


          <div style={{gridColumnStart: 2, gridColumnEnd: 3,}}>
            <ComponentResizer resizeDirection='horizontal'
                defaultWidth={400} 
                minWidth={200} 
                maxWidth={800}
              >
              <Form target={selectedElement} changeTarget={setSelectedElement}></Form>
            </ComponentResizer>
          </div>
          
        </div>
      </div>

      {/* Console Drawer */}
      <Drawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        position={Position.BOTTOM}
        size="50%"
        title="Console Output"
        icon="console"
        
      >
        <Console isOpen={isConsoleOpen} />
      </Drawer>
      </>
    )
}

export default App
