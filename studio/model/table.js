// import { FS, Studio } from "yao-node-client";
/**
 * yao studio run model.table.Create
 * 创建表格
 */
function Create(modelDsl) {
    let fs = new FS("dsl");
    for (const i in modelDsl) {
        let tableName = Studio("model.file.SlashName", modelDsl[i].table.name);
        let tableFileName = tableName + ".tab.json";
        let tableDsl = Studio("model.colunm.toTable", modelDsl[i]); //这里有studio js读取操作
        let table = JSON.stringify(tableDsl);
        //如果在这个位置调用写文件操作会导致js脚本重加载。
        //使用studio最好使用production mode
        //比如调用fs.WriteFile("/tables/" + table_file_name, table);
        //会导致后面的脚本报错： The %s does not loaded (%d)
        //原因是在源代码：/data/projects/yao/yao-app-sources/gou/runtime/yao/yao.go
        //里触发：yao.loadReader(yao.rootScripts, true, reader, name, filename...)
        //yao.rootScripts被清空
        ///
        let formFileName = tableName + ".form.json";
        let formDsl = Studio("model.colunm.toForm", modelDsl[i]); //这里有studio js读取操作
        let formJson = JSON.stringify(formDsl);
        Studio("model.move.Move", "forms", formFileName);
        fs.WriteFile("/forms/" + formFileName, formJson);
        //需要把写操作入在最后面操作。在开发环境中，对dsl文件的修改会导致脚本重加载，如果在studio.service写操作的过程中去执行js文件会报错。
        Studio("model.move.Move", "tables", tableFileName);
        fs.WriteFile("/tables/" + tableFileName, table);
    }
}
function CreateList(modelDsl) {
    let tableName = Studio("model.file.SlashName", modelDsl.table.name);
    let listFileName = tableName + ".list.json";
    let listDsl = Studio("model.colunm.toList", modelDsl); //这里有studio js读取操作
    let listJson = JSON.stringify(listDsl);
    let fs = new FS("dsl");
    Studio("model.move.Move", "lists", listFileName);
    fs.WriteFile("/lists/" + listFileName, listJson);
}
