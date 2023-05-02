// import { Studio } from "yao-node-client";
/**
 * yao studio run model.dsl.table.CreateByModels
 * 创建表格
 */
function CreateByModels(modelDsl) {
    for (const i in modelDsl) {
        let tableName = Studio("model.file.SlashName", modelDsl[i].table.name);
        let tableFileName = tableName + ".tab.json";
        let tableDsl = Studio("model.column.table.toTable", modelDsl[i]); //这里有studio js读取操作
        Studio("model.file.MoveAndWrite", "tables", tableFileName, tableDsl);
    }
}
