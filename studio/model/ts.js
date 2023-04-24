// import { FS, Studio } from "yao-node-client";
/**
 * 创建命名空间下的模型的ts定义，
 *
 * yao studio run model.ts.CreateModelTypes ddic
 * @param namespace 模型命名空间，通常是models目录下的一个子目录名称
 */
function CreateModelTypes(namespace = "ddic") {
    const files = Studio("model.model.GetModelFnameList");
    const fs = new FS("dsl");
    const modelDsl = files
        .filter((item) => item.startsWith(namespace))
        .map((file) => {
        return JSON.parse(fs.ReadFile(file));
    });
    CreateTSTypes(namespace, modelDsl);
}
function CreateTSTypes(namespace = "ddic", models) {
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
    ${item.name}${isOption(item) ? "?" : ""}: ${getTsType(tabName, item, typeMapping)};`;
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
    [key: string]: any;
${fields}
${rels.join("\n")}
  }
  `;
    });
    let sc = new FS("system");
    sc.WriteFile(`/${namespace}_types.ts`, codes.join("\n"));
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
function getTsType(tabName, column, typeMapping) {
    let type = "any";
    if (column.type === "enum") {
        if (!column.option) {
            console.log(`column: ${column.name} in ${tabName} type is enum,but no options, fallback to string`);
            type = "string";
        }
        else {
            type = column.option?.map((item) => `"${item}"`).join(" | ");
        }
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
        json: "any[]",
        JSON: "string", //使用大写的JSON区分小写的json
    };
}
