import * as fs from 'fs';
require('dotenv').config();

import { load } from "js-yaml";
import { serverConfig } from "configYaml"
import { Client as ServerTypeSocketClient } from "./Server/socket"
import { Client as ServerTypeAPIClient } from "./Server/API"
import { modulesRecords } from 'Server';



// Load Server Config File.yaml
let file = fs.readFileSync("./config/server.yaml", "utf8")
let config = load(file) as serverConfig;

let client;

if (config.SERVERTYPE == "API") {
    client = new ServerTypeAPIClient(config.PORT, config.modules as modulesRecords);

} else if (config.SERVERTYPE == "socket") {
    client = new ServerTypeSocketClient(config.PORT, config.modules as modulesRecords);
}

// Start Modules Server
if (client) {

    client.start();

    client.on("module", (module) => { 
        console.log("module name " + module.displayName, 'is connected!')
    });

    client.on("disconnected", (module) => {
        console.log('module name ' + module.displayName, "is disconnected!")
    });
        
}

console.log(process.env.TOKEN)
