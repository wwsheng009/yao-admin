// import { FS, Process, Studio } from "yao-node-client";
function select(relation_name, relation) {
    let model = Process("schemas.default.TableGet", relation_name);
    const columns = model.columns;
    let res = Speculation(columns);
    if (!res) {
        res = Other(columns);
    }
    //CreateScripts(relation_name, res, relation);
    return res;
}
/**
 * 字段推测
 * @param {*} column
 * @returns
 */
function Speculation(columns) {
    const target = ["name", "title"];
    for (const t of target) {
        const res = GetTarget(t, columns);
        if (res) {
            return res;
        }
    }
    return false;
}
function GetTarget(target, columns) {
    const columnNames = columns.map((col) => col.name);
    return columnNames.find((name) => name.includes(target)) ?? false;
}
/**
 * 没有其他的话,就找个string类型的
 * @param {*} columns
 * @returns
 */
function Other(columns) {
    const stringColumn = columns.find((col) => col.type === "string");
    return stringColumn?.name ?? "id";
}
/**
 * 生成查询的js脚本
 * @param {*} relation_name
 * @param {*} name
 */
function CreateScripts(relation_name, name, relation) {
    const field_name = relation_name + ".js";
    const fs = new FS("script");
    const form_dsl = `export function GetSelect() {
    let query = new Query();
    let res = query.Get({
      select: ["id as value", "${name} as label"],
      from: "${relation.model}",
    });
    return res;
  }
  `;
    const dir = relation.model + "/" + field_name;
    //console.log(form_dsl);
    Studio("move.Move", "scripts", field_name);
    fs.WriteFile("/" + dir, form_dsl);
}
// export function GetSelect() {
//   let query = new Query();
//   let res = query.Get({
//     select: ["id as value", "${name} as label"],
//     from: "${relation_name}",
//   });
//   return res;
// }
