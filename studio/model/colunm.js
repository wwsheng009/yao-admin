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
        tinyInteger: "InputNumber",
        tinyIncrements: "InputNumber",
        unsignedTinyInteger: "InputNumber",
        smallInteger: "InputNumber",
        unsignedSmallInteger: "InputNumber",
        integer: "InputNumber",
        bigInteger: "InputNumber",
        decimal: "InputNumber",
        unsignedDecimal: "InputNumber",
        float: "InputNumber",
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
    columns = MakeColumnOrder(columns);
    columns.forEach((column) => {
        let col = castFormColumn(column, modelDsl, "list");
        if (col) {
            col.layout.forEach((tc) => {
                listTemplate.layout.list.columns.push(tc);
            });
            col.fields.forEach((c) => {
                // delete c.component.withs;
                listTemplate.fields.list[c.name] = c.component;
            });
        }
    });
    // listTemplate.action.bind.option.withs = Studio("model.selector.GetWiths", modelDsl);
    return listTemplate;
}
//create table from model
function toTable(modelDsl) {
    const copiedObject = JSON.parse(JSON.stringify(modelDsl.columns));
    let columns = copiedObject || [];
    const table_dot_name = Studio("model.file.DotName", modelDsl.table.name);
    let tableTemplate = {
        name: modelDsl.name || "表格",
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
    columns = MakeColumnOrder(columns);
    columns.forEach((column) => {
        let col = castTableColumn(column, modelDsl);
        if (col) {
            col.layout.table.columns.forEach((tc) => {
                tableTemplate.layout.table.columns.push(tc);
            });
            col.fields.table.forEach((c) => {
                // let cop = c.component.withs || [];
                // cop.forEach((fct: { name: string }) => {
                //   tableTemplate.action.bind.option.withs[fct.name] = {};
                // });
                // delete c.component.withs;
                tableTemplate.fields.table[c.name] = c.component;
            });
            col.fields.filter.forEach((ff) => {
                tableTemplate.layout.filter.columns.push({ name: ff.name, width: 4 });
                tableTemplate.fields.filter[ff.name] = ff.component;
            });
        }
    });
    tableTemplate.action.bind.option.withs = Studio("model.selector.GetWiths", modelDsl);
    return tableTemplate;
}
/**
 * 更新一些编辑属性
 * @param component
 * @param column
 */
function updateViewSwitchPropes(component, column) {
    if (!component.view) {
        return;
    }
    if (column.type !== "Switch") {
        return;
    }
    component.view.props = component.view.props || {};
    const { unique, nullable, default: columnDefault, type } = column;
    if (unique || (!columnDefault && !nullable)) {
        component.view.props.itemProps = { rules: [{ required: true }] };
    }
    if (column.comment) {
        component.view.props["itemProps"] = component.edit.props["itemProps"] || {};
        component.view.props["itemProps"]["tooltip"] = column.comment;
    }
    if (column.default != null) {
        const ismysql = Studio("model.utils.IsMysql");
        const defaultValue = ismysql && type === "Switch" ? (column.default ? 1 : 0) : column.default;
        component.view.props["defaultValue"] = defaultValue;
        component.view.props["value"] = defaultValue;
    }
}
/**
 * 更新一些编辑属性
 * @param component
 * @param column
 */
function updateEditPropes(component, column) {
    if (!component.edit) {
        return;
    }
    component.edit.props = component.edit.props || {};
    const { unique, nullable, default: columnDefault, type } = column;
    if (/^id$/i.test(type)) {
        component.edit.props.itemProps = {};
    }
    else if (unique || (columnDefault == null && !nullable)) {
        //这里不要判断同时 == null || == undefined
        component.edit.props.itemProps = { rules: [{ required: true }] };
    }
    if (column.comment) {
        component.edit.props["itemProps"] = component.edit.props["itemProps"] || {};
        component.edit.props["itemProps"]["tooltip"] = column.comment;
    }
    if (column.default != null) {
        const ismysql = Studio("model.utils.IsMysql");
        const defaultValue = ismysql && type === "boolean" ? (column.default ? 1 : 0) : column.default;
        component.edit.props["defaultValue"] = defaultValue;
        if (["RadioGroup", "Select"].includes(column.type)) {
            component.edit.props["value"] = defaultValue;
        }
        if (component.view && ["Switch"].includes(column.type)) {
            component.view.props["value"] = defaultValue;
        }
    }
}
function castTableColumn(column, modelDsl) {
    // const props = column.props || {};
    let title = column.label || column.name;
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
    const bind = name;
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
    let width = 160;
    if (title.length > 5) {
        width = 250;
    }
    // 如果是json的,去看看是不是图片文件
    if (column.type === "json") {
        component = Studio("model.file.File", column, false);
        if (!component) {
            //可以再优化下
            component = {
                bind: bind,
                view: {
                    compute: "scripts.ddic.compute.json.View",
                    props: {},
                    type: "Tooltip",
                },
                edit: {
                    props: {},
                    compute: "scripts.ddic.compute.json.Edit",
                    type: "TextArea",
                },
            };
        }
        // log.Error("castTableColumn: Type %s does not support", column.type);
    }
    else if (column.type === "enum") {
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
    }
    else if (column.type === "boolean") {
        let checkedValue = true;
        let unCheckedValue = false;
        const ismysql = Studio("model.utils.IsMysql");
        if (ismysql) {
            checkedValue = 1;
            unCheckedValue = 0;
        }
        component = {
            bind: bind,
            view: {
                type: "Switch",
                props: {
                    checkedChildren: "是",
                    checkedValue: checkedValue,
                    unCheckedChildren: "否",
                    unCheckedValue: unCheckedValue,
                },
            },
        };
    }
    else if (/color/i.test(column.name)) {
        component.edit.type = "ColorPicker";
        width = 80;
    }
    else if (column.crypt === "PASSWORD") {
        component.edit.type = "Password";
        width = 180;
    }
    else {
        if (column.type in typeMapping) {
            component.edit.type = typeMapping[column.type];
        }
    }
    //检查是否下拉框显示
    component = Studio("model.selector.Select", column, modelDsl, component);
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
    // component = Studio("model.file.File", column, component);
    updateEditPropes(component, column);
    updateViewSwitchPropes(component, column);
    updateTableComponentFromModel(component, column, modelDsl);
    res.layout.table.columns.push({
        name: title,
        width: width,
    });
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
function toForm(modelDsl) {
    const copiedObject = JSON.parse(JSON.stringify(modelDsl.columns));
    let columns = copiedObject || [];
    const table_dot_name = Studio("model.file.DotName", modelDsl.table.name);
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
    let tableTemplate = {
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
    columns = MakeColumnOrder(columns);
    columns.forEach((column) => {
        let col = castFormColumn(column, modelDsl);
        if (col) {
            // col.layout.filter.columns.forEach((fc) => {});
            col.layout.forEach((tc) => {
                tableTemplate.layout.form.sections[0].columns.push(tc);
            });
            col.fields.forEach((ft) => {
                // let cop = ft.component.withs || [];
                // cop.forEach((fct: { name: string | number }) => {
                //   tableTemplate.action.bind.option.withs[fct.name] = {};
                // });
                // delete ft.component.withs;
                tableTemplate.fields.form[ft.name] = ft.component;
            });
            // col.fields.filter.forEach((ff) => {});
        }
    });
    tableTemplate.action.bind.option.withs = Studio("model.selector.GetWiths", modelDsl);
    tableTemplate = Studio("model.selector.List", tableTemplate, modelDsl);
    return tableTemplate;
}
function MakeColumnOrder(columns) {
    const typeMapping = getType();
    let columns1 = [];
    let columns2 = [];
    columns.forEach((column) => {
        if (["TextArea"].includes(typeMapping[column.type]) ||
            column.type === "json") {
            columns2.push(column);
        }
        else {
            columns1.push(column);
        }
    });
    return columns1.concat(columns2);
}
/**根据模型定义生成Form定义 */
function castFormColumn(column, modelDsl, type = "form") {
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
    let width = 8;
    const bind = name;
    if (column.type == "json") {
        component = Studio("model.file.FormFile", column, false, modelDsl);
        if (!component) {
            component = {
                bind: bind,
                edit: {
                    props: {
                        language: "json",
                        height: 200,
                    },
                    compute: "scripts.ddic.compute.json.Edit",
                    type: "CodeEditor",
                },
            };
        }
    }
    else if (column.type == "enum") {
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
    component = Studio("model.selector.EditSelect", column, modelDsl, component);
    component = Studio("model.file.FormFile", column, component, modelDsl);
    if (component.is_image) {
        width = 24;
    }
    res.layout.push({
        name: title,
        width: width,
    });
    delete component.is_image;
    updateEditPropes(component, column);
    if (type === "form") {
        updateFormComponentFromModel(component, column, modelDsl);
    }
    else if (type === "list") {
        updateListComponentFromModel(component, column, modelDsl);
    }
    res.fields.push({
        name: title,
        component: component,
    });
    return res;
}
function updateFormComponentFromModel(component, column, modelDsl) {
    return updateComponentFromModel(component, column, modelDsl, "form");
}
function updateTableComponentFromModel(component, column, modelDsl) {
    return updateComponentFromModel(component, column, modelDsl, "table");
}
function updateListComponentFromModel(component, column, modelDsl) {
    return updateComponentFromModel(component, column, modelDsl, "list");
}
function updateComponentFromModel(component, column, modelDsl, type) {
    if (!component ||
        !modelDsl ||
        !modelDsl?.xgen ||
        !(column.name in modelDsl?.xgen)) {
        return;
    }
    const config = modelDsl?.xgen[column.name];
    switch (type) {
        case "form":
            component.edit = mergeObjects(component.edit, config.form?.edit);
            break;
        case "table":
            component.view = mergeObjects(component.view, config.table?.view);
            component.edit = mergeObjects(component.edit, config.table?.edit);
            break;
        case "list":
            component.edit = mergeObjects(component.edit, config.list?.edit);
            break;
        default:
            break;
    }
}
/**
 * 合并两个js对象，并返回新对象。
 * @param target 目标对象
 * @param source 源对象
 * @returns
 */
function mergeObjects(target, source) {
    if (typeof target !== "object" ||
        target == null || //mybe undefined
        typeof source !== "object" ||
        source == null //mybe undefined
    ) {
        return;
    }
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            if (target[key] &&
                typeof target[key] === "object" &&
                typeof source[key] === "object") {
                target[key] = mergeObjects(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
}
