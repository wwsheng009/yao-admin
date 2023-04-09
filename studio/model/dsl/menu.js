// import { Studio } from "yao-node-client";
/**
 * yao studio run model.dsl.menu.Create
 * @param modelDsls model dsl list
 */
function Create(modelDsls) {
    let insert = [];
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
    let menuModels = [];
    for (let i = 0; i < modelDsls.length; i++) {
        if (modelDsls[i].xgen?.menu?.no_display) {
            continue;
        }
        let modName = modelDsls[i].name;
        // let tableName = modelDsls[i].table.comment;
        // if (!english.test(tableName) && modelDsls[i].table?.name) {
        //   tableName = modelDsls[i].table.name;
        // }
        // const trans = Studio("model.translate.translate", tableName);
        const path = Studio("model.file.DotName", modelDsls[i].table.name);
        const icon = Studio("model.translate.GetIcon", modelDsls[i].table.name);
        const menuName = modelDsls[i].comment
            ? modelDsls[i].comment
            : modelDsls[i].table?.comment
                ? modelDsls[i].table?.comment
                : modName
                    ? modName
                    : path;
        let item = {
            name: menuName,
            path: path,
            icon: icon,
            rank: i + 1,
            status: "enabled",
            visible_menu: 0,
            extra: modelDsls[i].table.name,
            blocks: 0,
            id: (i + 1) * 10,
            children: [],
        };
        menuModels.push(item);
    }
    // 创建看板
    Studio("model.dashboard.Create", menuModels);
    menuModels = MakeTree(menuModels);
    insert.push(...menuModels);
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
    Studio("model.file.MoveAndWrite", "/flows/app", "menu.flow.json", dsl);
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
                //中间跳级了。
                //a.b 上一级
                //a.b.c.d 下一级
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
    let newarray = [];
    for (const item of items) {
        if (level === 1) {
            item.children = compress(item.children, level + 1);
            if (item.children && item.children.length > 0) {
                let first = item.children.find((item) => !item.path.endsWith("_folder"));
                if (!first) {
                    first = item.children[0];
                }
                const { name, path, icon, rank, status, visible_menu, id } = first;
                item.name = name;
                item.path = path;
                item.icon = icon;
                item.rank = rank;
                item.status = status;
                item.visible_menu = visible_menu;
                item.id = id + 1;
                if (item.path.endsWith("_folder")) {
                    item.path = item.path.slice(0, 0 - "_folder".length);
                }
            }
            newarray.push(item);
            continue;
        }
        else {
            if (item.name === "") {
                newarray = newarray.concat(compress(item.children, level + 1));
            }
            else {
                const { name, path, icon, rank, status, visible_menu, id } = item;
                if (item.children) {
                    const children = compress(item.children, level + 1);
                    if (children.length === 1) {
                        newarray = newarray.concat(children);
                        continue;
                    }
                    else if (children.length > 1 && level > 1) {
                        item.children = children;
                        item.path += "_folder";
                        item.children.unshift({
                            name,
                            path,
                            icon,
                            rank: rank + 1,
                            status,
                            visible_menu,
                            id: id + 1,
                        });
                    }
                }
                newarray.push(item);
            }
        }
    }
    return newarray;
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
            if (name !== "") {
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
        }
        else {
            newarray.push(item);
        }
    }
    return newarray;
}
