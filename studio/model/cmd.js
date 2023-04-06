// import { FS, Studio } from "yao-node-client";
/**
 * yao studio run model.cmd.Create
 * 从数据结构中创建模型
 */
function CreateFromDB() {
    const start = Math.floor(Date.now() / 1000);
    const modelDsl = GetModelsFromDB();
    console.log(`Create Modes:${Math.floor(Date.now() / 1000) - start} seconds`);
    // 创建表格dsl
    Studio("model.table.Create", modelDsl);
    CreateAPPdsl();
    CreateLoginDsl();
    // 创建菜单
    Studio("model.menu.Create", modelDsl);
    console.log(`Total:${Math.floor(Date.now() / 1000) - start} seconds`);
}
/**
 * yao studio run model.cmd.CreateFromFile
 * 根据本地的模型文件创建表格与表单配置
 */
function CreateFromFile() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    const modelDsls = files.map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
    // 创建表格与表单dsl
    Studio("model.table.Create", modelDsls);
    // 创建菜单
    Studio("model.menu.Create", modelDsls);
    Studio("model.ts.CreatTypes", modelDsls);
}
function CreateMenuFromFile() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    const modelDsls = files.map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
    Studio("model.menu.Create", modelDsls);
}
/**
 * create model from tables
 * yao studio run model.cmd.GetModelsFromDB
 * @returns
 */
function GetModelsFromDB() {
    const modelDsl = Studio("model.schema.Relation");
    // const fs = new FS("dsl");
    for (const i in modelDsl) {
        let table_name = Studio("model.file.SlashName", modelDsl[i].table.name);
        const table_file_name = table_name + ".mod.json";
        const table = JSON.stringify(modelDsl[i]);
        Studio("model.file.MoveAndWrite", "models", table_file_name, table);
        //console.log(`create model:/models/"${table_file_name}.mod.json`);
        // fs.WriteFile("/models/" + table_file_name, table);
    }
    return modelDsl;
}
/**
 * yao studio run model.cmd.Get
 * @param model_name
 * @returns
 */
function Get(model_name) {
    const fs = new FS("dsl");
    let model_file_name = Studio("model.file.SlashName", model_name);
    const fname = "models/" + model_file_name + ".mod.json";
    if (!fs.Exists(fname)) {
        return false;
    }
    return JSON.parse(fs.ReadFile(fname));
}
/**
 * yao studio run model.cmd.GetModelFnameList
 * @returns model file list
 */
function GetModelFnameList() {
    const fs = new FS("dsl");
    const files = fs.ReadDir("models/", true);
    return files
        .filter((file) => !fs.IsDir(file) && file.endsWith(".mod.json"))
        .map((file) => file.replace("/models/", ""));
}
/**
 * yao studio run mocdel.cmd.GetModelsFromFile
 * @returns get all models from files
 */
function GetModelsFromFile() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    return files.map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
}
//创建单个表格的studio
///yao studio run model.cmd.CreateOne address
function CreateOne(model_name) {
    let model_file_name = Studio("model.file.SlashName", model_name);
    const fs = new FS("dsl");
    let modelDsl = [];
    modelDsl.push(JSON.parse(fs.ReadFile("models/" + model_file_name + ".mod.json")));
    // 创建表格dsl
    Studio("model.table.Create", modelDsl);
    //version10_0_2();
    //login();
}
/**
 * Create List DSL By Model Name
 * yao studio run model.cmd.CreateList
 * @param modelName model name
 */
function CreateList(modelName) {
    const model = Get(modelName);
    if (model) {
        CreateListByModel(model);
    }
}
/**
 * yao studio run model.table.CreateList
 * @param modelDsl model dsl
 */
function CreateListByModel(modelDsl) {
    let tableName = Studio("model.file.SlashName", modelDsl.table.name);
    let listFileName = tableName + ".list.json";
    let listDsl = Studio("model.column.list.toList", modelDsl); //这里有studio js读取操作
    // let listJson = JSON.stringify(listDsl);
    // let fs = new FS("dsl");
    Studio("model.file.MoveAndWrite", "lists", listFileName, listDsl);
    // fs.WriteFile("/lists/" + listFileName, listJson);
}
/**
 * 写入10.3版本的
 */
function CreateAPPdsl() {
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
function CreateLoginDsl() {
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
    Studio("model.file.MoveAndWrite", "logins", fname, table);
    // fs.WriteFile("/logins/" + fname, table);
}
