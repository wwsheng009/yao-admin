// yao studio run model.file.IsFile
// 根据图片组件更新组件类型,只查看
/**
 * 判断是否文件显示组件
 * yao studio run model.column.file.IsFile
 * @param column 模型列定义
 * @param component 更新的组件
 * @returns
 */
function IsFile(column, component, modelDsl) {
    if (!["text", "json", "string", "logngtext", "mediumText"].includes(column.type)) {
        return component;
    }
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
        if (name.includes(guard[i])) {
            var component = {
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
                        args: ["$C(row)", name, modelDsl.table.name],
                    },
                    props: {
                        maxCount: 100,
                        filetype: "image",
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
 * yao studio run model.column.file.IsFormFile
 * 根据图片组件更新组件类型,可上传
 * @param column 模型中的字段定义
 * @param component 数据库字段定义
 * @param modelDsl 模型引用
 * @returns
 */
function IsFormFile(column, component, modelDsl) {
    if (!["text", "json", "string", "logngtext", "mediumText"].includes(column.type)) {
        return component;
    }
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
                        args: ["$C(row)", name, modelDsl.table.name],
                    },
                    props: {
                        maxCount: 100,
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
