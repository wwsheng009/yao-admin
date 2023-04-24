// import { FS, Studio } from "yao-node-client";
/**
 * 根据本地的模型文件创建表格与表单配置
 *
 * yao studio run model.model.CreateFromFile
 */
function CreateFromFile() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    const modelDsls = files.map((file) => {
        return JSON.parse(fs.ReadFile(file));
    });
    // 创建表格与表单dsl
    Studio("model.dsl.form.CreateByModels", modelDsls);
    Studio("model.dsl.table.CreateByModels", modelDsls);
    // 创建菜单
    Studio("model.dsl.menu.Create", modelDsls);
    Studio("model.dsl.app.Create");
    Studio("model.dsl.login.Create");
    //生成模型ts定义
    Studio("model.ts.CreateModelTypes", "ddic");
}
/**
 * 根据模型定义创建xgen菜单配置文件
 *
 * yao studio run model.model.CreateMenuFromModels
 */
function CreateMenuFromModels() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    const modelDsls = files.map((file) => {
        return JSON.parse(fs.ReadFile(file));
    });
    Studio("model.dsl.menu.Create", modelDsls);
}
/**
 * 读取单个模型的定义
 *
 * yao studio run model.model.GetModel
 * @param modelName 模型名称
 * @returns 模型定义或是false
 */
function GetModel(modelName) {
    const fs = new FS("dsl");
    let model_file_name = Studio("model.file.SlashName", modelName);
    const fname = "models/" + model_file_name + ".mod.json";
    if (!fs.Exists(fname)) {
        return false;
    }
    const data = JSON.parse(fs.ReadFile(fname));
    return data;
}
/**
 * 读取所有的模型文件列表
 *
 * yao studio run model.model.GetModelFnameList
 * @returns model file list
 */
function GetModelFnameList() {
    const fs = new FS("dsl");
    const files = fs.ReadDir("models/", true);
    return files.filter((file) => !fs.IsDir(file) && file.endsWith(".mod.json"));
}
/**
 * 从模型定义DSL文件中获取模型定义
 *
 * yao studio run model.model.GetModelsFromFile
 * @returns all models from files
 */
function GetModelsFromFile() {
    const files = GetModelFnameList();
    const fs = new FS("dsl");
    return files.map((file) => {
        return JSON.parse(fs.ReadFile(file));
    });
}
/**
 * 创建单个模型对应的Table/Form
 *
 * yao studio run model.model.CreateOne model
 * @param modelName 模型名称
 */
function CreateOne(modelName) {
    let model_file_name = Studio("model.file.SlashName", modelName);
    const fs = new FS("dsl");
    let modelDsls = [];
    modelDsls.push(JSON.parse(fs.ReadFile("models/" + model_file_name + ".mod.json")));
    // 创建表格dsl
    Studio("model.dsl.form.CreateByModels", modelDsls);
    Studio("model.dsl.table.CreateByModels", modelDsls);
    console.log(`处理完成：${modelName}`);
    return `处理完成：${modelName}`;
}
/**
 * Create List DSL By Model Name
 *
 * yao studio run model.model.CreateList
 * @param modelName model name
 */
function CreateList(modelName) {
    const model = GetModel(modelName);
    if (model) {
        Studio("model.dsl.list.CreateByModel", model);
        console.log(`处理完成：${modelName}`);
    }
    else {
        console.log("读取模型失败" + modelName);
    }
}
