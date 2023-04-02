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
