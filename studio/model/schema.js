// import { Exception, log, Process, Studio } from "yao-node-client";
let AllTables = [];
/**yao studio run model.schema.GetTable role
 * 获取单个表字段
 * @param {*} name
 * @returns
 */
function GetTable(name) {
    return Process("schemas.default.TableGet", name);
}
/**
 * 获取所有表格名称
 */
function GetTableName() {
    if (AllTables.length) {
        return AllTables;
    }
    else {
        AllTables = Process("schemas.default.Tables");
    }
    return AllTables;
}
/**
 * 分析关联关系处理器
 * yao studio run model.schema.Relation
 */
function Relation() {
    const tableNameList = GetTableName();
    // 不需要的表格白名单
    const guards = ["xiang_menu", "xiang_user", "xiang_workflow", "pet"];
    const prefixList = TablePrefix(tableNameList);
    if (tableNameList.length > 80) {
        log.Error("Data tables cannot exceed 80!");
        throw new Exception("Data tables cannot exceed 80!", 500);
    }
    let tableList = [];
    for (const tableName of tableNameList) {
        // const tableName = tableNameList[i];
        if (guards.includes(tableName)) {
            continue;
        }
        const table = GetTable(tableName);
        let hasId = false;
        for (const column of table.columns) {
            const name = column.name.toLowerCase();
            if (name === "id") {
                hasId = true;
            }
            column.label = column.label ? FieldHandle(column.label) : column.name;
            switch (column.type.toUpperCase()) {
                case "DATETIME":
                    column.type = "datetime";
                    break;
                case "BIT":
                    column.type = "boolean";
                    break;
                case "MEDIUMINT":
                    column.type = "tinyInteger";
                    break;
                default:
                    break;
            }
        }
        // 如果没有id的表就不要显示了
        if (!hasId) {
            continue;
        }
        // 去除表前缀
        let name = ReplacePrefix(prefixList, tableName);
        // name = Studio("model.translate.translate", name);
        table.name = name;
        table.description = name;
        table.comment = name;
        table.table = {
            name: tableName,
            comment: name,
        };
        table.relations = {};
        let parent = Studio("relation.parent", tableName, table.columns, table);
        parent = Studio("model.relation.child", tableName, table.columns, parent);
        tableList.push(parent);
    }
    tableList = Studio("model.relation.other", tableList);
    //翻译字段
    tableList = Studio("model.translate.BatchModel", tableList);
    return tableList;
}
function FieldHandle(labelin) {
    if (labelin && labelin.length >= 8) {
        const label = labelin.replace(/[:：;；,，。].*/, "");
        return label;
    }
    return labelin;
}
//yao studio run model.schema.TablePrefix
//数据表前缀列表
function TablePrefix(allTableNames) {
    const prefixes = new Set();
    for (const tableName of allTableNames || GetTableName()) {
        const [prefix] = tableName.split("_");
        // Check if prefix is already in the set
        if (!prefixes.has(prefix) && prefix.length >= 3) {
            prefixes.add(prefix);
        }
    }
    return Array.from(prefixes);
}
// 把表前缀替换掉
function ReplacePrefix(prefix, target) {
    for (const p of prefix) {
        target = target.replace(`${p}_`, "");
    }
    return target;
}
