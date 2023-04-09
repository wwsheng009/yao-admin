// import { Studio } from "yao-node-client";
/**
 * yao studio run model.dsl.list.CreateByModel
 * yao studio run model.dsl.list.CreateByModel
 * @param modelDsl model dsl
 */
function CreateByModel(modelDsl) {
    let tableName = Studio("model.file.SlashName", modelDsl.table.name);
    let listFileName = tableName + ".list.json";
    let listDsl = Studio("model.column.list.toList", modelDsl); //这里有studio js读取操作
    // let listJson = JSON.stringify(listDsl);
    // let fs = new FS("dsl");
    Studio("model.file.MoveAndWrite", "lists", listFileName, listDsl);
    // fs.WriteFile("/lists/" + listFileName, listJson);
}
