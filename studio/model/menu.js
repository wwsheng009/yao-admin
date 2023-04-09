// import { FS, Process, Studio } from "yao-node-client";
function Create(modelDsls) {
    let insert = [];
    // let child = [];
    // const total = modelDsls.length;
    insert.push({
        blocks: 0,
        icon: "icon-activity",
        id: 1,
        name: "数据模型",
        parent: null,
        path: "/x/Chart/dashboard",
        visible_menu: 0,
    });
    const english = /^[A-Za-z0-9\._-]*$/;
    let insert2 = [];
    for (let i = 0; i < modelDsls.length; i++) {
        if (modelDsls[i].xgen?.menu?.no_display) {
            continue;
        }
        let tableName = modelDsls[i].table.name;
        if (!english.test(tableName)) {
            tableName = modelDsls[i].table.comment;
        }
        // const trans = Studio("model.translate.translate", tableName);
        const dotName = Studio("model.file.DotName", tableName);
        const icon = GetIcon(tableName);
        let item = {
            name: modelDsls[i].table.comment,
            path: dotName,
            icon: icon,
            rank: i + 1,
            status: "enabled",
            visible_menu: 0,
            extra: tableName,
            blocks: 0,
            id: (i + 1) * 10,
            children: [],
        };
        insert2.push(item);
    }
    // 创建看板
    Studio("model.dashboard.Create", insert2);
    insert2 = MakeTree(insert2);
    insert.push(...insert2);
    // Studio("model.move.Mkdir", "flows");
    Studio("model.move.Mkdir", "flows/app");
    const fs = new FS("dsl");
    const dsl = {
        name: "APP Menu",
        nodes: [],
        output: {
            items: insert,
            setting: [
                {
                    icon: "icon-settings",
                    id: 999999,
                    name: "设置",
                    path: "/setting",
                    children: [
                        {
                            id: 10002,
                            name: "系统设置",
                            path: "/setting",
                        },
                    ],
                },
            ],
        },
    };
    const json = JSON.stringify(dsl);
    // console.log(`create menu:/flows/app/menu.flow.json`);
    fs.WriteFile("/flows/app/menu.flow.json", json);
}
/**
 * 把菜单列表转换成树状结构
 * @param menuItems 菜单列表
 * @returns 结构化的菜单
 */
function MakeTree(menuItems) {
    //a.b
    //a.b.c
    //a.b.c.d
    const root = { name: "", path: "", children: [] };
    const map = { "": root };
    menuItems.forEach((item) => {
        const parts = item.path.split(".");
        let parent = root;
        for (let i = 0; i < parts.length; i++) {
            const key = parts.slice(0, i + 1).join(".");
            let node = map[key];
            if (!node) {
                node = { name: "", path: key, children: [] };
                map[key] = node;
                parent.children.push(node);
            }
            parent = node;
        }
        parent.name = item.name;
        parent.path = "/x/Table/" + item.path;
        parent.icon = item.icon;
        parent.rank = item.rank;
        parent.status = item.status;
        parent.extra = item.extra;
        parent.visible_menu = item.visible_menu;
        parent.id = item.id;
    });
    // console.log(root.children);
    const data = compress(root.children, 1);
    return data;
}
/**
 * 优化菜单结构显示
 * @param items 树状菜单结构
 * @param level 层级
 * @returns 优化后的菜单
 */
function compress(items, level) {
    const newarray = [];
    for (const item of items) {
        if (item.name === "") {
            //第一级是左边的显示
            if (level === 1) {
                if (item.children && item.children.length > 0) {
                    const { name, path, icon, rank, status, visible_menu, id } = item.children[0];
                    item.name = name;
                    item.path = path;
                    item.icon = icon;
                    item.rank = rank;
                    item.status = status;
                    item.visible_menu = visible_menu;
                    item.id = id + 1;
                }
                item.children = compress(item.children, level + 1);
                newarray.push(item);
                continue;
            }
        }
        if (item.children.length > 0) {
            // Use if-else statement instead of nesting if statements
            item.children = compress(item.children, level + 1);
            const { name, path, icon, rank, status, visible_menu, id } = item;
            //层级2开始是antd的菜单结构，不能有重复的path。
            if (level > 1) {
                item.path += "_folder";
            }
            item.children.unshift({
                name,
                path,
                icon,
                rank: rank + 1,
                status,
                visible_menu,
                id: id + 1,
            });
            newarray.push(item);
        }
        else {
            newarray.push(item);
        }
    }
    return newarray;
}
/**yao studio run model.menu.icon user
 * 获取菜单图标
 * @param {*} name
 */
function GetIcon(name) {
    let useTranslate = Process("utils.env.Get", "USE_TRANSLATE");
    if (useTranslate !== "TRUE") {
        return "icon-box";
    }
    let url = "https://brain.yaoapps.com/api/icon/search?name=" + name;
    let response = Process("xiang.network.Get", url, {}, {});
    if (response.status == 200) {
        return response.data.data;
    }
    return "icon-box";
}
