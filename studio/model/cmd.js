// import { Studio } from "yao-node-client";
/**
 * 应用安装时的调用设置
 *
 * 在app.json中配置：studio.model.cmd.Setup
 *
 * studio run model.cmd.Setup
 */
function Setup() {
    // 先从数据库中获取表，并生成模型定义文件。
    CreateModelsFromDB();
    // 根据模型文件创建表格/表单/列表
    CreateFromFile();
    // 单独创建列表
    Studio("model.model.CreateList", "ddic.model.relation");
    // 加载ddic定义列表
    // Studio("ddic.loader.LoadModelFromFile");
}
/**
 * 根据数据库表定义创建所有的模型对应的表格与表单
 *
 * yao studio run model.cmd.CreateFromDB
 * @returns
 */
function CreateFromDB() {
    return Studio("model.db.CreateFromDB");
}
/**
 * 根据数据库表结构创建模型文件
 *
 * yao studio run model.cmd.CreateModelsFromDB
 * @returns
 */
function CreateModelsFromDB() {
    return Studio("model.db.CreateModelsFromDB");
}
/**
 * 根据本地模型DSL文件创建所有模型对应的表格与表单
 *
 * yao studio run model.cmd.CreateFromFile
 * @returns
 */
function CreateFromFile() {
    return Studio("model.model.CreateFromFile");
}
/**
 * 创建单个模型对应的Table/Form
 *
 * yao studio run model.cmd.CreateOne model
 * @param modelName 模型名称
 */
function CreateOne(modelName) {
    return Studio("model.model.CreateOne", modelName);
}
