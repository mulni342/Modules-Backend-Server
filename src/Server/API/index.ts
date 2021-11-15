import express = require("express");
import { _onEvent, heartBeat, moduleConnection, modulesRecords, onTypes, moduleConnected } from "Server";
import { v4 as uuidV4 } from "uuid"

// this should be 15 on deployment
let heartpulse = 5;
// This allows a new connection which is already connected to connect and replace the other, 
// !!!! FOR TESTING ONLY! !!!!
let ifnewConnectingConnectNew = true;

export class Client
{
    type: "API" = "API";
    PORT: Number;
    APP: express.Express;
    $onEvents: _onEvent;
    $modules: modulesRecords;

    CONNECTIONS: Array<moduleConnected> = [];

    constructor(PORT: Number, modules: modulesRecords)
    {
        this.PORT = PORT;
        this.APP = express();

        this.$modules = modules;

        this.$onEvents = {
            "module": [],
            "data": [],
            'heartbeat': [],
            "disconnected": []
        };
    }

    start()
    {

        this.APP.get("/module", (req, res) =>
        {

            let resMessage = "";
            let err = false;
            let resData: any = {};

            // Code 0 = not errors found!
            // Code 1 = query argument missing
            // Code 2 = already connected
            // Code 3 = module doesn't exist on server record

            let code = 0;

            if (err == false && req.query.displayName == undefined) { resMessage = "missing displayName!"; err = true; code = 1 }
            if (err == false && req.query.moduleName == undefined) { resMessage = "missing moduleName!"; err = true; code = 1 }
            if (err == false && req.query.moduleUUID == undefined) { resMessage = "missing moduleUUID!"; err = true; code = 1 }


            if (err == false)
            {
                let data: moduleConnection = {
                    "displayName": req.query.displayName as string,
                    "moduleName": req.query.moduleName as string,
                    "moduleUUID": req.query.moduleUUID as string,
                }

                let validatedModule = this.$modules.find(rmodule => rmodule.uuid == data.moduleUUID && rmodule.name == data.moduleName);

                if (validatedModule)
                {
                    resMessage = "success!"

                    resData = {
                        "heartbeat": {
                            "pulse": heartpulse,
                            "heart": uuidV4()
                        },
                        "token": process.env.BOTTOKEN, // sends bot token,
                        "dburi": process.env.DBURI // sends the db token
                    }

                    let mcode = this.$newModule(data, resData.heartbeat);

                    if (mcode && ifnewConnectingConnectNew == false)
                    {   
                        resMessage = "module already connected!"
                        resData = {};
                        code = 2
                    }

                    this._eventEmitter("module", data);
                } else
                {
                    resMessage = "module not identify!"
                    code = 3
                }

            }

            res.json({
                "message": resMessage,
                "data": resData,
                "code": code
            })
        });

        this.APP.get("/beat", (req, res) =>
        {
            let resMessage = "";
            let err = false;
            let resData: any = {};

            // Code 0 = not errors found!
            // Code 1 = query argument missing
            // Code 2 = module not found

            let code = 0;

            if (req.query.moduleName == undefined) { err = true; resMessage = "missing moduleName!" }
            if (req.query.heart == undefined) { err = true; resMessage = "missing heart!" }

            if (err == false)
            {
                let moduleName = req.query.moduleName;
                let heartId = req.query.heart;

                let module = this.CONNECTIONS.find(moduleS => moduleS.heart == heartId && moduleS.moduleName == moduleName);

                if (module)
                {
                    module?.timeout.refresh();
                    resMessage = "heart beat!";
                    // console.log(moduleName, "heart beated!");
                } else
                {
                    resMessage = "Module not found!"
                    code = 2
                }

            }

            res.json({
                "message": resMessage,
                "data": resData,
                "code": code
            })
        })

        this.APP.listen(this.PORT, () => { console.log(`API ONLINE! PORT=${this.PORT}`) });
    }

    $newModule(module: moduleConnection, heartData: any)
    {

        var alreadyConnected = this.CONNECTIONS.find(moduleS => moduleS.moduleName == module.moduleName);

        if (alreadyConnected) return 1

        this.CONNECTIONS.push({
            commands: [],
            displayName: module.displayName,
            moduleName: module.moduleName,
            heart: heartData.heart,
            pulse: heartData.pulse,
            timeout: setTimeout(() =>
            {
                var self = this.CONNECTIONS.find(moduleS => moduleS.moduleName == module.moduleName);
                if (!self) return
                var self_index = this.CONNECTIONS.indexOf(self);

                this._eventEmitter("disconnected", self);

                this.CONNECTIONS.splice(self_index, 1);
            }, (heartData.pulse + 2) * 1000)
        });

        return 0
    }

    _eventEmitter(name: onTypes, data: any)
    {
        this.$onEvents[name].forEach((cback) => { cback(data); });
    }

    on(name: "module", callback: (module: moduleConnection) => void): void;
    on(name: "heartbeat", callback: (heatdata: heartBeat) => void): void;
    on(name: "data", callback: (data: any) => void): void;
    on(name: "disconnected", callback: (module: moduleConnected) => void): void;

    on(name: onTypes, callback: any): void { this.$onEvents[name].push(callback); }
}
