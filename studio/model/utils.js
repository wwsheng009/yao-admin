// import { Process } from "yao-node-client";
let DbType = "";
function getDBType() {
    if (DbType === "") {
        DbType = Process("utils.env.Get", "YAO_DB_DRIVER");
    }
    return DbType;
}
/**
 * yao studio run model.utils.IsMysql
 * @returns boolean
 */
function IsMysql() {
    return /mysql/i.test(getDBType());
}
/**
 * 合并两个js对象，并返回新对象。
 * yao studio run model.utils.MergeObject
 * @param target 目标对象
 * @param source 源对象
 * @returns
 */
function MergeObject(target, source) {
    if (target === null ||
        target === undefined ||
        typeof target !== "object" ||
        source === null || //mybe undefined
        source === undefined ||
        typeof source !== "object") {
        return target;
    }
    for (const [key, value] of Object.entries(source)) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (target[key] &&
                typeof target[key] === "object" &&
                typeof value === "object" &&
                !Array.isArray(value)) {
                MergeObject(target[key], value);
            }
            else if (Array.isArray(target[key]) && Array.isArray(value)) {
                target[key].push(...value);
            }
            else {
                target[key] = value;
            }
        }
        else {
            target[key] = value;
        }
    }
    return target;
}
