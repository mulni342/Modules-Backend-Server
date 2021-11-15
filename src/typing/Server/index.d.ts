declare module "Server" {
    export interface heartBeat {
        moduleName: string
        moduleUUID: string
    }

    export interface moduleConnection {
        moduleName: string
        moduleUUID: string
        displayName: string
    }   

    export interface moduleCommand {
        name: string
        description: string
        usage: string
        example: string
        cooldown: number
    }

    export type modulesRecords = Array<{ name: string, uuid: string }>

    export interface moduleConnected {
        moduleName: string
        displayName: string
        heart: string
        pulse: number
        commands: Array<moduleCommand>
        timeout: any
    }

    export type onTypes = "heartbeat" | "module" | "data" | "disconnected";

    export interface _onEvent {
        module: Array<any>
        heartbeat: Array<any>
        data: Array<any>
        disconnected: Array<any>
    }

}   