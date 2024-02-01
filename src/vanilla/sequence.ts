import * as defaultSeq from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import Channel from "./channel"
import ImagePulse from "./pulses/image/imagePulse";
import Aquire from "./pulses/image/aquire";

enum SyntaxErrorType {
    INVALID_COMMAND_CHARACTER = "INVALID_CHANNEL_IDENTIFIER" ,
    INVALID_CHANNEL_IDENTIFIER = "INVALID_COMMAND_CHARACTER",
    INVALID_CHANNEL_COMMAND = "INVALID_CHANNEL_COMMAND",
    CHANNEL_IDENTIFIER_UNDEFINED = "CHANNEL_IDENTIFIER_UNDEFINED",
    MISSING_BRACKETS = "MISSING_BRACKETS",
    ARGUMENT_ERROR = "ARGUMENT_ERROR",
    EXPRESSION_NO_EFFECT = "EXPRESSION_NO_EFFECT",
    NULL_LINE="NULL_LINE",
}


export class ScriptSyntaxError extends Error {
    errType: SyntaxErrorType;
    cause: any;

    constructor(errType: SyntaxErrorType, message: string, cause?: any) {
        super(message);
        this.errType = errType;
        this.cause = cause;
    }
}


export default class Sequence {
    static specialCharacters: string[] = ["#", "~", "/", ">"]
    static SimplePulseCommands: {[name: string]: typeof SimplePulse;} = {
        "Pulse90": Pulse90,
        "Pulse180": Pulse180,
    }
    static ImagePulseCommands: {[name: string]: typeof ImagePulse;} = {
        "Aquire": Aquire,
    }
    static AllCommands = Object.keys(Sequence.SimplePulseCommands).concat(
                                     ...Object.keys(Sequence.ImagePulseCommands));
                         

    nmrScript: string;
    surface: Svg;
    channels: {[name: string]: Channel;} = {};  
    errors: ScriptSyntaxError[];

    width: number;
    height: number;  // Excludes padding

    padding: number[];

    constructor(mnrScript: string, surface: Svg) {
        this.width = 0;
        this.height = 0;
        this.padding = [0, 0, 0, 0];

        this.nmrScript = mnrScript;
        this.surface = surface; 
        this.channels = {};  // Wierdest bug ever happening here

        
        console.log("HERE" );
        this.errors = [];

        try {
            this.parseNMRScript();
        } catch (e) {
            console.log(e);
        }
        
    }
    

    draw() {
        var yCurs = 0;

        Object.values(this.channels).forEach((channel) => {
            channel.draw(this.surface, yCurs);
            yCurs = channel.bottomBound;
        })
    } 

    parseNMRScript() {
        if (this.nmrScript === "") {return;}


        // Converts script into objects
        console.log("COMPILING SCRIPT");
        
        var lines: string[] = this.nmrScript.split("\n");

        for (let lineNum = 0; lineNum<lines.length; lineNum++) {
            var line = lines[lineNum];
            if (line === "\n") {continue;}
            this.errors = [];

            var commandType = line[0];

            line.replace(" ", "");

            switch (commandType) {
                case "":
                    this.errors.push(new ScriptSyntaxError(SyntaxErrorType.NULL_LINE, "Empty Line"));
                    break;
                case "/":
                    continue;
                case "~":
                    // Create Channel
                    var openIndex = line.indexOf("(")
                    if (openIndex == -1) {
                        throw new ScriptSyntaxError(SyntaxErrorType.MISSING_BRACKETS, 
                                "Missing brackets on line " + lineNum);
                    }

                    var channelIdentifier = line.substring(1, openIndex);
                    if ((Sequence.specialCharacters.some(v => channelIdentifier.includes(v)))) {
                        throw new ScriptSyntaxError(SyntaxErrorType.INVALID_CHANNEL_IDENTIFIER,
                                        "Invalid character in channel identifier");
                    }

                    var closeIndex = line.indexOf(")")
                    if (closeIndex == -1) {
                        throw new ScriptSyntaxError(SyntaxErrorType.MISSING_BRACKETS, 
                                "Missing brackets on line " + lineNum);

                    }
                    
                    // Channel arguments: 
                    var argumentString = line.substring(openIndex+1, closeIndex);
                    console.log(channelIdentifier);
                    
                    this.defineChannel(channelIdentifier);
                    console.log(this.channels);
                    break;  

                default:
                    try {
                        this.parseDefaultLine(line, lineNum);
                    } catch (e) {
                        // do stuff innit
                        throw e;
                    }
                        
                
                    break;

            }
        }

        console.log("ERRORS: " + this.errors.toString());
    }

    parseDefaultLine(line: string, lineNum: number) {
        var dotIndex = line.indexOf(".");
        var openIndex = line.indexOf("(");
        var closeIndex = line.indexOf(")");
        if (dotIndex === -1) {
            throw new ScriptSyntaxError(SyntaxErrorType.EXPRESSION_NO_EFFECT, 
                        "Expression has no effect");  
        }
        if (openIndex == -1 || closeIndex == -1) {
            throw new ScriptSyntaxError(SyntaxErrorType.MISSING_BRACKETS, 
                "Missing brackets on line " + lineNum);
        }

        var channelIdentifier = line.substring(0, dotIndex);
        if (!(Object.keys(this.channels).includes(channelIdentifier))) {
             throw new ScriptSyntaxError(SyntaxErrorType.CHANNEL_IDENTIFIER_UNDEFINED,
                            "Unknown channel " + channelIdentifier);
        }
        
        var channelCommand = line.substring(dotIndex+1, openIndex);
        if (!(Sequence.AllCommands.includes(channelCommand))) {
            throw new ScriptSyntaxError(SyntaxErrorType.INVALID_CHANNEL_COMMAND,
                            "Unknown channel command '" + channelCommand + "'");
 
        }

        var argumentString = line.substring(openIndex+1, closeIndex);
        if (argumentString !== "") {
            try {
                var jsonArg = JSON.parse(argumentString);
            } catch (err) {
                throw new ScriptSyntaxError(SyntaxErrorType.ARGUMENT_ERROR,
                    "Argument error");
            }
        } else {
            var jsonArg = JSON.parse("{}");
        }
        
        this.addPulse(channelIdentifier, channelCommand, jsonArg);

    }
    
    defineChannel(name: string) {
        var newChannel = new Channel();

        this.channels[name] = newChannel;
    }

    addPulse(channelName: string, elementName: string, args: any) {
        var channel: Channel = this.channels[channelName];



        // If adding a simple pulse
        if (Object.keys(Sequence.SimplePulseCommands).includes(elementName)) {
            channel.addSimplePulse(Sequence.SimplePulseCommands[elementName], args);
        } else if (Object.keys(Sequence.ImagePulseCommands).includes(elementName)) {
            channel.addImagePulse(Sequence.ImagePulseCommands[elementName], args);
        }
        
    }
}
