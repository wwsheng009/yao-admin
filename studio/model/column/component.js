// import { Studio } from "yao-node-client";
/**
 * 数据库类型与控件类型对应字段
 * yao studio run model.column.component.GetDBTypeMap
 * @returns
 */
function GetDBTypeMap() {
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
        hidden = ["del", "delete", "deleted", "deleted_at", "pwd", "deleted"];
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
        ];
    }
    return hidden;
}
/**
 * yao studio model.column.component.FilterFields
 * @returns
 */
function FilterFields() {
    return ["name", "title"];
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
 * 更新model xgen 设置中的组件设置
 *updateComponentFromModel
 * yao studio run model.column.component.UpdateModelXgenComp
 * @param component 更新组件
 * @param column 模型定义列
 * @param modelDsl 模型定义
 * @param type 更新类型
 * @returns
 */
function UpdateModelXgenComp(component, column, modelDsl, type) {
    if (!component || !modelDsl || !modelDsl?.xgen) {
        return component;
    }
    let config = null;
    switch (type) {
        case "form":
            config = modelDsl?.xgen?.form?.fields?.form[column.label];
            if (config) {
                component.edit = Studio("model.utils.MergeObject", component.edit, config?.edit);
            }
            break;
        case "table":
            config = modelDsl?.xgen?.table?.fields?.table[column.label];
            if (config) {
                component.view = Studio("model.utils.MergeObject", component.view, config?.view);
                component.edit = Studio("model.utils.MergeObject", component.edit, config?.edit);
            }
            break;
        case "list":
            config = modelDsl?.xgen?.list?.fields?.list[column.label];
            if (config) {
                component.edit = Studio("model.utils.MergeObject", component.edit, config?.edit);
            }
            break;
        default:
            break;
    }
    return component;
}
/**
 * yao run studio model.column.component.EditPropes
 * 更新一些编辑属性
 * @param component
 * @param column
 */
function EditPropes(component, column) {
    if (!component || !component.edit) {
        return component;
    }
    component.edit.props = component.edit.props || {};
    if (column.comment) {
        component.edit.props.itemProps = component.edit.props.itemProps || {};
        component.edit.props.itemProps.tooltip = column.comment;
    }
    const rules = GetRules(column, component);
    if (rules?.length) {
        component.edit.props.itemProps = {
            ...component.edit.props.itemProps,
            rules: [
                ...(component.edit.props.itemProps?.rules || []),
                ...(rules.length === 1 &&
                    component.edit.props.itemProps?.rules?.length === 1
                    ? [Object.assign(component.edit.props.itemProps.rules[0], rules[0])]
                    : rules),
            ],
        };
    }
    // 默认值
    if (column.default != null &&
        column.default != "TlVMTA==" &&
        component.edit.type !== "Upload") {
        component.edit.props.itemProps = component.edit.props.itemProps || {};
        const ismysql = Studio("model.utils.IsMysql");
        const defaultValue = ismysql && column.type === "boolean"
            ? column.default
                ? 1
                : 0
            : column.default;
        component.edit.props.itemProps.initialValue = defaultValue;
    }
    return component;
}
function GetRules(column, component) {
    const validationTypeMap = {
        string: "string",
        integer: "integer",
        float: "float",
        number: "number",
        datetime: "date",
        bool: "number",
    };
    const dbTypeToAntd = {
        // string: "string",有可能是json
        // char: "string",
        // text: "string",
        // mediumText: "string",
        // longText: "string",
        date: "date",
        datetime: "date",
        datetimeTz: "date",
        time: "date",
        timeTz: "date",
        timestamp: "date",
        timestampTz: "date",
        tinyInteger: "integer",
        tinyIncrements: "integer",
        unsignedTinyInteger: "integer",
        smallInteger: "integer",
        unsignedSmallInteger: "integer",
        integer: "integer",
        bigInteger: "integer",
        // decimal: "number", 过于严格
        // unsignedDecimal: "number",
        // float: "number",
        boolean: "boolean",
        enum: "enum",
        image: "array",
    };
    const rules = [];
    let rule = {};
    const { index, unique, nullable, default: columnDefault, type: dbColumnType, } = column;
    const antdType = dbTypeToAntd[dbColumnType];
    if (dbColumnType in dbTypeToAntd) {
        if (antdType === "enum") {
            rule.type = antdType;
            rule.enum = column.option;
        }
        else if (antdType !== null && antdType !== undefined) {
            rule.type = antdType;
        }
    }
    // if (column.length) {
    //MAX Length
    // rule.max = column.length;
    // }
    if (!/^id$/i.test(dbColumnType) &&
        (unique ||
            (!nullable &&
                (columnDefault === null ||
                    columnDefault === undefined ||
                    columnDefault === "TlVMTA==")))) {
        rule.required = true;
    }
    const validations = column.validations;
    if (validations && validations.length) {
        validations.forEach((validation) => {
            switch (validation.method) {
                case "typeof":
                    rule.type = validation.args.find((arg) => validationTypeMap[arg]);
                    break;
                case "maxLength":
                    if (validation.args && validation.args.length) {
                        rule.max = validation.args[0];
                    }
                    break;
                case "minLength":
                    if (validation.args && validation.args.length) {
                        rule.min = validation.args[0];
                    }
                    break;
                case "enum":
                    if (validation.args && validation.args.length) {
                        rule.type = "enum";
                        rule.enum = validation.args;
                    }
                    break;
                case "pattern":
                    if (validation.args && validation.args.length) {
                        rules.push({
                            pattern: validation.args[0],
                            message: validation.message,
                        });
                    }
                    break;
                default:
                    break;
            }
        });
    }
    //控件值跟数据库有关,不能使用boolean类型验证
    if (antdType === "boolean" &&
        ["RadioGroup", "Switch", "Select"].includes(component.edit.type)) {
        delete rule.type;
    }
    // if (rule?.type?.length > 0 || rule.required) {
    if (Object.keys(rule).length !== 0) {
        rules.push(rule);
    }
    // }
    return rules;
}
