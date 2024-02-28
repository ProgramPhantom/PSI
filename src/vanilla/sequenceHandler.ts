import Abstraction from "./abstraction";
// import Aquire from "./default/classes/aquire";
// import ChirpHiLo from "./default/classes/chirpHiLo";
// import ChirpLoHi from "./default/classes/chirpLoHi";
// import HalfSine from "./default/classes/halfsine";
// import Pulse180 from "./default/classes/pulse180";
// import Pulse90 from "./default/classes/pulse90";
// import SaltireHiLo from "./default/classes/saltireHiLo";
// import SaltireLoHi from "./default/classes/saltireLoHi";
import ImagePulse from "./pulses/image/imagePulse";
import SimplePulse from "./pulses/simple/simplePulse";
import Sequence, { Line, ScriptSyntaxError } from "./sequence";
import Span from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Bracket from "./bracket";
import Label from "./label";
import Temporal, { temporalInterface } from "./temporal";
import { Drawable } from "./drawable";
import SVGPulse, {  } from "./pulses/image/svgPulse";
import Channel, { channelInterface } from "./channel";
import { UpdateObj } from "./util";

// ----- ERROR STUFF -----
enum SyntaxError {
    SYNTAX_ERROR = "SYNTAX_ERROR",
    TEX_TAG_NOT_CLOSED = "TEX_TAG_NOT_CLOSED",
    MISSING_BRACKETS = "MISSING_BRACKETS",
}
enum ArgumentError {
    UNKNOWN_ARGUMENT = "UNKNOWN_ARGUMENT",
    ARGUMENT_NOT_PROVIDED = "ARGUMENT_NOT_PROVIDED",
    ARGUMENT_INVALID_PARSE = "ARGUMNET_INVALID_TYPE"
}
enum CommandError {
    INVALID_COMMAND = "INVALID_COMMAND",
    INVALID_CHANNEL_IDENTIFIER = "INVALID_COMMAND_CHARACTER",
    INVALID_CHANNEL_COMMAND = "INVALID_CHANNEL_COMMAND",
    CHANNEL_IDENTIFIER_UNDEFINED = "CHANNEL_IDENTIFIER_UNDEFINED",
    INVALID_SPECIAL_COMMAND="INVALID_SPECIAL_COMMAND"
}
enum Warnings {
    EXPRESSION_NO_EFFECT = "EXPRESSION_NO_EFFECT",
    NULL_LINE="NULL_LINE",
}

type ErrorTypes = SyntaxError | ArgumentError | CommandError

export class ScriptIssue extends Error {
    errType: ErrorTypes;
    cause: any;
    lines: number[];
    columns: number[];

    constructor(errType: ErrorTypes, message: string, columns: number[], lines: number[], ) {
        super(message);
        this.errType = errType;
        this.lines = lines;
        this.columns = columns;
    }
}
// --------------------

enum TokenType {
    Channel="channel",
    ChannelCommand="channelcommand",
    Property="property",
    Argument="argument",
    SpecialCommandSpecifier="specialcommandspecifier",
    NewLine="newline",
    BinThis="binthis",
    RunCommand="runcommand"
}
interface ScriptToken {
    type: TokenType,
    content: string,
    columns: number[],
    line: number,
}

interface TrainsitionRule {input: string, newState: ParseState, tokenType?: TokenType, 
                           ignore?: boolean,
                           extraBehaviour?: {type: TokenType, content: string},};
enum ParseState {
    Start="start",
    Channel="channel",  
    SpecialChannelCommand="specialchannelcommand",
    Command="command",  
    NextParam="nextparam",  
    Paremeter="parameter",  
    SubParam="subparam",
    Argument="argument",
    List="list",
    String="string",

    Comment="comment",
    Error="error",

}
class StateDiagram {
    start: ParseState;
    currState: ParseState;
    transitionRules: {[id: string]: TrainsitionRule[]};

    selection: string;
    currCol: number;
    startCol: number;

    constructor(startType: ParseState, rules: {[id: string]: TrainsitionRule[]}) {
        this.start = startType;
        this.currState = startType;
        this.transitionRules = rules;

        this.selection = "";
        this.currCol = 1;
        this.startCol = 1;
    }

    input(c: string, thiscol: number, line: number): {newState: ParseState, token: ScriptToken | undefined, extraToken?: ScriptToken} {
        this.currCol = thiscol;
        var currRules = this.transitionRules[this.currState];
        var newState = this.currState;
        var token: ScriptToken | undefined;
        var extraToken: ScriptToken | undefined = undefined;

        

        for (const rule of currRules) {
            

            if (c.match(rule.input)) { 
                newState = rule.newState;

                if (rule.ignore === undefined) {
                    this.selection += c;
                    
                }

                if (rule.tokenType !== undefined) {
                    if (rule.tokenType === TokenType.BinThis) {
                        continue;
                    }

                    
                    token = {
                        type: rule.tokenType,
                        content: this.selection,
                        columns: [this.startCol, this.currCol],
                        line: line,
                    }

                    this.startCol = this.currCol+1;
                    this.selection = "";
                } 

                if (rule.extraBehaviour !== undefined) {
                    extraToken = {
                        type: rule.extraBehaviour.type,
                        content: rule.extraBehaviour.content,
                        columns: [this.startCol, this.currCol],
                        line: line
                    }

                    this.startCol = this.currCol+1;
                    this.selection = "";
                }
                break;  // Do first rule
            }
        }
        this.currState = newState;
        
        return {newState: newState, token: token, extraToken: extraToken};
    }
}


export default class SequenceHandler {
    // TODO: change this and make something for special commands
    static ContentCommands: {[name: string]: any} = {
        ...SVGPulse.defaults,
        ...SimplePulse.defaults,
        ...Abstraction.defaults,
        ...Span.defaults,
        ...Label.defaults,
        ...Bracket.defaults,
    }

    static ChannelUtil: {[character: string]: any} = {
        "@": Channel.default,
        ">": Channel.default,  // FIX ME!!
        "~": Channel.default,
        "|": Sequence.defaults["empty"].grid.lineStyle,
    }

    static specialCharacters: string[] = ["-", "#", "~", "`", ">", "=", "[(]", "[)]", "[+]", "[.]", "[*]", "[/]", "[}]", "[{]",
                                          ";", "[\\^]"]

    static specialCharacterRegex: string = SequenceHandler.specialCharacters.join("|");
    static util: string = "[" + Object.keys(SequenceHandler.ChannelUtil).join("]|[") + "]";
    static alphaNumericRegex: string = "^[a-zA-Z0-9_]*$";

    static characterError = {input: SequenceHandler.specialCharacters.join("|"), newState: ParseState.Error};

    static Transitions: {[id: string]: TrainsitionRule[]} = {
        "start": [{input: SequenceHandler.util, newState: ParseState.SpecialChannelCommand, tokenType: TokenType.SpecialCommandSpecifier},
                  SequenceHandler.characterError,
                  {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Channel}
        ],
        "channel": [{input: "[.]", newState: ParseState.Command, tokenType: TokenType.Channel, ignore: true},
                    SequenceHandler.characterError,
                    {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Channel},  // ANY
        ],
        "specialchannelcommand": [{input: "[(]", newState: ParseState.NextParam, tokenType: TokenType.Channel, ignore: true},
                                   SequenceHandler.characterError,
                                  {input: SequenceHandler.alphaNumericRegex, newState: ParseState.SpecialChannelCommand},  // ANY
                                   
        ],
        "command": [{input: SequenceHandler.alphaNumericRegex, newState: ParseState.Command},  // Command
                    {input: "[(]", newState: ParseState.NextParam, tokenType: TokenType.ChannelCommand, ignore: true},
                    SequenceHandler.characterError,
        ],
        "nextparam": [{input: "[)]", newState: ParseState.Start, extraBehaviour: {type: TokenType.RunCommand, content: ")"}, ignore: true},
                      SequenceHandler.characterError, // Next Param
                      {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter}
        ],
        "parameter": [{input: "[=]", newState: ParseState.Argument, tokenType: TokenType.Property, ignore: true},
                      {input: "[.]", newState: ParseState.SubParam, tokenType: TokenType.Property, ignore: true},
                      SequenceHandler.characterError,
                      {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter},
        ],
        "subparam": [SequenceHandler.characterError,
                     {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter}
        ],
        "argument": [{input: "[)]", newState: ParseState.Start, tokenType: TokenType.Argument, extraBehaviour: {type: TokenType.RunCommand, content: ")"}, ignore: true},
                     {input: "[,]", newState: ParseState.NextParam, tokenType: TokenType.Argument, ignore: true},
                     {input: "[[]", newState: ParseState.List, ignore: true},
                     {input: '["]', newState: ParseState.String, ignore: true},
                     SequenceHandler.characterError,
                     {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Argument}
        ],
        "list": [{input: "[\\]]", newState: ParseState.Argument, ignore: true},
                 {input: "[,]", newState: ParseState.List},
                 {input: SequenceHandler.alphaNumericRegex, newState: ParseState.List},
        ],
        "string": [{input: '["]', newState: ParseState.Argument, ignore: true},
                   {input: "[\\\\]", newState: ParseState.String},
                   {input: SequenceHandler.specialCharacterRegex, newState: ParseState.String },
                   {input: SequenceHandler.alphaNumericRegex, newState: ParseState.String},
        ]
    }

    static SequenceUtil: {[character: string]: any} = {
        
    }

    scriptFlags: ScriptIssue[] = [];
    script: string = "";

    tokenStream: ScriptToken[] = [];
    validSyntax: boolean=false;

    
    sequence: Sequence;
    surface: Svg;

    constructor(initialCode: string, surface: Svg) {
        this.sequence = new Sequence(surface, Sequence.defaults["empty"])
        this.surface = surface;

        try {
            this.parseScript(initialCode);
        } catch (e){
            console.log(e)
        }
        

        
    }

    parseScript(text: string) {
        this.script = text;

        // 1 ----- Tokenise script:
        this.tokenise();

        /*
        if (!this.validSyntax) {
            
        }*/

        
        if (this.tokenStream.length === 0) {
            return;
        }

        
        
        enum State {
            Start,
            Channel,
            SpecialCommand,
            Command,
            NextParam,
            ReadParam,
            Argument,

            CommandSpecifier,
        }

        var currState: State;
        currState = State.Start;

        var propList: {propTree: ScriptToken[], arg?: ScriptToken}[] = []; 
        var workingChannel: ScriptToken = {type: TokenType.Channel, content: "1h", columns: [1, 1], line: 1};
        var command: ScriptToken = {type: TokenType.ChannelCommand, content: "pulse90", columns: [2, 2], line: 1};

        function reset() {
            propList = []; 
            workingChannel = {type: TokenType.Channel, content: "1h", columns: [1, 1], line: 1};
            command = {type: TokenType.ChannelCommand, content: "pulse90", columns: [2, 2], line: 1};
        }

        for (const tok of this.tokenStream) {
            

            if (tok.type === TokenType.NewLine) {
                continue;
            }

            switch (currState) {
                case State.Start: 
                    switch (tok.type) {
                        case TokenType.Channel:
                            workingChannel = tok;
                            currState = State.Channel;
                            break;
                        case TokenType.SpecialCommandSpecifier:
                            command = tok;
                            
                            currState = State.SpecialCommand;
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                case State.Channel:
                    switch (tok.type) {
                        case TokenType.ChannelCommand:
                            currState = State.NextParam;
                            command = tok;
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                case State.SpecialCommand:
                    switch (tok.type) {
                        case TokenType.Channel:
                            workingChannel = tok;
                            currState = State.NextParam;
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                case State.NextParam:
                    switch (tok.type) {
                        case TokenType.Property:
                            currState = State.ReadParam;
                            propList.push({propTree: [tok]})
                            break;
                        case TokenType.RunCommand:
                            currState = State.Start;
                            this.runCommand(command, workingChannel, propList);
                            reset()
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                case State.ReadParam:
                    switch (tok.type) {
                        case TokenType.Property:
                            propList[propList.length-1].propTree.push(tok);
                            break;
                        case TokenType.Argument:
                            currState = State.Argument;
                            propList[propList.length-1].arg = tok;
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                case State.Argument:
                    switch (tok.type) {
                        case TokenType.Property:
                            currState = State.ReadParam;
                            propList.push({propTree: [tok]})
                            break;
                        case TokenType.RunCommand:
                            currState = State.Start;
                            this.runCommand(command, workingChannel, propList);
                            reset();
                            break;
                        default:
                            throw new Error("Invalid token order");
                    }
                    break;
                default:
                    
            }
        }

        if (this.tokenStream[this.tokenStream.length-1].type === TokenType.Argument) {
            this.runCommand(command, workingChannel, propList);
        }
        
        
        // this.runCommand(command, workingChannel, propList);
    }

    tokenise() {
        var charArray: string[] = this.script.split("");
        var tokens: ScriptToken[] = [];
  
        var stateSystem = new StateDiagram(ParseState.Start, SequenceHandler.Transitions);

        var c;
        var nextC;

        var columnStart = 1
        var columnNow = 1;
        var lineStart = 1;
        var lineNow = 1;
        for (let i = 0; i < charArray.length; i++) {
            c = charArray[i];
            columnNow+=1;

            if (c === " ") { lineNow += 1; continue; }
            if (c === "\n") { tokens.push({type: TokenType.NewLine, content: "\n", columns: [columnNow, columnNow], line: lineNow}); lineNow += 1; columnNow = 1;  }

            var result = stateSystem.input(c, columnNow, lineNow);

            

            if (result.newState === ParseState.Error) {
                throw new ScriptIssue(SyntaxError.SYNTAX_ERROR, "Syntax Error", [columnStart, columnNow], [lineStart, lineNow])
            }
            
            if (result.token) {
                columnStart = columnNow;
                lineStart = lineNow;

                tokens.push(result.token);
                
            }

            if (result.extraToken) {
                tokens.push(result.extraToken);
            }

        }

        if (stateSystem.currState === ParseState.Start) {
            this.validSyntax = true;
        } else {
            this.validSyntax = false;
        }


       
        this.tokenStream = tokens;
        
        
    }

    runCommand(command: ScriptToken, channel: ScriptToken, props: {propTree: ScriptToken[], arg?: ScriptToken}[]) {
        if (Object.keys(SequenceHandler.ChannelUtil).includes(command.content) ) {  // Its a util command
            var argTemplate: any = SequenceHandler.ChannelUtil[command.content];  
        } else if (Object.keys(SequenceHandler.ContentCommands).includes(command.content)) {  // Its a content command
            var argTemplate: any = SequenceHandler.ContentCommands[command.content];  
        } else {
            throw new ScriptIssue(CommandError.INVALID_COMMAND, `Undefined command: '${command.content}'`, command.columns, [command.line, command.line]);
        }

        console.log("runing command:", command, channel, props)
        
        var argObj: any = {};

        function setChild(val: ScriptToken, props: ScriptToken[], defs: any, exsisting: any): any {  // Created javascript obj from 
            let inner: any = exsisting;
            var thisProp = props[0];

            try {
                var defaultHere = defs[thisProp.content]; 
            } catch {
                throw new ScriptIssue(ArgumentError.UNKNOWN_ARGUMENT, `Unknown argument '${thisProp}'`, thisProp.columns, [thisProp.line, thisProp.line])
            }
            
            if (props.length > 1) {
                var tokenVal = thisProp.content;
                var furtherIn: {[name: string]: any} = {};
                
                furtherIn[tokenVal] = setChild(val, props.splice(1, props.length-1), defaultHere, 
                                               inner[thisProp.content] ?? {});
                
                Object.assign(inner, furtherIn);

            } else if (props.length === 1) {  // At the end of the prop chain
                if (Array.isArray(defaultHere)) {
                    try {
                        
                        var elements = val.content.split(",");
                        let elementsNum = elements.map(Number);
                        inner[thisProp.content] = elementsNum;
                    } catch {
                        throw new ScriptIssue(ArgumentError.ARGUMENT_INVALID_PARSE, 
                            `Cannot parse argument '${val.content}. Should be of type 'Array'`, val.columns, [val.line, val.line]);
                    }
                }
                else if (typeof defaultHere === "number") {
                    try {
                        inner[thisProp.content] = JSON.parse(val.content);
                    } catch {
                        throw new ScriptIssue(ArgumentError.ARGUMENT_INVALID_PARSE, 
                            `Cannot parse argument '${val.content}. Should be of type 'number'`, val.columns, [val.line, val.line]);
                    }
                    
                    
                } else if (typeof defaultHere === "boolean") {
                    try {
                        inner[thisProp.content] = JSON.parse(val.content);
                    } catch {
                        throw new ScriptIssue(ArgumentError.ARGUMENT_INVALID_PARSE, 
                                `Cannot parse argument '${val.content}. Should be of type 'boolean'`, val.columns, [val.line, val.line]);
                    }
                }
                else {
                    
                    
                    var temp = inner[thisProp.content]
                    Object.assign(inner, inner[thisProp.content]);
                    inner[thisProp.content] = val.content;
                }
            } else {
                return val;
            }
            return inner;
        }

        for (const p of props) {
            if (p.arg === undefined) {
                throw new ScriptIssue(ArgumentError.ARGUMENT_NOT_PROVIDED, "Argument not provided", p.propTree[p.propTree.length-1].columns, 
                                                                [p.propTree[p.propTree.length-1].line, p.propTree[p.propTree.length-1].line])
            }
            
            Object.assign(argObj, setChild(p.arg, p.propTree, argTemplate, argObj)) ;
        }

        const fullArgs = argObj ? UpdateObj(argTemplate, argObj) : argTemplate;

        switch (command.type) {
            case TokenType.ChannelCommand:
                this.channelCommand(command, channel, argObj);
                break;
            case TokenType.SpecialCommandSpecifier:
                this.utilCommand(command, channel, fullArgs);
                
                break;
            default:
                throw Error;
        }
    }

    channelCommand(command: ScriptToken, channel: ScriptToken, args: any) {
        var commandName = command.content;
        var channelName = channel.content;

        //if (Object.keys(SequenceHandler.ChannelCommands).indexOf(commandName) === -1) {  // Cannot find command
         //   throw new ScriptIssue(CommandError.INVALID_COMMAND, `Invalid command '${commandName}'`, command.columns, [command.line, command.line]);
        //}
        if (Object.keys(this.sequence.channels).indexOf(channelName) === -1) {
            throw new ScriptIssue(CommandError.CHANNEL_IDENTIFIER_UNDEFINED, `Undefined channel: '${channelName}'`, channel.columns, [channel.line, channel.line])
        }

        

        // I am not yet experienced enough in Typescript to find a better solution to this
        if (Object.keys(SVGPulse.defaults).includes(commandName)) {
            var svgDef = SVGPulse.defaults[commandName]; 
            this.sequence.addTemporal(channelName, SVGPulse.anyArgConstruct(svgDef, args))
            
        } else if (Object.keys(SimplePulse.defaults).includes(commandName)) {
            var simpDef = SimplePulse.defaults[commandName]; 
            this.sequence.addTemporal(channelName, SimplePulse.anyArgConstruct(simpDef, args))
        } else if (Object.keys(Abstraction.defaults).includes(commandName)) {
            var absDef = Abstraction.defaults[commandName];
            this.sequence.addTemporal(channelName, Abstraction.anyArgConstruct(absDef, args))
        } else if (Object.keys(Span.defaults).includes(commandName)) {
            var spanDef = Span.defaults[commandName];
            this.sequence.addTemporal(channelName, Span.anyArgConstruct(spanDef, args))
        } else if (Object.keys(Label.defaults).includes(commandName)) {
            var labelDef = Label.defaults[commandName];
            this.sequence.addLabel(channelName, Label.anyArgConstruct(labelDef, args))
        } else if (Object.keys(Bracket.defaults).includes(commandName)) {
            
            var brackDef = Bracket.defaults[commandName];
            this.sequence.addAnnotationLong(channelName, Bracket.anyArgConstruct(brackDef, args))
        }
        else {
            throw new ScriptIssue(CommandError.INVALID_COMMAND, `Undefined command: '${commandName}'`, command.columns, [command.line, command.line])
        }

        
    }

    utilCommand(command: ScriptToken, channel: ScriptToken, args: any) {
        switch (command.content) {
            case "~":
                this.sequence.defineChannel(channel.content, <channelInterface>args);
                break;
            case "|":
                this.sequence.addVLine(channel.content, <Line>args)
                break;
            case "@":
                this.sequence.syncOn(channel.content, undefined);
                break;
            case ">":
                this.sequence.syncNext(channel.content, undefined);
                break;
        }
    }

    draw() {
        this.sequence.draw();
    }
}