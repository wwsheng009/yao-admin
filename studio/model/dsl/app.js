// import { Studio } from "yao-node-client";
/**
 * 写入10.3版本的app.json
 * yao studio run model.dsl.app.Create
 */
function Create() {
    const table = {
        xgen: "1.0",
        name: "::Demo Application",
        short: "::Demo",
        description: "::Another yao application",
        version: "0.10.3",
        menu: {
            process: "flows.app.menu",
            args: ["demo"],
        },
        setup: "studio.model.cmd.Setup",
        adminRoot: "admin",
        optional: {
            hideNotification: true,
            hideSetting: false,
            remoteCache: false,
        },
    };
    Studio("model.file.MoveAndWrite", "", "app.json", table);
}
