// import { log, Studio } from "yao-node-client";
/**
 * 数据库类型与控件类型对应字段
 * @returns
 */
function getType() {
    return {
        string: "Input",
        char: "Input",
        text: "TextArea",
        mediumText: "TextArea",
        longText: "TextArea",
        date: "DatePicker",
        datetime: "DatePicker",
        datetimeTz: "DatePicker",
        time: "DatePicker",
        timeTz: "DatePicker",
        timestamp: "DatePicker",
        timestampTz: "DatePicker",
        tinyInteger: "Input",
        tinyIncrements: "Input",
        unsignedTinyInteger: "Input",
        smallInteger: "Input",
        unsignedSmallInteger: "Input",
        integer: "Input",
        bigInteger: "Input",
        decimal: "Input",
        unsignedDecimal: "Input",
        float: "Input",
        boolean: "Input",
        enum: "Select",
    };
}
/**
 * 根据参数类型返回需要排除的字段列表
 * @param isTable true获取Table页面排除,false获取form布局排除字段
 * @returns 排除字段列表
 */
function Hidden(isTable) {
    let hidden = [];
    if (isTable) {
        // Table页面不展示的字段列表
        hidden = [
            "secret",
            "password",
            "del",
            "delete",
            "deleted",
            "deleted_at",
            "pwd",
            "deleted",
        ];
    }
    else {
        // Form页面不展示的字段列表
        hidden = [
            "del",
            "delete",
            "deleted",
            "deleted_at",
            "created_at",
            "updated_at",
            "id",
            "ID",
            "update_time",
            "password",
            "pwd",
        ];
    }
    return hidden;
}
function filter() {
    return ["name", "title", "_sn"];
}
//create table from model
function toTable(model_dsl) {
    const columns = model_dsl.columns || [];
    const table_dot_name = Studio("file.DotName", model_dsl.table.name);
    let tableTemplate = {
        name: model_dsl.name || "表格",
        action: {
            bind: {
                model: table_dot_name,
                option: { withs: {}, option: { form: table_dot_name } },
            },
        },
        layout: {
            primary: "id",
            header: { preset: {}, actions: [] },
            filter: {
                columns: [],
                actions: [
                    {
                        title: "添加",
                        icon: "icon-plus",
                        width: 3,
                        action: [
                            {
                                name: "OpenModal",
                                type: "Common.openModal",
                                payload: {
                                    Form: { type: "edit", model: table_dot_name },
                                },
                            },
                        ],
                    },
                ],
            },
            table: {
                columns: [],
                operation: {
                    fold: false,
                    actions: [
                        {
                            title: "查看",
                            icon: "icon-eye",
                            action: [
                                {
                                    payload: {
                                        Form: {
                                            model: table_dot_name,
                                            type: "view",
                                        },
                                    },
                                    name: "OpenModal",
                                    type: "Common.openModal",
                                },
                            ],
                        },
                        {
                            title: "编辑",
                            icon: "icon-edit-2",
                            action: [
                                {
                                    name: "OpenModal",
                                    type: "Common.openModal",
                                    payload: {
                                        Form: {
                                            type: "edit",
                                            model: table_dot_name,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            title: "删除",
                            icon: "icon-trash-2",
                            action: [
                                {
                                    name: "Confirm",
                                    type: "Common.confirm",
                                    payload: {
                                        title: "确认删除",
                                        content: "删除后不可撤销！",
                                    },
                                },
                                {
                                    name: "Delete",
                                    type: "Table.delete",
                                    payload: {
                                        model: table_dot_name,
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        fields: {
            filter: {},
            table: {},
        },
    };
    columns.forEach((column) => {
        let col = castTableColumn(column, model_dsl);
        // console.log("col:", col);
        if (col) {
            // col.layout.filter.columns.forEach((fc) => {});
            col.layout.table.columns.forEach((tc) => {
                tableTemplate.layout.table.columns.push(tc);
            });
            col.fields.table.forEach((c) => {
                let cop = c.component.withs || [];
                cop.forEach((fct) => {
                    tableTemplate.action.bind.option.withs[fct.name] = {};
                });
                delete c.component.withs;
                tableTemplate.fields.table[c.name] = c.component;
            });
            col.fields.filter.forEach((ff) => {
                tableTemplate.layout.filter.columns.push({ name: ff.name, width: 4 });
                tableTemplate.fields.filter[ff.name] = ff.component;
            });
            // col.fields.filter.forEach((ff) => {});
        }
        // col.fields.table.forEach((ft) => {
        //   tableTemplate.fields.table[ft.name] = ft.component;
        // });
    });
    return tableTemplate;
}
function castTableColumn(column, model_dsl) {
    // const props = column.props || {};
    const title = column.label || column.name;
    const name = column.name;
    // 不展示隐藏列
    let hidden = Hidden(true);
    if (hidden.indexOf(name) != -1) {
        // console.log("castTableColumn: hidden");
        return false;
    }
    const typeMapping = getType();
    if (!name) {
        // console.log("castTableColumn: missing name");
        log.Error("castTableColumn: missing name");
        return false;
    }
    if (!title) {
        // console.log("castTableColumn: missing title");
        log.Error("castTableColumn: missing title");
        return false;
    }
    let res = {
        layout: {
            filter: { columns: [] },
            table: { columns: [] },
        },
        fields: {
            filter: [],
            table: [],
        },
    };
    const bind = `${name}`;
    let component = {
        is_select: false,
        bind: name,
        view: { type: "Text", props: {} },
        edit: {
            type: "Input",
            bind: bind,
            props: {},
        },
    };
    let width = 200;
    if (title.length > 5) {
        width = 250;
    }
    // 如果是json的,去看看是不是图片文件
    if (column["type"] == "json") {
        component = Studio("file.File", column, false);
        if (!component) {
            return false;
        }
        // log.Error("castTableColumn: Type %s does not support", column.type);
    }
    else if (column["type"] == "enum") {
        component = {
            bind: bind,
            edit: {
                props: {
                    options: Enum(column["option"]),
                    placeholder: "请选择" + title,
                },
                type: "Select",
            },
            view: {
                props: {
                    options: Enum(column["option"]),
                    placeholder: "请选择" + title,
                },
                type: "Tag",
            },
        };
        res.layout.table.columns.push({
            name: title,
            width: width,
        });
    }
    else {
        if (column["type"] in typeMapping) {
            component.edit.type = typeMapping[column["type"]];
            res.layout.table.columns.push({
                name: title,
                width: width,
            });
        }
    }
    //检查是否下拉框显示
    component = Studio("selector.Select", column, model_dsl, component);
    // 如果是下拉的,则增加查询条件
    if (component.is_select) {
        const where_bind = "where." + name + ".in";
        res.fields.filter.push({
            name: title,
            component: {
                bind: where_bind,
                edit: component.edit,
            },
        });
    }
    else {
        const filter_target = filter();
        for (const f in filter_target) {
            if (name.indexOf(filter_target[f]) != -1) {
                res.fields.filter.push({
                    name: title,
                    component: {
                        bind: "where." + name + ".match",
                        edit: {
                            type: "Input",
                            compute: "Trim",
                            props: { placeholder: "请输入" + title },
                        },
                    },
                });
            }
        }
    }
    component = Studio("file.File", column, component);
    // component.edit = { type: "input", props: { value: bind } };
    // res.list.columns.push({ name: title });
    // res.edit.push({ name: title, width: 24 });
    // break;
    delete component.is_select;
    res.fields.table.push({
        name: title,
        component: component,
    });
    return res;
}
/**
 * 把模型中的option定义转换成控件select option对象
 * @param option 选择列表
 * @returns
 */
function Enum(option) {
    let res = [];
    for (const i in option) {
        res.push({ label: "::" + option[i], value: option[i] });
    }
    return res;
}
function toForm(model_dsl) {
    const table_dot_name = Studio("file.DotName", model_dsl.table.name);
    const actions = [
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
    const columns = model_dsl.columns || [];
    let tableTemplate = {
        name: model_dsl.name || "表单",
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
    /**
     *let res = {
      layout: [],
      fields: {},
    };
     */
    columns.forEach((column) => {
        let col = castFormColumn(column, model_dsl);
        if (col) {
            // col.layout.filter.columns.forEach((fc) => {});
            col.layout.forEach((tc) => {
                tableTemplate.layout.form.sections[0].columns.push(tc);
            });
            col.fields.forEach((ft) => {
                let cop = ft.component.withs || [];
                cop.forEach((fct) => {
                    tableTemplate.action.bind.option.withs[fct.name] = {};
                });
                delete ft.component.withs;
                tableTemplate.fields.form[ft.name] = ft.component;
            });
            // col.fields.filter.forEach((ff) => {});
        }
    });
    tableTemplate = Studio("selector.Table", tableTemplate, model_dsl);
    return tableTemplate;
}
/**根据模型定义生成Form定义 */
function castFormColumn(column, model_dsl) {
    const types = getType();
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
    const hidden = Hidden(false);
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
    const bind = `${name}`;
    if (column["type"] == "json") {
        component = Studio("file.FormFile", column, false, model_dsl);
        if (!component) {
            // log.Error("castTableColumn: Type %s does not support", column.type);
            return false;
        }
    }
    else if (column["type"] == "enum") {
        component = {
            bind: bind,
            edit: {
                props: {
                    options: Enum(column["option"]),
                    placeholder: "请选择" + title,
                },
                type: "Select",
            },
        };
    }
    else {
        if (column["type"] in types) {
            component.edit.type = types[column["type"]];
        }
    }
    let width = 8;
    component = Studio("selector.EditSelect", column, model_dsl, component);
    component = Studio("file.FormFile", column, component, model_dsl);
    if (component["is_image"]) {
        width = 24;
    }
    res.layout.push({
        name: title,
        width: width,
    });
    // component.edit = { type: "input", props: { value: bind } };
    // res.list.columns.push({ name: title });
    // res.edit.push({ name: title, width: 24 });
    // break;
    delete component["is_image"];
    res.fields.push({
        name: title,
        component: component,
    });
    return res;
}
