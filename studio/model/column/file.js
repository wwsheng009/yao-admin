const imageNamePattern = [
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
const videoNamePattern = ["video", "_video", "video_"];
const fileNamePattern = ["file", "_file", "file_"];
function GetFileType(name) {
    let viewType = "A";
    let fileType = "unknown";
    const patterns = [
        ...imageNamePattern,
        ...videoNamePattern,
        ...fileNamePattern,
    ];
    for (const pattern of patterns) {
        if (name.includes(pattern)) {
            if (imageNamePattern.includes(pattern)) {
                viewType = "Image";
                fileType = "image";
            }
            else if (videoNamePattern.includes(pattern)) {
                viewType = "Image";
                fileType = "video";
            }
            else {
                viewType = "A";
                fileType = "file";
            }
            break;
        }
    }
    return {
        viewType,
        fileType,
    };
}
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
    const { viewType, fileType } = GetFileType(column.name);
    if (fileType === "unknown") {
        return component;
    }
    const name = column.name;
    component = {
        bind: name,
        view: {
            type: viewType,
            compute: "scripts.file.upload.View",
            props: {},
        },
        edit: {
            type: "Upload",
            compute: {
                process: "scripts.file.upload.Edit",
                args: ["$C(row)", name, modelDsl.table.name],
            },
            props: {
                maxCount: 100,
                filetype: fileType,
                $api: {
                    process: "fs.system.Upload",
                },
            },
        },
    };
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
    const { viewType, fileType } = GetFileType(column.name);
    if (fileType === "unknown") {
        return component;
    }
    const name = column.name;
    var component = {
        is_upload: true,
        bind: name,
        view: {
            type: viewType,
            compute: "scripts.file.upload.View",
            props: {},
        },
        edit: {
            type: "Upload",
            compute: {
                process: "scripts.file.upload.Edit",
                args: ["$C(row)", name, modelDsl.table.name],
            },
            props: {
                maxCount: 100,
                filetype: fileType,
                $api: { process: "fs.system.Upload" },
            },
        },
    };
    return component;
}
