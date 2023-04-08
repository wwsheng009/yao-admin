// import { Studio } from "yao-node-client";
/**
 * yao studio run model.column.utils.MakeColumnOrder
 * @param columns 类型定义数据列
 * @returns 排序后的数据列
 */
function MakeColumnOrder(columns) {
    const typeMapping = Studio("model.column.component.GetDBTypeMap");
    let columnsBefore = [];
    //json或是textarea控件放在最后
    let columnsAfter = [];
    columns.forEach((column) => {
        if (["TextArea"].includes(typeMapping[column.type]) ||
            column.type === "json") {
            columnsAfter.push(column);
        }
        else {
            columnsBefore.push(column);
        }
    });
    return columnsBefore.concat(columnsAfter);
}
