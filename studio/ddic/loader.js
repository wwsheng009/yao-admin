// import { FS, Process, Studio } from "yao-node-client";
function LoadModel(modelDsls) {
    modelDsls.forEach((modelDsl) => {
        let tableName = Studio("model.file.DotName", modelDsl.table.name);
        const { data } = Process("models.ddic.model.Paginate", {
            wheres: [{ column: "table_name", value: tableName }],
            with: {},
        }, 1, 1);
        let id = data?.id;
        let model = { id, ...data, ...modelDsl, ...modelDsl.option };
        model.table_name = tableName;
        model.model_comment = modelDsl.comment;
        model.table_comment = modelDsl.table?.comment;
        id = Process("yao.form.Save", "ddic.model", model);
    });
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
