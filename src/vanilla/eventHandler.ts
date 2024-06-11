export enum EVENT_SYSTEM_EVENT_NAMES {
    LOG_EVENT = 'log_event',
  }
  
export interface EventSystemEvents {
    [EVENT_SYSTEM_EVENT_NAMES.LOG_EVENT]: (message: string) => void;
}


interface BaseEventMap {
    [event: string]: any;
}

interface EventMap extends BaseEventMap  {
    move: (x: number, y: number) => void;
    resize: (width: number, height: number) => void;
}

export default class EventHandler<T extends EventMap> {
    private events: { [K in keyof T]?: T[K][] } = {};

    on<K extends keyof T>(eventName: K, handler: T[K]): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName]?.push(handler);
    }

    off<K extends keyof T>(eventName: K, handler: T[K]): void {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName]?.filter(h => h !== handler);
    }

    emit<K extends keyof T>(eventName: K, event: T[K]): void {
        if (!this.events[eventName]) return;
        this.events[eventName]?.forEach(handler => handler(event));
    }

    sayHi() {
        
    }
}

var main = new EventHandler<EventMap>();
var subscriber = new EventHandler();

main.on("move", subscriber.sayHi)