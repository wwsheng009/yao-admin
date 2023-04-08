// import { Process, Studio } from "yao-node-client";
/**
 * yao studio run ddic.generator.GenerateModelFile
 * @param modelid model id
 */
function GenerateModelFile(modelid) {
    const model = Process("models.ddic.model.Find", modelid, {
        withs: {
            columns: { withs: { element: {} } },
        },
    });
    // console.log(model);
    const m = DBModelToYaoModel(model);
    return SaveModelToFile(m);
}
function DBModelToYaoModel(model_ddic) {
    let model = {
        table: {},
        option: {},
        relations: {},
        columns: [],
    };
    model.name = model_ddic.name;
    if (model_ddic.comment != null) {
        model.comment = model_ddic.comment;
    }
    if (model_ddic.table_name != null) {
        model.table.name = model_ddic.table_name;
    }
    if (!model.table.name) {
        model.table.name = Studio("model.file.UnderscoreName", model.name);
    }
    if (!model.table.comment) {
        model.table.comment = model.comment;
    }
    if (model_ddic.table_comment != null) {
        model.table.comment = model_ddic.table_comment;
    }
    if (model_ddic.soft_deletes != null) {
        model.option.soft_deletes = model_ddic.soft_deletes ? true : false;
    }
    if (model_ddic.timestamps != null) {
        model.option.timestamps = model_ddic.timestamps ? true : false;
    }
    model_ddic.relations?.forEach((rel) => {
        model.relations[rel.name] = rel;
        model.relations[rel.name].query = JSON.parse(rel.query);
    });
    model_ddic.columns?.forEach((col) => {
        delete col.id;
        delete col.model_id;
        ["index", "nullable", "unique"].forEach((key) => {
            if (col[key] != null) {
                col[key] = col[key] ? true : false;
            }
        });
        let col1 = col;
        if (col.element_id) {
            col.element = Process("models.ddic.element.Find", col.element_id, {});
            ["type", "length", "scale", "precision", "comment"].forEach((field) => {
                if (!col[field] && col.element[field]) {
                    col[field] = col.element[field];
                }
            });
            col1.validations = col.element?.validations;
            if (col.element?.options) {
                col1.option = [];
                col.element.options.forEach((opt) => {
                    col1.option.push(opt.value);
                });
                delete col.element?.options;
            }
            delete col.element;
            delete col.element_id;
        }
        model.columns.push(col1);
    });
    model = ClearFalsyKeys(model);
    return model;
}
function SaveModelToFile(modelDsl) {
    let table_name = Studio("model.file.SlashName", modelDsl.table.name);
    if (/^ddic/i.test(table_name)) {
        return "不要覆盖系统默认模型";
    }
    const table_file_name = table_name + ".mod.json";
    Studio("model.file.MoveAndWrite", "models", table_file_name, modelDsl);
    return "保存成功";
}
function ClearFalsyKeys(target) {
    if (target === null || target === undefined || typeof target !== "object") {
        return target;
    }
    if (Object.keys(target).length == 0) {
        // Fix 1: Return empty object if there are no keys
        return {};
    }
    const result = Array.isArray(target) ? [] : {}; // Fix 2: Create new object/array
    for (let key in target) {
        const value = target[key];
        if (!value && value !== false) {
            // Fix 3: Check for all falsy values
            continue;
        }
        if (Array.isArray(value)) {
            const newArray = value.map((item) => ClearFalsyKeys(item));
            result[key] = newArray.filter((item) => Boolean(item)); // remove falsy values from array
        }
        else if (typeof value === "object") {
            result[key] = ClearFalsyKeys(value); //Fix 4: Assign the returned value to result
        }
        else {
            result[key] = value;
        }
    }
    return result; //Fix 2: return new object/array
}
