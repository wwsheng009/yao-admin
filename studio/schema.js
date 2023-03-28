// import { Exception, log, Process, Studio } from "yao-node-client";
let AllTables = [];
/**yao studio run schema.GetTable role
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
 * @param {*} type
 * yao studio run schema.Relation
 */
function Relation() {
    let all_table = GetTableName();
    let table_num = all_table.length;
    if (table_num > 80) {
        log.Error("Data tables cannot exceed 80!");
        throw new Exception("Data tables cannot exceed 80!", 500);
    }
    let table_arr = [];
    // 不需要的表格白名单
    let guards = ["xiang_menu", "xiang_user", "xiang_workflow", "pet"];
    let prefix = TablePrefix(all_table);
    for (let i = 0; i < all_table.length; i++) {
        //   const element = all_table[index];
        // }
        // for (let i in all_table) {
        if (guards.indexOf(all_table[i]) != -1) {
            continue;
        }
        //console.log(`process table Relation:${all_table[i]}`);
        const table = GetTable(all_table[i]);
        // col.columns = Studio("relation.BatchTranslate", col.columns);
        // console.log(col.columns);
        // return;
        let id_flag = false;
        for (const column of table.columns) {
            const name = column.name.toLowerCase();
            if (name === "id") {
                id_flag = true;
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
                    // do nothing
                    break;
            }
        }
        // 如果没有id的表就不要显示了
        if (!id_flag) {
            all_table.splice(i, 1);
            continue;
        }
        // 去除表前缀
        let trans = ReplacePrefix(prefix, all_table[i]);
        table.name = Studio("relation.translate", trans);
        table.decription = table.name;
        table.table = {};
        table.table.name = all_table[i];
        // console.log("col.table.name", col.table.name);
        table.table.comment = table.name;
        table.relations = {};
        let parent = Studio("relation.parent", all_table[i], table.columns, table);
        parent = Studio("relation.child", all_table[i], table.columns, parent);
        table_arr.push(parent);
    }
    table_arr = Studio("relation.other", table_arr);
    // console.log("debugger:===>relation.BatchModel");
    table_arr = Studio("relation.BatchModel", table_arr);
    // console.log("debugger:===>relation.BatchModel down");
    return table_arr;
}
function FieldHandle(labelin) {
    if (labelin && labelin.length >= 8) {
        const label = labelin.replace(/[:：;；,，。].*/, "");
        return label;
    }
    return labelin;
}
//yao studio run schema.TablePrefix
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
    if (prefix.length) {
        for (let i in prefix) {
            target = target.replace(prefix[i] + "_", "");
        }
    }
    return target;
}
