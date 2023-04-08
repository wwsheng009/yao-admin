// import { FS, Studio } from "yao-node-client";
/**
 * yao studio run model.ts.CreateModelTypes
 * 创建一个ts类型定义文件
 */
function CreateModelTypes(type = "ddic") {
    const files = Studio("model.cmd.GetModelFnameList");
    const fs = new FS("dsl");
    const modelDsl = files
        .filter((item) => item.startsWith(type))
        .map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
    CreatTypes(modelDsl);
}
function CreatTypes(models) {
    const typeMapping = getTSTypeMapping();
    const codes = models.map((model) => {
        const tabName = model.table.name;
        let funtionName = Studio("model.file.SlashName", tabName);
        let dotName = Studio("model.file.DotName", tabName);
        // let names = funtionName.split("/");
        // let last = names.pop();
        // let fname = names.join("/");
        const last = funtionName.replaceAll("/", "_");
        const fields = model.columns
            .map((item) => {
            return `    /**${item.comment} */
    ${item.name}${isOption(item) ? "?" : ""}: ${getTsType(item, typeMapping)};`;
        }, [])
            .join("\n");
        let rels = [];
        for (const key in model.relations) {
            const element = model.relations[key];
            let sign = "";
            if (element.type === "hasMany") {
                sign = "[]";
            }
            rels.push(`    /** Relation: ${key}=> ${element.model} */
    ${key}?: ${element.model.replaceAll(".", "_")}${sign}`);
        }
        return `
  /**
   * Model=> ${dotName} ${model.name ? "(" + model.name + ")" : ""}
   * 
   * Table=> ${model.table.name} ${model.table.comment ? "(" + model.table.comment + ")" : ""}
  */
  export interface ${last} {
${fields}
${rels.join("\n")}
  }
  `;
    });
    let sc = new FS("system");
    sc.WriteFile(`/types.ts`, codes.join("\n"));
    //   fs.WriteFile(`/${functionName}.js`, scripts);
}
function isOption(column) {
    const { unique, nullable, default: columnDefault, type } = column;
    if (/^id$/i.test(type)) {
        //id一般是数据创建
        return true;
    }
    else if (unique || (columnDefault == null && !nullable)) {
        //这里不要判断同时 == null || == undefined
        return false;
    }
    return true;
}
function getTsType(column, typeMapping) {
    let type = "any";
    if (column.type === "enum") {
        type = column.option.map((item) => `"${item}"`).join(" | ");
    }
    else if (column.type in typeMapping) {
        type = typeMapping[column.type];
    }
    return type;
}
function getTSTypeMapping() {
    return {
        ID: "number",
        string: "string",
        char: "string",
        text: "string",
        mediumText: "string",
        longText: "string",
        date: "date",
        datetime: "date",
        datetimeTz: "date",
        time: "date",
        timeTz: "date",
        timestamp: "date",
        timestampTz: "date",
        tinyInteger: "number",
        tinyIncrements: "number",
        unsignedTinyInteger: "number",
        smallInteger: "number",
        unsignedSmallInteger: "number",
        integer: "number",
        bigInteger: "number",
        decimal: "number",
        unsignedDecimal: "number",
        float: "number",
        boolean: "boolean",
        enum: "Select",
        json: "string",
    };
}
