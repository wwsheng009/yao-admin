// import { Studio } from "yao-node-client";
/**
 * 数据库类型与控件类型对应字段
 * yao studio run model.column.component.GetTypes
 * @returns
 */
function GetTypes() {
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
 * yao studio run model.column.component.Hidden
 * @param isTable true获取Table页面排除,false获取form布局排除字段
 * @returns 排除字段列表
 */
function HiddenFields(isTable) {
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
/**
 * yao studio model.column.component.FilterFields
 * @returns
 */
function FilterFields() {
    return ["name", "title", "_sn"];
}
/**
 * 把模型中的option定义转换成控件select option对象
 * yao studio run model.column.component.Enum
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
/**
 *updateComponentFromModel
 * yao studio run model.column.component.ModelXgen
 * @param component 更新组件
 * @param column 模型定义列
 * @param modelDsl 模型定义
 * @param type 更新类型
 * @returns
 */
function ModelXgen(component, column, modelDsl, type) {
    if (!component ||
        !modelDsl ||
        !modelDsl?.xgen ||
        !(column.name in modelDsl?.xgen)) {
        return component;
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
    return component;
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
        return target;
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
/**
 * yao run studio model.column.component.EditPropes
 * 更新一些编辑属性
 * @param component
 * @param column
 */
function EditPropes(component, column) {
    if (!component.edit) {
        return component;
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
    return component;
}
