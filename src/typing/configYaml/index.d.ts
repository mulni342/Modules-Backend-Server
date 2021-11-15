declare module "configYaml" {
    export interface serverConfig {
        PORT: Number
        SERVERTYPE: "socket" | "API"
        modules: Array<{
            name: string,
            uuid: string
        }>
    }
}