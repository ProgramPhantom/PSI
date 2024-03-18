import Abstract from "./abstract";
import ImagePulse from "./pulses/image/imagePulse";
import SimplePulse from "./pulses/simple/simplePulse";
import Sequence, { Line } from "./sequence";
import Span from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Bracket, { Direction, bracketInterface } from "./bracket";
import Label from "./label";
import Temporal, { temporalInterface } from "./temporal";
import { Drawable } from "./drawable";
import SVGPulse, {  } from "./pulses/image/svgPulse";
import Channel, { channelInterface } from "./channel";
import { UpdateObj } from "./util";
import Section from "./section";
import { Script } from "vm";

// ----- ERROR STUFF -----
enum SyntaxError {
    SYNTAX_ERROR = "SYNTAX_ERROR",
    TEX_TAG_NOT_CLOSED = "TEX_TAG_NOT_CLOSED",
    MISSING_BRACKETS = "MISSING_BRACKETS",
}
enum ArgumentError {
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    ARGUMENT_NOT_PROVIDED = "ARGUMENT_NOT_PROVIDED",
    ARGUMENT_INVALID_PARSE = "ARGUMNET_INVALID_TYPE"
}
enum CommandError {
    INVALID_COMMAND = "INVALID_COMMAND",
    INVALID_CHANNEL_IDENTIFIER = "INVALID_COMMAND_CHARACTER",
    INVALID_CHANNEL_COMMAND = "INVALID_CHANNEL_COMMAND",
    CHANNEL_IDENTIFIER_UNDEFINED = "CHANNEL_IDENTIFIER_UNDEFINED",
    INVALID_SPECIAL_COMMAND="INVALID_SPECIAL_COMMAND",
    INVALID_SUBJECT_OR_SYMBOL="INVALID_COMMAND_SUBJECT",
    INVALID_PARAMETER="INVALID_PARAMETER"
}
enum Warnings {
    EXPRESSION_NO_EFFECT = "EXPRESSION_NO_EFFECT",
    NULL_LINE="NULL_LINE",
}

type ErrorTypes = SyntaxError | ArgumentError | CommandError

export class ScriptError extends Error {
    errType: ErrorTypes;
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
    RunCommand="runcommand",
    Unresolved="unresolved",
    End="end"
}
interface ScriptToken {
    type: TokenType,
    content: string,
    columns: number[],
    line: number,
    index: number[]
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
    line: number;

    endIndex: number = 0;
    startIndex: number = 1;

    constructor(startType: ParseState, rules: {[id: string]: TrainsitionRule[]}) {
        this.start = startType;
        this.currState = startType;
        this.transitionRules = rules;

        this.selection = "";

        this.currCol =  0;
        this.startCol = 1;
        this.line = 1;
    }

    input(c: string): {newState: ParseState, token?: ScriptToken, extraToken?: ScriptToken} {
        var currRules = this.transitionRules[this.currState];
        var newState = this.currState;
        var token: ScriptToken | undefined;
        var extraToken: ScriptToken | undefined = undefined;
        
        
        if (c === "\n") { this.line += 1; this.currCol = 0, this.startCol = 1;
                          return {token: {type: TokenType.NewLine, content: "\n", columns: [this.currCol+1, this.currCol+1], line: this.line, 
                                  index: [this.startIndex, this.endIndex]},
                                  newState: this.currState}; }
        
        this.currCol += 1;
        this.endIndex += 1;
        if (c === " ") { return {newState: this.currState}; }

        var ignored = false;
        for (const rule of currRules) {
            if (c.match(rule.input)) { 
                newState = rule.newState;

                if (rule.ignore === undefined) {
                    this.selection += c;
                } else {
                    ignored = true;
                }
 
                if (rule.tokenType !== undefined) {
                    if (rule.tokenType === TokenType.BinThis) {
                        continue;
                    }


                    token = {
                        type: rule.tokenType,
                        content: this.selection,
                        columns: [this.startCol, ignored ? this.currCol - 1 : this.currCol],
                        line: this.line,
                        index: [this.startIndex, ignored ? this.endIndex - 1 : this.endIndex,]
                    }

                    this.startCol = this.currCol + 1;
                    this.startIndex = this.endIndex + 1;
                    this.selection = "";
                } 

                if (rule.extraBehaviour !== undefined) {
                    extraToken = {
                        type: rule.extraBehaviour.type,
                        content: rule.extraBehaviour.content,
                        columns: [this.startCol, this.currCol],
                        line: this.line,
                        index: [this.startIndex, this.endIndex]
                    }

                    this.startCol = this.currCol+1;
                    this.selection = "";
                }

                break;  // Do first rule
            }
        }
        this.currState = newState;
        

        if (this.currState === ParseState.Error) {
            this.currState = ParseState.Start;
            throw new ScriptError(SyntaxError.SYNTAX_ERROR, `Syntax Error: Unexpected symbol '${c}'`, [this.startCol, this.currCol], [this.line, this.line])
        }
        
        return {newState: newState, token: token, extraToken: extraToken};
    }
}

type PropTree = {props: ScriptToken[], arg?: ScriptToken}
type CommandType = {operation: ScriptToken, workingChannel: ScriptToken, propList: PropTree[]}
class Command {

    operation: ScriptToken;
    workingChannel: ScriptToken;
    propList: PropTree[];

    runCommandTrigger: ScriptToken;

    tokens: ScriptToken[];

    executed: boolean=false;

    startIndex: number;
    endIndex: number;

    constructor(command: CommandType, runCommand: ScriptToken, executed: boolean) {
        this.operation = command.operation;
        this.workingChannel = command.workingChannel;
        this.propList = command.propList;
        this.runCommandTrigger = runCommand;

        this.tokens = command.operation.type === TokenType.SpecialCommandSpecifier ? [command.operation, command.workingChannel] : [command.workingChannel, command.operation]
        command.propList.forEach((pt) => {
            pt.props.forEach((prop) => {
                this.tokens.push(prop)
            })
            pt.arg ? this.tokens.push(pt.arg) : null;
        })
        this.tokens.push(runCommand)

        this.executed = executed;

        this.startIndex = this.tokens[0].index[0];
        this.endIndex = this.tokens[this.tokens.length-1].index[1];
    }
}


export default class SequenceHandler {
    // TODO: change this and make something for special commands
    static ContentCommands: {[name: string]: any} = {
        ...SVGPulse.defaults,
        ...SimplePulse.defaults,
        ...Abstract.defaults,
        ...Span.defaults,
        ...Label.defaults,
        ...Section.defaults,
    }

    static ChannelUtil: {[character: string]: any} = {
        "@": Channel.default,
        ">": Channel.default,  // FIX ME!!
        "~": Channel.default,
        "|": Sequence.defaults["empty"].grid.lineStyle,
        "[": Sequence.defaults["empty"].bracket,
        "]": Sequence.defaults["empty"].bracket,
    }

    static specialCharacters: string[] = ["-", "#", "~", "`", ">", "=", "[(]", "[)]", "[+]", "[.]", "[*]", "[/]", "[}]", "[{]",
                                          ";", "[\\^]", "[,]", "[\\[]", "[\\]]", "[\\\\]", "[?]"]

    static specialCharacterRegex: string = SequenceHandler.specialCharacters.join("|");
    static util: string = "[" + Object.keys(SequenceHandler.ChannelUtil).join("]|[\\") + "]";
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
        "nextparam": [{input: "[)]", newState: ParseState.Start, tokenType: TokenType.RunCommand},
                      SequenceHandler.characterError, // Next Param
                      {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter}
        ],
        "parameter": [{input: "[=]", newState: ParseState.Argument, tokenType: TokenType.Property, ignore: true},
                      {input: "[.]", newState: ParseState.SubParam, tokenType: TokenType.Property, ignore: true},
                      {input: "[)]", newState: ParseState.Start, tokenType: TokenType.Property, extraBehaviour: {type: TokenType.RunCommand, content: ")"}},
                      SequenceHandler.characterError,
                      {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter},
        ],
        "subparam": [SequenceHandler.characterError,
                     {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Paremeter}
        ],
        "argument": [{input: "[)]", newState: ParseState.Start, tokenType: TokenType.Argument, extraBehaviour: {type: TokenType.RunCommand, content: ")"}, ignore: true},
                     {input: "[,]", newState: ParseState.NextParam, tokenType: TokenType.Argument, ignore: true},
                     {input: "[[]", newState: ParseState.List},
                     {input: '["]', newState: ParseState.String, ignore: true},
                     SequenceHandler.characterError,
                     {input: SequenceHandler.alphaNumericRegex, newState: ParseState.Argument}
        ],
        "list": [{input: "[\\]]", newState: ParseState.Argument},
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

    scriptFlags: ScriptError[] = [];
    script: string = "";

    tokenStream: ScriptToken[] = [];

    commands: {[line: number]: Command[]} = {};
    parseErrors: number[] = []; // Stores line number of lines with errors
    runErrors: number[] = []; // Stores line number of lines with errors

    commandSegments: number[][] = [];

    sequence: Sequence;
    stateSystem: StateDiagram;

    constructor(initialCode: string) {
        
        this.sequence = new Sequence(Sequence.defaults["empty"])
        this.script = initialCode;

        this.stateSystem = new StateDiagram(ParseState.Start, SequenceHandler.Transitions);
    }

    parseScript(text: string) {
        var newLines: string[] = text.split("\n");
        var changeOrInvalid = this.findDelta(text);

        this.parseErrors.forEach((err) => {
            changeOrInvalid[err] = true;
        })
        this.runErrors.forEach((err) => {
            changeOrInvalid[err] = true;
        })

        this.script = text;
        changeOrInvalid.forEach((change, i) => {
            if (change) {
                try {
                    var tokens = this.tokenise(newLines[i])
                } catch (e) {
                    if (this.parseErrors.indexOf(i) === -1) {this.parseErrors.push(i)}
                    throw e;
                }
                
                try {
                    var commands = this.createCommands(tokens);
                } catch (e) {
                    if (this.parseErrors.indexOf(i) === -1) {this.parseErrors.push(i);}
                    throw e
                }
                
                if (this.parseErrors.indexOf(i) === -1) {
                    this.parseErrors.splice(this.parseErrors.indexOf(i), 1)
                }
                    
                this.commands[i + 1] = commands;
            }
        })

        // !changeOrInvalid.every(c => c === false)
        if (true) {  // Some change
            // READDING ELEMENTS
            // this.sequence.reset();
            this.sequence = new Sequence(Sequence.defaults["empty"]);

            

            Object.values(this.commands).forEach((commands, i) => {
                commands.forEach((command) => {
                    try {
                        this.runCommand(command.operation, command.workingChannel, command.propList);

                        if (this.runErrors.indexOf(i) !== -1) {
                            this.runErrors.splice(this.runErrors.indexOf(i), 1)
                        }
                        
                    } catch (e) {
    
                        if (this.runErrors.indexOf(i) === -1) {
                            this.runErrors.push(i);
                        }
                        throw e;
                    }
                    
                })
            })
        }

        console.log(this.commands)
        // Split induvidua characters into tokens containing information at a higher level of abstraction
    
    }

    createCommands(tokens: ScriptToken[]): Command[] {
        var commands: Command[] = [];

        if (tokens.length === 0) {
            return [];
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

        var propList: PropTree[] = []; 
        
        var workingChannel: ScriptToken = {type: TokenType.Channel, content: "1h", columns: [1, 1], line: 1, index: [0, 0]};
        var operation: ScriptToken = {type: TokenType.ChannelCommand, content: "pulse90", columns: [2, 2], line: 1, index: [0, 0]};

        function reset() {
            propList = []; 
            workingChannel = {type: TokenType.Channel, content: "1h", columns: [1, 1], line: 1, index: [0, 0]};
            operation = {type: TokenType.ChannelCommand, content: "pulse90", columns: [2, 2], line: 1, index: [0, 0]};
        }

        // Manual state machine to allow for exceptions
        for (const tok of tokens) {
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
                            operation = tok;
                            
                            currState = State.SpecialCommand;
                            break;
                        case TokenType.End:
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'Channel' or 'SpecialCommandSpecifier' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
                case State.Channel:
                    switch (tok.type) {
                        case TokenType.ChannelCommand:
                            currState = State.NextParam;
                            operation = tok;
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'ChannelCommand' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
                case State.SpecialCommand:
                    switch (tok.type) {
                        case TokenType.Channel:
                            workingChannel = tok;
                            currState = State.NextParam;
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'ChannelIdentifer' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
                case State.NextParam:
                    switch (tok.type) {
                        case TokenType.Property:
                            currState = State.ReadParam;
                            propList.push({props: [tok]})
                            break;
                        case TokenType.RunCommand:
                            currState = State.Start;
                            commands.push(new Command({operation: operation, workingChannel: workingChannel, propList: propList}, tok, false))
                            reset()
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'Property' or 'RunCommand' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
                case State.ReadParam:
                    switch (tok.type) {
                        case TokenType.Property:
                            propList[propList.length-1].props.push(tok);
                            break;
                        case TokenType.Argument:
                            currState = State.Argument;
                            propList[propList.length-1].arg = tok;
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'Property' or 'Argument' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
                case State.Argument:
                    switch (tok.type) {
                        case TokenType.Property:
                            currState = State.ReadParam;
                            propList.push({props: [tok]})
                            break;
                        case TokenType.RunCommand:
                            currState = State.Start;
                            commands.push(new Command({operation: operation, workingChannel: workingChannel, propList: propList}, 
                                                            tok, false))
                            reset();
                            break;
                        case TokenType.End:
                            
                            break;
                        default:
                            throw new ScriptError(SyntaxError.SYNTAX_ERROR, 
                                `Expected token 'Property' or 'RunCommand' here, not token '${tok.type}' with content '${tok.content}'`, 
                                tok.columns, [tok.line])
                    }
                    break;
            }
        }

        
        return commands;
    }

    tokenise(text: string): ScriptToken[] {
        if (!text) {
            return [];
        }

        var charArray: string[] = text.split("");
        var tokens: ScriptToken[] = [];
  
        this.stateSystem = new StateDiagram(ParseState.Start, SequenceHandler.Transitions);

        var c;

        for (let i = 0; i < charArray.length; i++) {
            c = charArray[i]

            var result = this.stateSystem.input(c);

            if (result.token) {
                tokens.push(result.token);
            }

            if (result.extraToken) {
                tokens.push(result.extraToken);
            }
        }

        if (this.stateSystem.currState !== ParseState.Start) {
            tokens.push({content: this.stateSystem.selection, type: TokenType.Unresolved, line: this.stateSystem.line, 
                         columns: [this.stateSystem.startCol, this.stateSystem.currCol], 
                         index: [this.stateSystem.startIndex, this.stateSystem.endIndex]})

            throw new ScriptError(SyntaxError.MISSING_BRACKETS, "Expected close bracket", [this.stateSystem.startCol, this.stateSystem.currCol], 
                                    [this.stateSystem.line])
        }

        
        return tokens;
    }

    runCommand(operation: ScriptToken, channel: ScriptToken, props: PropTree[]) {

        if (Object.keys(SequenceHandler.ChannelUtil).includes(operation.content) ) {  // Its a util command
            var argTemplate: any = SequenceHandler.ChannelUtil[operation.content];  
        } else if (Object.keys(SequenceHandler.ContentCommands).includes(operation.content)) {  // Its a content command
            var argTemplate: any = SequenceHandler.ContentCommands[operation.content];  
        } else {
            throw new ScriptError(CommandError.INVALID_COMMAND, `Undefined command: '${operation.content}'`, operation.columns, [operation.line, operation.line]);
        }

        
        
        var argObj: any = {};

        function setChild(val: ScriptToken, props: ScriptToken[], defs: any, exsisting: any): any {  // Created javascript obj from 
            let inner: any = exsisting;
            var thisProp = props[0];

            try {
                var defaultHere = defs[thisProp.content]; 
            } catch {
                throw new ScriptError(ArgumentError.INVALID_ARGUMENT, `Unknown argument '${thisProp}'`, thisProp.columns, [thisProp.line, thisProp.line])
            }
            
            if (props.length > 1) {  // Not reached the end yet
                var tokenVal = thisProp.content;
                var furtherIn: {[name: string]: any} = {};

                                                    // REFERENCE TYPE FUCKING EVERYTHING AGAIN
                furtherIn[tokenVal] = setChild(val, props.splice(1, props.length-1), defaultHere, 
                                               inner[thisProp.content] ?? {});
                
                Object.assign(inner, furtherIn);

            } else if (props.length === 1) {  // At the end of the prop chain
                
                try {
                    
                    inner[thisProp.content] = JSON.parse(val.content);
                } catch {
                    //if (val.content.match(SequenceHandler.alphaNumericRegex)) {
                    var temp = inner[thisProp.content]
                    Object.assign(inner, inner[thisProp.content]);
                    inner[thisProp.content] = val.content;
                    //} else {
                    //    throw new ScriptIssue(ArgumentError.ARGUMENT_INVALID_PARSE, `Cannot parse argument line: ${val.line}, column: ${val.columns[0]}`, 
                    //    val.columns, [val.line, val.line])
                    //}
                    
                }
            } else {
                return val;
            }
            return inner;
        }


        for (const p of props) {
            if (p.arg === undefined) {
                throw new ScriptError(ArgumentError.ARGUMENT_NOT_PROVIDED, "Argument not provided", p.props[p.props.length-1].columns, 
                                                                [p.props[p.props.length-1].line, p.props[p.props.length-1].line])
            }
            // Argument to be set, list of props, 
            
            Object.assign(argObj, setChild(p.arg, [...p.props], argTemplate, argObj)) ;
            
        }

        const fullArgs = argObj ? UpdateObj(argTemplate, argObj) : argTemplate;

        switch (operation.type) {
            case TokenType.ChannelCommand:
                this.channelCommand(operation, channel, argObj);
                break;
            case TokenType.SpecialCommandSpecifier:
                this.utilCommand(operation, channel, fullArgs);
                
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
            throw new ScriptError(CommandError.CHANNEL_IDENTIFIER_UNDEFINED, `Undefined channel: '${channelName}'`, channel.columns, [channel.line, channel.line])
        }

        

        // I am not yet experienced enough in Typescript to find a better solution to this
        if (Object.keys(SVGPulse.defaults).includes(commandName)) {
            var svgDef = SVGPulse.defaults[commandName]; 
            this.sequence.addTemporal(channelName, SVGPulse.anyArgConstruct(svgDef, args))
            
        } else if (Object.keys(SimplePulse.defaults).includes(commandName)) {
            var simpDef = SimplePulse.defaults[commandName]; 
            this.sequence.addTemporal(channelName, SimplePulse.anyArgConstruct(simpDef, args))
        } else if (Object.keys(Abstract.defaults).includes(commandName)) {
            var absDef = Abstract.defaults[commandName];
            this.sequence.addTemporal(channelName, Abstract.anyArgConstruct(absDef, args))
        } else if (Object.keys(Span.defaults).includes(commandName)) {
            var spanDef = Span.defaults[commandName];
            this.sequence.addTemporal(channelName, Span.anyArgConstruct(spanDef, args))
        } else if (Object.keys(Label.defaults).includes(commandName)) {
            var labelDef = Label.defaults[commandName];
            this.sequence.addLabel(channelName, Label.anyArgConstruct(labelDef, args))
        } else if (Object.keys(Section.defaults).includes(commandName)) {
            
            var secDef = Section.defaults[commandName];
            this.sequence.addAnnotationLong(channelName, Section.anyArgConstruct(secDef, args))
        }
        else {
            throw new ScriptError(CommandError.INVALID_COMMAND, `Undefined command: '${commandName}'`, command.columns, [command.line, command.line])
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
            case "[":
                this.sequence.addBracket(channel.content, Bracket.anyArgConstruct(Sequence.defaults["empty"].bracket, <bracketInterface>args), Direction.right)
                break;
            case "]":
                this.sequence.addBracket(channel.content, Bracket.anyArgConstruct(Sequence.defaults["empty"].bracket, <bracketInterface>args), Direction.left)
                break;
        }
    }

    findDelta(text: string): boolean[] {
        var newLines: string[] = text.split("\n");
        var oldLines: string[] = this.script.split("\n"); // .filter(s => {return s !== ""})

        if (newLines.length > oldLines.length) {
            oldLines = oldLines.concat(Array<string>(newLines.length - oldLines.length).fill(""));
        } else {
            newLines = newLines.concat(Array<string>(oldLines.length - newLines.length).fill(""));
        }

        var lineChanges = Array<boolean>(oldLines.length).fill(false);

                // Any change:
        var noWhiteText = text.replace("\n", "").replace(" ", "");
        var noWhiteScript = this.script.replace("\n", "").replace(" ", "");
        if (noWhiteScript === noWhiteText) {
            return lineChanges;
        }

        // if (newLines.length > oldLines.length) {
        //     newLines = Array<string>(oldLines.length)
        // }
        
        var existingLine;
        newLines.forEach((newLine, i) => {
            existingLine = oldLines[i];
            

            
            if (newLine != existingLine) {
                lineChanges[i] = true;
            }
            
            
        })

        return lineChanges;
    }

    draw(surface: Svg) {
        this.sequence.draw(surface);
    }
}