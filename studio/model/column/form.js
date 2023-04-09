// import { Studio } from "yao-node-client";
/**
 * yao studio run model.column.form.toForm
 * @param modelDsl model dsl
 * @returns new form dsl
 */
function toForm(modelDsl, type = "view") {
    const copiedObject = JSON.parse(JSON.stringify(modelDsl.columns));
    let columns = copiedObject || [];
    const table_dot_name = Studio("model.file.DotName", modelDsl.table.name);
    const actions = [
        {
            title: "切换全屏",
            icon: "icon-maximize-2",
            showWhenAdd: true,
            showWhenView: true,
            action: [
                {
                    name: "Fullscreen",
                    type: "Form.fullscreen",
                    payload: {},
                },
            ],
        },
        {
            title: "重新生成代码",
            icon: "icon-layers",
            showWhenAdd: true,
            showWhenView: true,
            action: [
                {
                    name: "StudioModel",
                    type: "Studio.model",
                    payload: { method: "CreateOne", args: [table_dot_name] },
                },
                {
                    name: "Confirm",
                    type: "Common.confirm",
                    payload: {
                        title: "提示",
                        content: "处理完成",
                    },
                },
            ],
        },
        {
            title: "返回",
            icon: "icon-arrow-left",
            showWhenAdd: true,
            showWhenView: true,
            action: [
                {
                    name: "CloseModal",
                    type: "Common.closeModal",
                    payload: {},
                },
            ],
        },
        {
            title: "保存",
            icon: "icon-check",
            style: "primary",
            showWhenAdd: true,
            action: [
                {
                    name: "Submit",
                    type: "Form.submit",
                    payload: {},
                },
                {
                    name: "Back",
                    type: "Common.closeModal",
                    payload: {},
                },
            ],
        },
        {
            icon: "icon-trash-2",
            style: "danger",
            title: "Delete",
            action: [
                {
                    name: "Confirm",
                    type: "Common.confirm",
                    payload: {
                        title: "提示",
                        content: "确认删除，删除后数据无法恢复？",
                    },
                },
                {
                    name: "Delete",
                    payload: {
                        model: table_dot_name,
                    },
                    type: "Form.delete",
                },
                {
                    name: "Back",
                    type: "Common.closeModal",
                    payload: {},
                },
            ],
        },
    ];
    let formTemplate = {
        name: modelDsl.name || "表单",
        action: {
            bind: {
                model: table_dot_name,
                option: { withs: {} },
            },
        },
        layout: {
            primary: "id",
            actions,
            form: {
                props: {},
                sections: [
                    {
                        columns: [],
                    },
                ],
            },
        },
        fields: {
            form: {},
        },
    };
    columns = Studio("model.column.utils.MakeColumnOrder", columns);
    columns.forEach((column) => {
        let form = Cast(column, modelDsl);
        if (form) {
            form.layout.forEach((tc) => {
                if (tc.width < 24) {
                    formTemplate.layout.form.sections[0].columns.push(tc);
                }
                else {
                    formTemplate = AddTabColumn(formTemplate, tc);
                }
            });
            form.fields.forEach((ft) => {
                formTemplate.fields.form[ft.name] = ft.component;
            });
        }
    });
    formTemplate.action.bind.option.withs = Studio("model.relation.GetWiths", modelDsl);
    formTemplate = updateReference(formTemplate, modelDsl);
    if (type === "view") {
        formTemplate = Studio("model.relation.Table", formTemplate, modelDsl);
    }
    else {
        formTemplate = Studio("model.relation.List", formTemplate, modelDsl);
    }
    formTemplate = mergeFormTemplateFromModel(formTemplate, modelDsl);
    return formTemplate;
}
/**
 * yao studio run model.column.form.AddTabColumn
 * @param formTemplate form template
 * @param column column
 * @returns new form template
 */
function AddTabColumn(formTemplate, column) {
    let section = formTemplate.layout.form.sections.find((sec) => sec.columns?.find((col) => col.tabs != null));
    if (section) {
        let col = section.columns.find((col) => col.tabs != null);
        col.tabs.push({
            title: column.name,
            columns: [column],
        });
    }
    else {
        formTemplate.layout.form.sections.push({
            columns: [
                {
                    name: "列表",
                    tabs: [{ title: column.name, columns: [column] }],
                    width: 24,
                },
            ],
        });
    }
    return formTemplate;
}
function mergeFormTemplateFromModel(formTemplate, modelDsl) {
    if (!modelDsl || !modelDsl?.xgen || !modelDsl?.xgen.form) {
        return formTemplate;
    }
    formTemplate = Studio("model.utils.MergeObject", formTemplate, modelDsl?.xgen.form);
    for (const key in formTemplate.fields.form) {
        const element = formTemplate.fields.form[key];
        if (element?.edit?.props?.ddic_hide) {
            delete formTemplate.fields.form[key];
        }
    }
    return formTemplate;
}
function updateReference(formTemplate, modelDsl) {
    const hasCount = Object.values(modelDsl.relations).filter((rel) => rel.type === "hasOne").length;
    if (hasCount === 0) {
        return formTemplate; // no need to modify the form if there are no 'hasOne' relations
    }
    formTemplate = Studio("model.utils.MergeObject", formTemplate, {
        layout: {
            form: {
                props: {
                    reference: {},
                },
            },
        },
    });
    const referenceContent = [];
    for (const rel in modelDsl.relations) {
        if (modelDsl.relations[rel].type === "hasOne") {
            referenceContent.push({
                name: modelDsl.relations[rel].label || rel,
                payload: {
                    Form: {
                        type: "view",
                        model: modelDsl.relations[rel].model,
                        id: `{{${modelDsl.relations[rel].foreign}}}`,
                    },
                },
            });
        }
    }
    if (hasCount === 1) {
        formTemplate.layout.form.props.reference.flatContent = {
            name: referenceContent[0].name,
            defaultOpen: false,
            payload: {
                Form: {
                    type: "view",
                    model: referenceContent[0].payload.Form.model,
                    id: `${referenceContent[0].payload.Form.id}`,
                },
            },
        };
    }
    else {
        formTemplate.layout.form.props.reference.floatContents = referenceContent;
    }
    return formTemplate;
}
/**
 *根据模型定义生成Form定义
 * yao studio run model.column.form.Cast
 * @param column 模型列定义
 * @param modelDsl 模型定义
 * @param type 类型
 * @returns
 */
function Cast(column, modelDsl) {
    const types = Studio("model.column.component.GetDBTypeMap");
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
    let width = 8;
    const bind = name;
    if (column.type == "json") {
        component = {
            bind: bind,
            edit: {
                props: {
                    language: "json",
                    height: 200,
                },
                type: "CodeEditor",
            },
        };
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
    component = Studio("model.column.file.IsFormFile", column, component, modelDsl);
    component = Studio("model.relation.EditSelect", column, modelDsl, component);
    if (component.is_image) {
        width = 24;
    }
    delete component.is_image;
    component = Studio("model.column.component.EditPropes", component, column);
    component = updateFormCompModelXgen(component, column, modelDsl);
    if (!component.edit?.props?.ddic_hide) {
        res.layout.push({
            name: title,
            width: width,
        });
    }
    res.fields.push({
        name: title,
        component: component,
    });
    return res;
}
function updateFormCompModelXgen(component, column, modelDsl) {
    return Studio("model.column.component.UpdateModelXgenComp", component, column, modelDsl, "form");
}
