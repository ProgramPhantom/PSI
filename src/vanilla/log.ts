
export enum Levels {
    INFO="INFO",
    PERFORMANCE="PERFORMANCE",
    OPERATION="OPERATION"
}

export enum Operations {
    NONE="NONE",
    MOV="MOV",
    SETX="SETX",
    SETY="SETY",
    SETWIDTH="SETWIDTH",
    SETHEIGHT="SETHEIGHT",
    COMPUTEBOUNDARY="COMPUTEBOUNDARY",
    ADD="ADD",
    DELETE="DELETE",
    MODIFY="MODIFY"
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
        MODIFY: "#10c422"
    }

    levelColours = {
        "OPERATION": "#ad03fc",
        "INFO": "lightblue",
        "PERFORMANCE": "orange"
    }
    

    getColours(level: Levels, operation: Operations=Operations.NONE) {
        return [`color:${this.defaultColour}`, 
                `color:${this.levelColours[level]}`, 
                `color:${this.defaultColour}`, 
                `color:${this.operationColour[operation]}`,  
                `color:${this.defaultColour}`]
    }

    format(s: string, level: Levels, operation?: Operations): string[] {
        var nowDate = new Date(Date.now());
        var time = [
            nowDate.getHours(),
            nowDate.getMinutes(),
            nowDate.getSeconds(),
            nowDate.getMilliseconds()
        ].join(":");

        return [`%c${time} `, `%c[${level}]`, `%c ~ `, `%c${operation ? operation : "DO"}: `, `%c${s}`]
    }

    info(message: string) {
        var formattedMessage = this.format(message, Levels.INFO);
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c)

        console.log(concatMessage, ...this.getColours(Levels.INFO))
    }

    performance(message: string) {
        var formattedMessage = this.format(message, Levels.PERFORMANCE);
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c)

        console.log(concatMessage, ...this.getColours(Levels.PERFORMANCE))
    }

    operation(operation: Operations, message: string) {
        var formattedMessage: string[] = this.format(message, Levels.OPERATION, operation);
        var concatMessage: string = formattedMessage.reduce((p, c) => p + c)

        console.log(concatMessage, ...this.getColours(Levels.OPERATION, operation))
    }
}

const logger = new Logger();

export default logger