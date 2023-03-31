//yao studio run model.Create
// import { FS, Studio } from "yao-node-client";
/**
 * 从数据结构中创建模型
 */
function Create() {
    const start = Math.floor(Date.now() / 1000);
    const model_dsl = CreateModels();
    console.log(`Create Modes:${Math.floor(Date.now() / 1000) - start} seconds`);
    // 创建表格dsl
    Studio("table.Create", model_dsl);
    version10_0_3();
    login();
    // 创建菜单
    Studio("menu.Create", model_dsl);
    console.log(`Total:${Math.floor(Date.now() / 1000) - start} seconds`);
}
/**
 * yao studio run model.CreateModels
 * @returns
 */
function CreateModels() {
    const model_dsl = Studio("schema.Relation");
    const fs = new FS("dsl");
    for (const i in model_dsl) {
        let table_name = Studio("file.SlashName", model_dsl[i]["table"]["name"]);
        const table_file_name = table_name + ".mod.json";
        const table = JSON.stringify(model_dsl[i]);
        Studio("move.Move", "models", table_file_name);
        //console.log(`create model:/models/"${table_file_name}.mod.json`);
        fs.WriteFile("/models/" + table_file_name, table);
    }
    return model_dsl;
}
/**
 * yao studio run model.Get
 * @param model_name
 * @returns
 */
function Get(model_name) {
    const fs = new FS("dsl");
    let model_file_name = Studio("file.SlashName", model_name);
    const fname = "models/" + model_file_name + ".mod.json";
    if (!fs.Exists(fname)) {
        return false;
    }
    return JSON.parse(fs.ReadFile(fname));
}
function getAllModelsFromFile() {
    const fs = new FS("dsl");
    const files = fs.ReadDir("models/", true);
    return files
        .filter((file) => !fs.IsDir(file) && file.endsWith(".mod.json"))
        .map((file) => file.replace("/models/", ""));
}
/**
 * 根据本地的模型文件创建表格与表单配置
 */
function CreateLocal() {
    const files = getAllModelsFromFile();
    const fs = new FS("dsl");
    const model_dsl = files.map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
    // 创建表格与表单dsl
    Studio("table.Create", model_dsl);
    // 创建菜单
    Studio("menu.Create", model_dsl);
}
//创建单个表格的studio
///yao studio run model.CreateOne address
function CreateOne(model_name) {
    let model_file_name = Studio("file.SlashName", model_name);
    const fs = new FS("dsl");
    let model_dsl = [];
    model_dsl.push(JSON.parse(fs.ReadFile("models/" + model_file_name + ".mod.json")));
    // 创建表格dsl
    Studio("table.Create", model_dsl);
    //version10_0_2();
    //login();
}
/**
 * 写入10.3版本的
 */
function version10_0_3() {
    const fs = new FS("dsl");
    fs.WriteFile("app.json", JSON.stringify({
        xgen: "1.0",
        name: "::Demo Application",
        short: "::Demo",
        description: "::Another yao application",
        version: "0.10.3",
        menu: {
            process: "flows.app.menu",
            args: ["demo"],
        },
        setup: "studio.model.Create",
        adminRoot: "admin",
        optional: {
            hideNotification: true,
            hideSetting: false,
        },
    }));
}
function login() {
    const fs = new FS("dsl");
    // const menu = Process("models.xiang.menu.get", {
    //   limit: 1,
    // });
    const fname = "admin.login.json";
    const table = JSON.stringify({
        name: "::Admin Login",
        action: {
            process: "yao.login.Admin",
            args: [":payload"],
        },
        layout: {
            entry: "/x/Chart/dashboard",
            // captcha: "yao.utils.Captcha",
            //cover: "/assets/images/login/cover.svg",
            slogan: "::Make Your Dream With Yao App Engine",
            site: "https://yaoapps.com?from=yao-admin",
        },
    });
    Studio("move.Move", "logins", fname);
    fs.WriteFile("/logins/" + fname, table);
}
