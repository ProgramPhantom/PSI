import { IArrow } from "./arrow"
import { IChannel } from "./channel"
import { IDiagram } from "./diagram"
import { ILabel } from "./label"
import { ILabellable } from "./labellable"
import { ILine } from "./line"
import { IRectElement } from "./rectElement"
import { ISequence } from "./sequence"
import { ISVGElement } from "./svgElement"
import { IText } from "./text"


const svgPath: string = "\\src\\assets\\"
var schemes: string[] = ["default"]



export interface IScheme {
    diagram: IDiagram,
    sequence: ISequence,
    channel: IChannel,

    svgElements: Record<string, ISVGElement>
    svgStrings: Record<string, string>;

    rectElements: Record<string, IRectElement>,
    labellableElements: Record<string, ILabellable>

    arrow: IArrow,
    line: ILine,
    text: IText,
}

export var svgElements: Record<string, ISVGElement> = {
    "180": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 0],
        "path": "\\src\\assets\\180.svg",
        "contentWidth": 50,
        "contentHeight": 50,
    
        "ref": "180",
        "style": {}
    },
    "acquire": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 0],
        "path": "\\src\\assets\\acquire2.svg",
        "contentWidth": 150,
        "contentHeight": 75,
        
        "ref": "acquire",
        "style": {}
    },
    "amp": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 1],
        "path": "\\src\\assets\\ampseries.svg",
        "contentWidth": 15,
        "contentHeight": 40,
    
        "ref": "amp",
        "style": {}
    },
    "chirphilo": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 1],
        "path": "\\src\\assets\\chirphilo.svg",
        "contentWidth": 50,
        "contentHeight": 20,
    
        "ref": "chirphilo",
        "style": {}
    },
    "chirplohi": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 1, 0, 1],
        "offset": [0, 1],
        "path": "\\src\\assets\\chirplohi.svg",
        "contentWidth": 50,
        "contentHeight": 20,
        
        "ref": "chirplohi",
        "style": {}
    },
    "halfsine": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 0],
        "path": "\\src\\assets\\halfsine.svg",
        
        "contentWidth": 15,
        "contentHeight": 20,
        
        "ref": "halfsine",
        "style": {}
    },
    "saltirehilo": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 1, 0, 1],
        "offset": [0, 1],
        "path": "\\src\\assets\\saltirehilo.svg",
        "contentWidth": 50,
        "contentHeight": 20,
        
        "ref": "saltirehilo",
        "style": {}
    },
    "saltirelohi": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 1, 0, 1],
        "offset": [0, 1],
        "path": "\\src\\assets\\saltirelohi.svg",
        "contentWidth": 50,
        "contentHeight": 20,
    
        "ref": "saltirelohi",
        "style": {}
    },
    "tall-trapezium": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 1],
        "path": "\\src\\assets\\talltrapezium.svg",
        "contentWidth": 15,
        "contentHeight": 25,
        
        "ref": "tall-trapezium",
        "style": {}
    },
    "trapezium": {
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "padding": [0, 0, 0, 0],
        "offset": [0, 1],
        "path": "\\src\\assets\\trapezium.svg",
        "contentWidth": 60,
        "contentHeight": 10,
        
        "ref": "trapezium",
        "style": {}
    }
}


const svgStrings: Record<string, string> = await loadDefaultSVGs()


export var rectElements: Record<string, IRectElement> = {
    "90-pulse": {
        "padding": [0, 4, 0, 4],
        "offset": [0, 0],
    
        "contentWidth": 7,
        "contentHeight": 50,
    
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "style": {
            "fill": "#000000",
            "stroke": "black",
            "strokeWidth": 0
        },
    
        "ref": "90-pulse"
    },
    "180-pulse": {
        "padding": [0, 4, 0, 4],
        "offset": [0, 0],
    
        "contentWidth": 10,
        "contentHeight": 40,
    
        "mountConfig": {
            "orientation": "top",
            "alignment": "centre",
            "noSections": 1,
            "channelID": null,
            "sequenceID": null,
            "index": 0,
            "mountOn": true
        },
    
        "style": {
            "fill": "#ffffff",
            "stroke": "black",
            "strokeWidth": 1
        },
    
        "ref": "180-pulse"
    }
}

export var schemeData: Record<string, IScheme> = {
    "default": {
        "diagram": {
            "ref": "diagram",
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],
            "sequences": []
        },
        "sequence": {
            "ref": "sequence",
            "padding": [5, 5, 5, 5],
            "offset": [0, 0],

            "channels": []
        },
        "channel": {
            "mountedElements": [],
            "padding": [0, 0, 0, 0], 
            "offset": [0, 0],
            "ref": "my-channel",
            "sequenceID": "",
        
            "style": {
                "thickness": 3,
                "barStyle": {
                    "fill": "#000000",
                    "stroke": null,
                    "strokeWidth": null
                }
            },
        
            "channelSymbol": {
                "text": "^{1}\\mathrm{H}",
                "offset": [0, 0],
                "padding": [0, 0, 0, 0],
                "ref": "channel-label",

                "style": {
                    "fontSize": 20,
                    "colour": "black",
                    "background": null,
                    "display": "none"
                }

            }
        },

        "svgElements": svgElements,
        "svgStrings": svgStrings,
        "rectElements": rectElements,
        "labellableElements": {},

        "arrow": {
            "ref": "arrow",
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],
            
            "adjustment": [0, 0],
            "orientation": "horizontal",

            "arrowStyle": {
                "headStyle": "default"
            },
        
            "style": {
                "stroke": "black",
                "thickness": 1,
                "dashing": [0, 0]
            }
        },
        "line": {
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],
            "adjustment": [0, 0],
            "ref": "line",
            "orientation": "angled",
        
            "style": {
                "stroke": "black",
                "thickness": 1,
                "dashing": [7, 7]
            }
        },
        "text": {
            "ref": "text",
        
            "text": "\\textrm{H}",
            "padding": [0, 0, 2, 0],
            "offset": [0, 0],
        
            
            "style": {
                "fontSize": 15,
                "colour": "black",
                "background": null,
                "display": "block"
            }
        }
    }
}


async function loadDefaultSVGs(): Promise<Record<string, string>> {

    const svgStrings: Record<string, string> = {};
    for (const p of Object.keys(svgElements)) {
        var svg = await fetch(svgPath + p + ".svg").then(
            (response) => response.text()
        ).then(
            (response) => {return response}
        ).catch(
            (error) => {console.error(`Cannot find svg for element ${p}`)}
        )

        if (svg) {
            svgStrings[p] = svg;
        }
        
    }

    return svgStrings;
}