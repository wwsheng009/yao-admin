// import { Studio } from "yao-node-client";
function toList(modelDsl) {
    const copiedObject = JSON.parse(JSON.stringify(modelDsl.columns));
    let columns = copiedObject || [];
    const table_dot_name = Studio("model.file.DotName", modelDsl.table.name);
    let listTemplate = {
        name: modelDsl.name || "列表",
        action: {
            bind: {
                table: table_dot_name,
            },
        },
        layout: {
            list: {
                columns: [],
            },
        },
        fields: {
            list: {},
        },
    };
    //并不知道谁会调用列表，
    //不要显示外部关联ID
    // columns = columns.filter((col) => !/_id$/i.test(col.name));
    columns = Studio("model.column.utils.MakeColumnOrder", columns);
    columns.forEach((column) => {
        let form = Cast(column, modelDsl);
        if (form) {
            form.layout.forEach((tc) => {
                listTemplate.layout.list.columns.push(tc);
            });
            form.fields.forEach((c) => {
                listTemplate.fields.list[c.name] = c.component;
            });
        }
    });
    // listTemplate.action.bind.option.withs = Studio("model.relation.GetWiths", modelDsl);
    return listTemplate;
}
/**
 *根据模型定义生成Form定义
 * yao studio run model.column.list.Cast
 * @param column 模型列定义
 * @param modelDsl 模型定义
 * @param type 类型
 * @returns
 */
function Cast(column, modelDsl) {
    const types = Studio("model.column.component.GetTypes");
    const title = column.label || column.name;
    const name = column.name;
    if (!name) {
        //log.Error("castFormColumn: missing name");
        return false;
    }
    if (!title) {
        // log.Error("castFormColumn: missing title");
        return false;
    }
    // 不展示隐藏列
    const hidden = Studio("model.column.component.HiddenFields", false);
    if (hidden.indexOf(name) != -1) {
        return false;
    }
    let res = {
        layout: [],
        fields: [],
    };
    let component = {
        bind: name,
        edit: {
            type: "Input",
            props: {},
        },
    };
    let width = 6;
    const bind = name;
    if (column.type == "json") {
        component = Studio("model.column.file.IsFormFile", column, null, modelDsl);
        if (!component) {
            component = {
                bind: bind,
                edit: {
                    type: "TextArea",
                },
            };
        }
    }
    else if (column.type == "enum") {
        component = {
            bind: bind,
            edit: {
                props: {
                    options: Studio("model.column.component.Enum", column["option"]),
                    placeholder: "请选择" + title,
                },
                type: "Select",
            },
        };
    }
    else if (column.type === "boolean") {
        const ismysql = Studio("model.utils.IsMysql");
        let checkedValue = true;
        let unCheckedValue = false;
        if (ismysql) {
            checkedValue = 1;
            unCheckedValue = 0;
        }
        component = {
            bind: bind,
            edit: {
                type: "RadioGroup",
                props: {
                    options: [
                        {
                            label: "是",
                            value: checkedValue,
                        },
                        {
                            label: "否",
                            value: unCheckedValue,
                        },
                    ],
                },
            },
        };
    }
    else if (/color/i.test(column.name)) {
        component.edit.type = "ColorPicker";
    }
    else if (column.crypt === "PASSWORD") {
        component.edit.type = "Password";
    }
    else {
        if (column.type in types) {
            component.edit.type = types[column.type];
        }
    }
    if (["TextArea"].includes(types[column.type]) || column.type === "json") {
        width = 24;
    }
    component = Studio("model.relation.EditSelect", column, modelDsl, component);
    // component = Studio(
    //   "model.column.file.IsFormFile",
    //   column,
    //   component,
    //   modelDsl
    // );
    if (component.is_image) {
        width = 24;
    }
    res.layout.push({
        name: title,
        width: width,
    });
    delete component.is_image;
    component = Studio("model.column.component.EditPropes", component, column);
    component = updateListCompFromModelXgen(component, column, modelDsl);
    res.fields.push({
        name: title,
        component: component,
    });
    return res;
}
function updateListCompFromModelXgen(component, column, modelDsl) {
    return Studio("model.column.component.ModelXgen", component, column, modelDsl, "list");
}
