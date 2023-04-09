// import { Exception, log, Process, Studio } from "yao-node-client";
let AllTables = [];
/**
 * 获取数据库中单个表字段
 *
 * yao studio run model.schema.GetTable tablename
 * @param {*} name
 * @returns
 */
function GetTable(name) {
    return Process("schemas.default.TableGet", name);
}
/**
 * yao studio run model.schema.GetTableName
 *
 * 获取数据库中所有表格名称
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
 * 分析数据库表之间的关联关系
 *
 * yao studio run model.schema.Relation
 */
function Relation() {
    const tableNameList = GetTableName();
    // 不需要的表格白名单
    const guards = ["xiang_menu", "xiang_user", "xiang_workflow", "pet"];
    const prefixList = TablePrefix(tableNameList);
    if (tableNameList.length > 180) {
        log.Error("Data tables cannot exceed 180!");
        throw new Exception("Data tables cannot exceed 180!", 500);
    }
    let tableList = [];
    for (const tableName of tableNameList) {
        // const tableName = tableNameList[i];
        if (guards.includes(tableName)) {
            console.log(`忽略系统表：${tableName}`);
            continue;
        }
        if (tableName.startsWith("ddic")) {
            console.log(`忽略系统表：${tableName}`);
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
        let parent = Studio("model.relation.parent", tableName, table.columns, table);
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
