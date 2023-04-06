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
        let tableDsl = Studio("model.column.table.toTable", modelDsl[i]); //这里有studio js读取操作
        // let table = JSON.stringify(tableDsl);
        //使用studio最好使用production mode
        //比如调用fs.WriteFile("/tables/" + table_file_name, table);
        //会导致后面的脚本报错： The %s does not loaded (%d)
        //原因是在源代码：/data/projects/yao/yao-app-sources/gou/runtime/yao/yao.go
        //里触发：yao.loadReader(yao.rootScripts, true, reader, name, filename...)
        //yao.rootScripts被清空
        ///
        let formFileName = tableName + ".form.json";
        let formDsl = Studio("model.column.form.toForm", modelDsl[i]); //这里有studio js读取操作
        // let formJson = JSON.stringify(formDsl);
        Studio("model.file.MoveAndWrite", "forms", formFileName, formDsl);
        // fs.WriteFile("/forms/" + formFileName, formJson);
        //在开发环境中，对dsl文件的修改会导致脚本重加载，如果在studio.service写操作的过程中去执行js文件会报错。
        Studio("model.file.MoveAndWrite", "tables", tableFileName, tableDsl);
        // fs.WriteFile("/tables/" + tableFileName, table);
    }
}
