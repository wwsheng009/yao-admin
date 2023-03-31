// import { FS, Studio } from "yao-node-client";
/**
 * yao studio run table.Create
 * 创建表格
 */
function Create(model_dsl) {
    let fs = new FS("dsl");
    for (const i in model_dsl) {
        let table_name = Studio("file.SlashName", model_dsl[i]["table"]["name"]);
        let table_file_name = table_name + ".tab.json";
        //let dsl = toTable(model_dsl[i]);
        let dsl = Studio("colunm.toTable", model_dsl[i]); //这里有studio js读取操作
        let table = JSON.stringify(dsl);
        //如果在这个位置调用写文件操作会导致js脚本重加载。
        //使用studio最好使用production mode
        //比如调用fs.WriteFile("/tables/" + table_file_name, table);
        //会导致后面的脚本报错： The %s does not loaded (%d)
        //原因是在源代码：/data/projects/yao/yao-app-sources/gou/runtime/yao/yao.go
        //里触发：yao.loadReader(yao.rootScripts, true, reader, name, filename...)
        //yao.rootScripts被清空
        ///
        let form_flie_name = table_name + ".form.json";
        let form_dsl = Studio("colunm.toForm", model_dsl[i]); //这里有studio js读取操作
        let form = JSON.stringify(form_dsl);
        Studio("move.Move", "forms", form_flie_name);
        fs.WriteFile("/forms/" + form_flie_name, form);
        //需要把写操作入在最后面操作。在开发环境中，对dsl文件的修改会导致脚本重加载，如果在studio.service写操作的过程中去执行js文件会报错。
        Studio("move.Move", "tables", table_file_name);
        fs.WriteFile("/tables/" + table_file_name, table);
    }
}
