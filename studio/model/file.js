// import { FS } from "yao-node-client";
/**
 * 处理模型名称分隔符
 *
 * yao studio run model.file.DotName table_name
 * yao studio run model.file.DotName /file/name
 * @param {string} pathname
 * @returns model name with dot
 */
function DotName(pathname) {
    let str = pathname;
    str = str.replace(/\\/g, "/");
    str = str.replace(/\/\//g, "/");
    str = str.replace(/\//g, ".");
    str = str.replace(/-/g, ".");
    str = str.replace(/_/g, ".");
    let newStr = str.replace(/^\.+|\.+$/g, "");
    return newStr;
}
/**
 * 处理路径分隔符
 *
 * yao studio run model.file.SlashName crm_help
 * @param {string} pathname
 * @returns pathname
 */
function SlashName(pathname) {
    let str = pathname;
    str = str.replace(/\\/g, "/");
    str = str.replace(/_/g, "/");
    str = str.replace(/-/g, "/");
    str = str.replace(/\./g, "/");
    str = str.replace(/\/\//g, "/");
    let newStr = str.replace(/^\/+|\/+$/g, "");
    return newStr;
}
/**
 * 处理数据库表名分隔符
 *
 * yao studio run model.file.UnderscoreName crm.help
 * @param {string} pathname
 * @returns pathname
 */
function UnderscoreName(pathname) {
    let str = pathname;
    str = str.replace(/\\/g, "/");
    str = str.replace(/\/\//g, "/");
    str = str.replace(/\//g, "_");
    str = str.replace(/-/g, "_");
    str = str.replace(/\./g, "_");
    let newStr = str.replace(/^_+|_+$/g, "");
    return newStr;
}
/**
 * 转换成有效的文件名称
 *
 * yao studio run model.file.FileNameConvert "/models/cms__help.mod.json"
 * @param {string} filename
 * @returns new filename
 */
function FileNameConvert(filename) {
    const str = filename.replace(/[\\_-]/g, "/");
    const arr = str.split(".");
    if (arr.length < 3) {
        return str;
    }
    const suffix = arr.slice(-2);
    const header = arr.slice(0, -2);
    const str1 = header.join("/") + "." + suffix.join(".");
    return str1.replace(/\/\//g, "/");
}
/**
 * 在scripts目录写入脚本内容
 *
 * yao studio run model.file.WriteScript
 * @param filename 脚本名称
 * @param scripts 脚本内容
 */
function WriteScript(filename, scripts) {
    let fs = new FS("script");
    if (!fs.Exists(filename)) {
        const folder = filename.split("/").slice(0, -1).join("/");
        if (!fs.Exists(folder)) {
            fs.MkdirAll(folder);
        }
    }
    const res = fs.WriteFile(filename, scripts);
    if (res && res.code && res.message) {
        console.log(`创建脚本文件失败【${res.code},${res.message}】：${filename}`);
    }
    else {
        console.log(`创建脚本文件成功：${filename}`);
    }
}
/**
 * write yao dsl json file
 *
 * yao studio run model.file.WriteFile fname data
 * @param {string} filename json file name
 * @param {object} data
 */
function WriteFile(filename, data) {
    const fs = new FS("dsl");
    const nfilename = FileNameConvert(filename);
    if (!fs.Exists(nfilename)) {
        const folder = nfilename.split("/").slice(0, -1).join("/");
        if (!fs.Exists(folder)) {
            fs.MkdirAll(folder);
        }
    }
    const res = fs.WriteFile(filename, JSON.stringify(data));
    if (res && res.code && res.message) {
        console.log(`创建配置文件失败【${res.code},${res.message}】：${filename}`);
    }
    else {
        console.log(`创建配置文件成功：${filename}`);
    }
}
/**
 * 创建yao dsl 配置文件，如果已经存在，移动到.trash目录
 *
 * yao studio run model.file.MoveAndWrite
 * @param folder Yao应用目录，相对于Yao App根目录
 * @param file 文件名
 * @param dsl dsl定义对象，会自动的转换成json
 */
function MoveAndWrite(folder, file, dsl) {
    Move(folder, file);
    WriteFile(folder ? `/${folder}/` + file : file, dsl);
}
/**
 * yao studio run model.file.Move
 * 文件复制移动逻辑
 */
function Move(dir, name) {
    const fs = new FS("dsl");
    const base_dir = ".trash";
    // 判断文件夹是否存在.不存在就创建
    Mkdir(base_dir);
    const new_dir = Math.floor(Date.now() / 1000);
    // models的文件移动到
    const target_name = dir ? dir + "/" + name : name;
    // 如果已经存在
    if (fs.Exists(target_name)) {
        Mkdir(base_dir + "/" + new_dir);
        fs.Copy(target_name, `${base_dir}/${new_dir}/${name}`);
        // 复制完成后,删除文件
        fs.Remove(target_name);
    }
    else {
        return false;
    }
}
function Mkdir(name) {
    const fs = new FS("dsl");
    const res = fs.Exists(name);
    if (res !== true) {
        fs.MkdirAll(name);
    }
}
function Copy(from, to, name) {
    const fs = new FS("dsl");
    fs.Copy(from, to + "/" + name);
}
/**
 * 查看模型是否存在
 * @param {*} file_name
 * @returns
 */
function Exists(dir, file_name) {
    const fs = new FS("dsl");
    const res = fs.Exists(dir + "/" + file_name);
    return res;
}
