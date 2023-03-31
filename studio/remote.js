// import { FS, Process, Studio } from "yao-node-client";
/**
 * //根据关联关系找到列，并查找列对应的模型
 * yao studio run remote.select
 * @param relation_name
 * @param relation
 * @returns
 */
function select(relation_name, releation) {
    //首先从关联关系的模型中找到模型
    let model = Studio("model.Get", releation.model);
    if (!model) {
        model = Process("schemas.default.TableGet", relation_name);
    }
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
