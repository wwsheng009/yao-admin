// import { Studio } from "yao-node-client";
/**
 * 根据数据库表的结构定义，创建模型
 *
 * 不会更新ddic的模型与表数据。
 *
 * yao studio run model.db.Create
 */
function CreateFromDB() {
    const start = Math.floor(Date.now() / 1000);
    const modelDsls = CreateAndGetModelsFromDB();
    // console.log(`Create Models:${Math.floor(Date.now() / 1000) - start} seconds`);
    // 创建表格dsl
    Studio("model.dsl.form.CreateByModels", modelDsls);
    Studio("model.dsl.table.CreateByModels", modelDsls);
    // 创建菜单
    Studio("model.dsl.menu.Create", modelDsls);
    Studio("model.dsl.app.Create");
    Studio("model.dsl.login.Create");
    console.log(`总耗时:${Math.floor(Date.now() / 1000) - start}秒`);
}
/**
 * create model files from database tables
 *
 * yao studio run model.db.CreateModelsFromDB
 * @returns
 */
function CreateModelsFromDB() {
    const modelDsl = Studio("model.schema.Relation");
    // const fs = new FS("dsl");
    for (const i in modelDsl) {
        let table_name = Studio("model.file.SlashName", modelDsl[i].table.name);
        const table_file_name = table_name + ".mod.json";
        Studio("model.file.MoveAndWrite", "models", table_file_name, modelDsl[i]);
    }
}
/**
 * create model from tables
 * @returns
 */
function CreateAndGetModelsFromDB() {
    const modelDsl = Studio("model.schema.Relation");
    // const fs = new FS("dsl");
    for (const i in modelDsl) {
        let table_name = Studio("model.file.SlashName", modelDsl[i].table.name);
        const table_file_name = table_name + ".mod.json";
        Studio("model.file.MoveAndWrite", "models", table_file_name, modelDsl[i]);
    }
    return modelDsl;
}
