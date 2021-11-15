import * as net from "net"
import { _onEvent, heartBeat, moduleConnection, onTypes, moduleConnected, modulesRecords } from "Server";


export class Client {
    type: "socket" = "socket";
    Server: net.Server;
    PORT: Number;
    CONNECTIONS: Array<String> = [];
    $onEvents: _onEvent;
    $modules: modulesRecords;

    constructor(PORT: Number, modules: modulesRecords) {
        this.PORT = PORT;
        this.Server = net.createServer();

        this.$modules = modules;

        this.$onEvents = { 
            "module": [],
            "data": [],
            'heartbeat': [],
            "disconnected": []
        };
    }    

    start() {
        this.Server.listen(this.PORT);
    }

    _eventEmitter(name: onTypes, data: any) {
        this.$onEvents[name].forEach((cback) => { cback(data); });
    }

    on(name: "module", callback: (module: moduleConnection) => void): void;
    on(name: "heartbeat", callback: (heatdata: heartBeat) => void): void;
    on(name: "data", callback: (data: any) => void): void;
    on(name: "disconnected", callback: (module: moduleConnected) => void): void;

    on(name: onTypes, callback: any): void { this.$onEvents[name].push(callback); }

}