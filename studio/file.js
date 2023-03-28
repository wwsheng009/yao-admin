// import { FS } from "yao-node-client";
// 根据图片组件更新组件类型,只查看
function File(column, component) {
    var guard = [
        "img",
        "image",
        "_pic",
        "pic_",
        "picture",
        "oss",
        "photo",
        "icon",
        "avatar",
        "Img",
        "logo",
        "cover",
        "url",
        "gallery",
        "pic",
    ];
    const name = column.name;
    for (var i in guard) {
        if (name.indexOf(guard[i]) != -1) {
            var component = {
                bind: name,
                view: {
                    type: "Image",
                    compute: "scripts.file.image.ImagesView",
                    props: {},
                },
                edit: {
                    type: "Upload",
                    compute: "Upload",
                    //compute: "scripts.file.image.ImagesEdit",
                    props: {
                        filetype: "image",
                        disabled: true,
                        $api: {
                            process: "fs.system.Upload",
                        },
                    },
                },
            };
            return component;
        }
    }
    return component;
}
/**
 * 根据图片组件更新组件类型,可上传
 * @param column 模型中的字段定义
 * @param component 数据库字段定义
 * @param model_dsl 模型引用
 * @returns
 */
function FormFile(column, component, model_dsl) {
    var guard = [
        "img",
        "image",
        "_pic",
        "pic_",
        "picture",
        "oss",
        "photo",
        "icon",
        "avatar",
        "Img",
        "logo",
        "cover",
        "url",
        "gallery",
        "pic",
    ];
    const name = column.name;
    for (var i in guard) {
        if (name.indexOf(guard[i]) != -1) {
            var component = {
                is_image: true,
                bind: name,
                view: {
                    type: "Image",
                    compute: "scripts.file.image.ImagesView",
                    props: {},
                },
                edit: {
                    type: "Upload",
                    compute: {
                        process: "scripts.file.image.ImagesEdit",
                        args: ["$C(row)", "$C(type)", name, model_dsl.table.name],
                    },
                    props: {
                        filetype: "image",
                        $api: { process: "fs.system.Upload" },
                    },
                },
            };
            return component;
        }
    }
    return component;
}
/**
 * yao studio run file.DotName table_name
 * yao studio run file.DotName /file/name
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
 * yao studio run file.SlashName crm_help
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
 * yao studio run file.FileNameConvert "/models/cms__help.mod.json"
 * yao studio run file.FileNameConvert "/models/cms.help.mod.json"
 * yao studio run file.FileNameConvert "/models/cms.json"
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
// export function FileNameConvert(filename: string) {
//   let str = filename;
//   str = str.replace(/_/g, "/");
//   str = str.replace(/-/g, "/");
//   str = str.replace(/\\/g, "/");
//   str = str.replace(/\/\//g, "/");
//   let arr = str.split(".");
//   if (arr.length < 3) {
//     return str;
//   }
//   let suffix = arr.slice(-2);
//   let header = arr.slice(0, -2);
//   let str1 = header.join("/");
//   str1 = str1 + "." + suffix.join(".");
//   return str1;
// }
/**
 * write file
 * yao studio run file.WriteFile "/models/cms_help.mod.json"
 * yao studio run file.WriteFile "/models/cms.help.mod.json"
 * yao studio run file.WriteFile "/models/cms.json"
 * @param {string} filename filename
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
    fs.WriteFile(filename, JSON.stringify(data));
}
// export function WriteFile(filename: string, data: object) {
//   let nfilename = FileNameConvert(filename);
//   let fs = new FS("dsl");
//   if (!fs.Exists(nfilename)) {
//     let paths = nfilename.split("/");
//     paths.pop();
//     let folder = paths.join("/");
//     if (!fs.Exists(folder)) {
//       // console.log("make folder", folder);
//       fs.MkdirAll(folder);
//     }
//   }
//   // console.log("write file:", nfilename);
//   fs.WriteFile(filename, JSON.stringify(data));
// }
