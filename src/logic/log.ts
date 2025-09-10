import Point from "./point"
import Spacial from "./spacial"

export enum Levels {
    INFO="INFO",
    PERFORMANCE="PERFORMANCE",
    OPERATION="OPERATION",
    PROCESS_START="PROCESS_START",
    PROCESS_END="PROCESS_END"
}

export enum Operations {
    NONE="NONE",
    MOV="MOV",
    SETX="SETX",
    SETY="SETY",
    SETWIDTH="SETWIDTH",
    SETHEIGHT="SETHEIGHT",
    ADD="ADD",
    DELETE="DELETE",
    MODIFY="MODIFY",
    BIND="BIND",
    BROADCAST="BROADCAST"
}

export enum Processes {
    COMPUTE_BOUNDARY="COMPUTE_BOUNDARY",
    INSTANTIATE="INSTANTIATE"
}

interface SimpleLog {
    level: Levels,
    message: string
}

interface OperationLog extends SimpleLog {
    operation: Operations,
    caller?: Point
}

interface ProcessLog extends SimpleLog {
    process: Processes,
    caller?: Point
}

class Logger { 
    defaultColour = "white"
    operationColour = {
        NONE: this.defaultColour,
        MOV: "#10c422",
        SETX: "#10c422",
        SETY: "#10c422",
        SETWIDTH: "#10c422",
        SETHEIGHT: "#10c422",
        COMPUTEBOUNDARY: "lightgreen",
        ADD: "#10c422",
        DELETE: "#10c422",
        MODIFY: "#10c422",
        BIND: "#10c422",
        BROADCAST: "#54aceb"
    }
    processColour = {
        COMPUTE_BOUNDARY: "#ff644d",
        INSTANTIATE: "#ff644d"
    }
    levelColours = {
        "OPERATION": "#e042ff",
        "INFO": "lightblue",
        "PERFORMANCE": "orange",
        "PROCESS_START": "#ff644d",
        "PROCESS_END": "green"
    }
    stressColour = "#e3ff2b"
    

    simpleColours(level: Levels) {
        return [`color:${this.defaultColour}`, 
                `color:${this.levelColours[level]}`, 
                `color:${this.defaultColour}`,  
                `color:${this.defaultColour}`]
    }

    getTime() {
        var nowDate = new Date(Date.now());
        var time = [
            nowDate.getHours(),
            nowDate.getMinutes(),
            nowDate.getSeconds(),
            nowDate.getMilliseconds()
        ].join(":");

        return time;
    }

    simpleFormat(s: string, level: Levels): string[] {
        return [`%c${this.getTime()} `, `%c[${level}]`, `%c: `, `%c${s}`]
    }

    // Simple logs
    info(message: string) {
        var formattedMessage = this.simpleFormat(message, Levels.INFO);
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c)

        console.log(concatMessage, ...this.simpleColours(Levels.INFO))
    }

    performance(message: string) {
        var formattedMessage = this.simpleFormat(message, Levels.PERFORMANCE);
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c)

        console.log(concatMessage, ...this.simpleColours(Levels.PERFORMANCE))
    }

    broadcast(from: Spacial, functionName: string) {
        try {
            var formattedMessage: string[] = [`%c${this.getTime()} `, 
                                            `%c[BROADCAST]`,
                                            `%c: `,

                                            `%c"${from.ref}" `,
                                            `%cis starting the following `,
                                            `%c"${functionName}(), width: ${from.width}, height: ${from.height}"`]
        } catch {
            var formattedMessage: string[] = [`%c${this.getTime()} `, 
                                            `%c[BROADCAST]`,
                                            `%c: `,

                                            `%c"${from.ref}" `,
                                            `%cis starting the following `,
                                            `%c"${functionName}()`]
        }

        var concatMessage: string = formattedMessage.reduce((p, c) => p + c);
        
        var colours = [`color:${this.defaultColour}`, 
                       `color:${this.levelColours[Levels.OPERATION]}`, 
                       `color:${this.defaultColour}`,
                       `color:${this.stressColour}`,
                       `color:${this.defaultColour}`,
                       `color:${this.stressColour}`]

        console.log(concatMessage, ...colours);
    }

    operation(operation: Operations, message: string, caller?: Point) {
        if (operation === Operations.BIND && caller?.ref === "label collection") {
            console.log()
        }
        var formattedMessage: string[] = [`%c${this.getTime()} `, 
                                          `%c[${Levels.OPERATION}]`, 
                                          `%c: `, 

                                          caller ? `%c"${caller.ref}" %ccalls ` : `%c%c`,
                                          `%c${operation}() `, 
                                          `%c${message}`]
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c);

        var colours = [`color:${this.defaultColour}`, 
                       `color:${this.levelColours[Levels.OPERATION]}`, 
                       `color:${this.defaultColour}`,
                    
                       `color:${this.stressColour}`,   
                       `color:${this.defaultColour}`,
                       `color:${this.operationColour[operation]}`,
                       `color:${this.defaultColour}`]

        console.log(concatMessage, ...colours)
    }

    processStart(process: Processes, message: string, caller: Point) {
        var formattedMessage = [`%c${this.getTime()} `, 
                                `%c[${Levels.PROCESS_START}]`, 
                                `%c: `, 
                                caller ? `%c"${caller.ref}" %cstarts ` : `%c`,
                                `%c${process}() `, 
                                `%c${message}`]
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c);

        var colours = [`color:${this.defaultColour}`, 
                       `color:${this.levelColours[Levels.PROCESS_START]}`, 
                       `color:${this.defaultColour}`,
                       `color:${this.stressColour}`,
                       `color:${this.defaultColour}`,
                       `color:${this.processColour[process]}`,
                       `color:> ${this.defaultColour}`]
        
        console.log(concatMessage, ...colours)
    }

    processEnd(process: Processes, message: string, caller?: Point) {
        var formattedMessage = [`%c${this.getTime()} `, 
                                `%c[${Levels.PROCESS_END}]`, 
                                `%c: `, 

                                caller ? `%c"${caller.ref}" %cends ` : `%c%c`,
                                `%c${process}()`, 
                                `%c> ${message}`]
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c);

        var colours = [`color:${this.defaultColour}`, 
                       `color:${this.levelColours[Levels.PROCESS_END]}`, 
                       `color:${this.defaultColour}`,

                       `color:${this.stressColour}`,
                       `color:${this.defaultColour}`,
                       `color:${this.processColour[process]}`,
                       `color:${this.defaultColour}`]

        console.log(concatMessage, ...colours)
    }
}

const logger = new Logger();

export default logger