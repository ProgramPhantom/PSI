import * as defaultSeq from "./default/channel.json"
import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Temporal, { Orientation } from "./temporal";
import { LabelPosition } from "./label";
import Pulse90 from "./pulses/simple/pulse90";
import Pulse180 from "./pulses/simple/pulse180";
import SimplePulse, { simplePulseInterface } from "./pulses/simple/simplePulse";
import Channel from "./channel"
import ImagePulse from "./pulses/image/imagePulse";
import Aquire from "./pulses/image/aquire";
import Label from "./label";
import { json } from "stream/consumers";
import Arrow, { headStyle } from "./arrow";
import Span from "./span";
import GradientUp from "./pulses/image/gradientUp";
import Abstraction from "./abstraction";

enum SyntaxErrorType {
    INVALID_COMMAND_CHARACTER = "INVALID_CHANNEL_IDENTIFIER" ,
    INVALID_CHANNEL_IDENTIFIER = "INVALID_COMMAND_CHARACTER",
    INVALID_CHANNEL_COMMAND = "INVALID_CHANNEL_COMMAND",
    CHANNEL_IDENTIFIER_UNDEFINED = "CHANNEL_IDENTIFIER_UNDEFINED",
    TEX_TAG_NOT_CLOSED = "TEX_TAG_NOT_CLOSED",
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
        "GradientUp": GradientUp
    }
    static Span: {[name: string]: typeof Span} = {
        "Span": Span,
    }
    static Abstraction: {[name: string]: typeof Abstraction} = {
        "Abstraction": Abstraction
    }
    static ChannelCommands: string[] = [
        "sync"
    ]
    static AllCommands = Object.keys(Sequence.SimplePulseCommands).concat(
                                    ...Object.keys(Sequence.ImagePulseCommands),
                                    ...Object.keys(Sequence.Span),
                                    ...Object.keys(Sequence.Abstraction),
                                    ...Sequence.ChannelCommands);
                         

    nmrScript: string;
    surface: Svg;
    channels: {[name: string]: Channel;} = {};
    freeLabels: Label[] = [];

    errors: ScriptSyntaxError[];

    width: number;
    height: number;  // Excludes padding

    padding: number[];

    temporalSections: number[][] = [];
    maxTimespans: number[] = [];

    constructor(mnrScript: string, surface: Svg) {
        this.width = 0;
        this.height = 0;
        this.padding = [0, 0, 0, 0];

        this.nmrScript = mnrScript;
        this.surface = surface; 
        this.channels = {};  // Wierdest bug ever happening here

        this.errors = [];

        try {
            this.parseNMRScript();
        } catch (e) {
            console.log(e);
        }
        
    }
    

    draw(): {width: number, height: number} {
        var yCurs = 0;
        var dim = {width: 0, height: 0}

        Object.values(this.channels).forEach((channel) => {
            channel.draw(this.surface, this.maxTimespans, yCurs);
            yCurs = channel.bounds.bottom;
            
            this.height += channel.height;
            this.width += channel.width;
        })
        this.freeLabels.forEach((label) => {
            label.draw(this.surface);
        })

        return {width: 0, height: 0}
    } 

    parseNMRScript() {
        if (this.nmrScript === "") {return;}


        // Converts script into objects
        console.log("COMPILING SCRIPT");
        
        var lines: string[] = this.nmrScript.split("\n");

        for (let lineNum = 0; lineNum<lines.length; lineNum++) {
            var line = lines[lineNum];
            if (line === "") {continue;}
            this.errors = [];

            var commandType = line[0];

            line.replace(" ", "");

            switch (commandType) {
                case "":
                    this.errors.push(new ScriptSyntaxError(SyntaxErrorType.NULL_LINE, "Empty Line"));
                    break;
                case "/":
                    continue;
                case "$":
                    // var commandEval = this.parseCommand(line, lineNum);
                    var openTex = line.indexOf("$");
                    var closeTex = line.lastIndexOf("$");

                    if (openTex === closeTex) {
                        throw new ScriptSyntaxError(SyntaxErrorType.TEX_TAG_NOT_CLOSED,
                            "You must enclose LaTeX in $ on line " + lineNum);
                    }

                    var tex = line.substring(1, closeTex);
                    var config = line.substring(closeTex+1, line.length);

                    let args = this.parseCommand( "$" + config, lineNum)
                    args.arguments["text"] = tex;

                    console.log(args.arguments["text"]);

                    var newLab = Label.anyArgConstruct(args.arguments);
                    this.freeLabels.push(newLab);

                    break;
                case "~":
                    var commandEval = this.parseCommand(line, lineNum);
                    let jsonArgs = commandEval.arguments;

                    this.defineChannel(commandEval.commandBody, jsonArgs);


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
    }

    parseCommand(line: string, lineNum: number): {commandBody: string, arguments: any} {

        console.log(line);

        var openIndex = line.indexOf("(")  // Open
        if (openIndex == -1) {
            throw new ScriptSyntaxError(SyntaxErrorType.MISSING_BRACKETS, 
                    "Missing open bracket on line " + lineNum);
        }

        var body = line.substring(1, openIndex);
        if ((Sequence.specialCharacters.some(v => body.includes(v)))) {
            throw new ScriptSyntaxError(SyntaxErrorType.INVALID_CHANNEL_IDENTIFIER,
                            "Invalid character in command on line " + lineNum);
        }

        var closeIndex = line.indexOf(")")  // Close
        if (closeIndex == -1) {
            throw new ScriptSyntaxError(SyntaxErrorType.MISSING_BRACKETS, 
                    "Missing close bracket on line " + lineNum);
        }
        
        // Args
        var argumentString = line.substring(openIndex+1, closeIndex);
        var jsonArg = this.parseArgument(argumentString);

        return {commandBody: body, arguments: jsonArg}
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
        var jsonArg = this.parseArgument(argumentString);
        
        this.channelCommand(channelIdentifier, channelCommand, jsonArg);
    }

    parseArgument(argString: string) : any {
        if (argString !== "") {
            // So user does not need to write // for their tex
            argString = argString.replace("\\", "\\\\");
            

            try {
                var jsonArg = JSON.parse(argString);
            } catch (err) {
                throw new ScriptSyntaxError(SyntaxErrorType.ARGUMENT_ERROR,
                    "Argument error");
            }
        } else {
            var jsonArg = JSON.parse("{}");
        }

        return jsonArg;
    }
    
    defineChannel(name: string, args: any) {
        var newChannel = new Channel();

        newChannel.label = Label.anyArgConstruct(args);

        this.channels[name] = newChannel;
    }

    channelCommand(channelName: string, commandName: string, args: any) {
        var channel: Channel = this.channels[channelName];
        var currTimestamp = channel.temporalElements.length;

        var sections: number[] = [];

        // This can be better
        if (Object.keys(Sequence.SimplePulseCommands).includes(commandName)) {
            sections = channel.addSimplePulse(Sequence.SimplePulseCommands[commandName], args);
        } else if (Object.keys(Sequence.ImagePulseCommands).includes(commandName)) {
            sections = channel.addImagePulse(Sequence.ImagePulseCommands[commandName], args);
        } else if (Object.keys(Sequence.Span).includes(commandName)) {
            // THIS NEEDS MAKING BETTER
            sections = channel.addSpan(Sequence.Span[commandName], args, currTimestamp > this.maxTimespans.length ? 0 : this.maxTimespans[currTimestamp])
        } else if (Object.keys(Sequence.Abstraction).includes(commandName)) {
            sections = channel.addAbstraction(Sequence.Abstraction[commandName], args);
            
        } else if (Sequence.ChannelCommands.includes(commandName)) {
            this.syncChannels(channelName, args);
        }console.log(commandName);

        this.temporalSections.push(sections);
        console.log("Temporal Sections", this.temporalSections)
        this.computeTimespans();
        
    }

    syncChannels(reference: string, targets: any) {
        var referenceChan = this.channels[reference];
        var referenceCurs = referenceChan.elementCursor;

        if (!targets.targets) {
            // Sync all
            Object.keys(this.channels).forEach((val) => {
                if (val !== reference) {
                    this.channels[val].jumpTimespan(referenceCurs-1);
                }
            })
        }
    }

    computeTimespans() {
        var max: number[] = [];

        for (var channelIndex = 0; channelIndex < this.temporalSections.length; channelIndex++) {
            var currChannel = this.temporalSections[channelIndex];

            for (var i = 0; i < currChannel.length; i++) {
                if (i < max.length) { // If this isn't new territory
                    if (currChannel[i] > max[i]) {
                        max[i] = currChannel[i];
                    }
                } else {
                    max.push(currChannel[i]);
                }
            }
        }

        this.maxTimespans = max;
        console.log("MAX TIMESPANS");
        console.log(this.maxTimespans);
    }
}
