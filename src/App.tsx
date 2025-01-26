import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import { SVG, extend as SVGextend, Element, Svg } from '@svgdotjs/svg.js'
import Positional, { IPositional } from './vanilla/positional';
import Form from './Form';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';
import SVGForm from './form/SVGForm';
import { Visual } from './vanilla/visual';
import { UpdateObj } from './vanilla/util';
import { svgPulses } from './vanilla/default/data/svgPulse';
import SVGElement, { PositionalSVG } from './vanilla/svgElement';
import { defaultPositional } from './vanilla/default/data';
import RectElement, { PositionalRect } from './vanilla/rectElement';
import { simplePulses } from './vanilla/default/data/simplePulse';
import RectForm from './form/RectForm';
import ENGINE from './vanilla/engine';
import Channel from './vanilla/channel';

ENGINE.surface = SVG().attr({"pointer-events": 'bounding-box'});

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
  const [selectedPositionalData, setSelectedPositionalData] = useState<Positional<Visual> | undefined>(undefined);

  const canvas: ReactNode = <Canvas select={SelectElement} selectedElement={selectedElement}
                                    selectedElementPositional={selectedPositionalData}></Canvas>

  function SaveSVG() {
    throw new Error("Not implemented")
  }

  function SaveScript() {
    var script = ENGINE.handler.parser.script;

    var blob = new Blob([script], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "sequence.nmpd");
  }

  function SelectElement<T extends Visual>(element: T | undefined, positionalData?: Positional<T>) {
    if (element === undefined) {
      setSelectedElement(undefined);
      setSelectedPositionalData(undefined)
      setForm(null);
      return
    }

    setSelectedElement(element);
    setSelectedPositionalData(positionalData);

    if (positionalData === undefined) {
      throw new Error("Not implemented")
    }

    if (element instanceof SVGElement) {
        let scaffold: PositionalSVG = {...(svgPulses["180"] as any), ...defaultPositional}
        let data: PositionalSVG = Object.assign(element, {config: positionalData.config})
        // Use object.assign as spread operator does not include properties such as contentHeight
        // as they are found in the prototype.

        // React Hook Forms breaks if the class object is used as the default vals.
        // Therefore, this keeps only the properties concerned for ISVG
        var elementSVGData = UpdateObj(scaffold, data);
        // Currently "svgPulses[180]" is used simply to have an object with all data required for UpdateObj
        // to work. Every piece of data will be overriden.
        
        var channel: Channel = ENGINE.handler.sequence.channelsDic[positionalData.config.channelName]
        var newForm: ReactNode = <SVGForm 
                  handler={ENGINE.handler} 
                  values={(elementSVGData as PositionalSVG)} 
                  target={((element as any) as SVGElement)}
                  positionalData={positionalData as Positional<SVGElement> }
                  channel={channel}
                  reselect={SelectElement}></SVGForm>
      
        setForm(newForm);
    } 
    else if (element instanceof RectElement) {
      let scaffold: PositionalRect = {...(simplePulses["pulse180"] as any), ...defaultPositional}
      let data: PositionalRect = Object.assign(element, {config: positionalData.config})

      // var elementRectData: PositionalRect = {...positional.element, config: positional.config};
      var elementRectData = UpdateObj(scaffold, data);

      var channel: Channel = ENGINE.handler.sequence.channelsDic[positionalData.config.channelName]
      var newForm: ReactNode = <RectForm 
                handler={ENGINE.handler} 
                values={(elementRectData as PositionalRect)} 
                target={((element as any) as Positional<RectElement>)} 
                channel={channel}
                reselect={SelectElement}></RectForm>
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
          <div style={{height: "100%", position: "relative"}} >
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
