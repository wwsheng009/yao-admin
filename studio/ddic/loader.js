// import { FS, Process, Studio } from "yao-node-client";
function LoadModel(modelDsls) {
    modelDsls.forEach((modelDsl) => {
        let tableName = Studio("model.file.DotName", modelDsl.table.name);
        const { data } = Process("models.ddic.model.Paginate", {
            wheres: [{ column: "table_name", value: tableName }],
            with: {},
        }, 1, 1);
        let id = data?.id;
        let model = {
            id,
            ...data,
            // ...modelDsl,
            // ...modelDsl.option,
            // columns: modelDsl.columns,
        };
        //TODO map the columns
        model = UpdateTableFromDsl(model, modelDsl);
        id = Process("yao.form.Save", "ddic.model", model);
    });
}
function UpdateTableFromDsl(model, modelDsl) {
    let tableName = Studio("model.file.DotName", modelDsl.table.name);
    model.table_name = tableName.replaceAll(".", "_");
    model.model_comment = modelDsl.comment;
    model.table_comment = modelDsl.table?.comment;
    let dots = tableName.split(".");
    dots.pop();
    model.namespace = dots.join(".");
    model.name = tableName;
    model.soft_deletes = modelDsl.option?.soft_deletes ? true : false;
    model.timestamps = modelDsl.option?.timestamps ? true : false;
    model.columns = modelDsl.columns.map((item) => UpdateColumnFromDsl(item));
    if (modelDsl.relations) {
        model.relations = "";
    }
    let relations = [];
    for (const key in modelDsl.relations) {
        relations.push(UpdateRelationFromDsl(key, modelDsl.relations[key]));
    }
    model.relations = JSON.stringify(relations);
    return model;
}
function UpdateColumnFromDsl(modeCol) {
    return modeCol;
}
function UpdateRelationFromDsl(key, rel) {
    let data = rel;
    data.name = key;
    //must do this in case xgen will dump
    data.query = JSON.stringify(rel.query);
    return data;
}
/**
 * yao studio run ddic.loader.LoadModelFromFile
 */
function LoadModelFromFile() {
    const files = Studio("model.cmd.GetModelFnameList");
    const fs = new FS("dsl");
    const modelDsl = files.map((file) => {
        return JSON.parse(fs.ReadFile("models/" + file));
    });
    LoadModel(modelDsl);
}
function copyObject(target, source) {
    if (typeof target !== "object" ||
        target == null || //mybe undefined
        typeof source !== "object" ||
        source == null //mybe undefined
    ) {
        return target;
    }
    for (let key in source) {
        if (typeof source[key] === "object") {
            target[key] = {};
            copyObject(source[key], target[key]);
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}
