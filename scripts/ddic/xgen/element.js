// import { Process } from "yao-node-client";
/**
 * xgen form field onchange event
 * yao run scripts.ddic.xgen.element.onChange '::{"key":"type","value":"enum"}'
 * 根据界面的字段类型的值，更新界面配置
 * @param query 字段新旧值
 * @returns 新值与界面配置
 */
function onChange(query) {
    const { key, value } = query;
    let setting = Process("yao.form.Setting", "ddic.model.element"); // 根据新数值生成配置信息;
    if (!setting.form?.sections) {
        console.log("error! no sections found for ddic.model.element!");
        return {};
    }
    if (key === "type") {
        let columnsToFilter = ["长度", "校验规则"];
        switch (value) {
            case "ID":
            case "boolean":
                columnsToFilter = ["备注"];
                break;
            case "enum":
                columnsToFilter = ["可选项", "备注"];
                break;
            case "float":
            case "double":
            case "decimal":
                columnsToFilter = ["位数(含小数位)", "小数位位数", "校验规则"];
                break;
            case "integer":
            case "bigInteger":
                columnsToFilter = ["位数(含小数位)", "校验规则"];
                break;
            case "date":
            case "datetime":
                columnsToFilter = ["校验规则"];
                break;
        }
        columnsToFilter = columnsToFilter.concat(["描述", "数据类型", "备注"]);
        setting.form.sections = filterColumns(columnsToFilter, setting.form.sections);
    }
    return { setting };
}
/**
 * 根据字段名称列表筛选界面显示控件
 * @param fields 需要包含的字段列表
 * @param sections 配置节点
 * @returns 新配置节点
 */
function filterColumns(fields, sections) {
    if (!sections || !sections.length || !fields || !fields.length) {
        return sections;
    }
    let newSecs = [];
    sections.forEach((sec) => {
        let cols = [];
        sec.columns.forEach((col) => {
            //check tabs first
            if (col.hasOwnProperty("tabs")) {
                let tab = col;
                tab.tabs = filterColumns(fields, tab.tabs);
                if (tab.tabs?.length) {
                    cols.push(tab);
                }
            }
            else {
                let baseCol = col;
                if (fields.includes(baseCol.name)) {
                    cols.push(baseCol);
                }
            }
        });
        if (cols.length) {
            //don't forget the title for tabs
            newSecs.push({ columns: cols, title: sec.title });
        }
    });
    return newSecs;
}
