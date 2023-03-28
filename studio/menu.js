// import { FS, Process, Studio } from "yao-node-client";
function Create(model_dsl) {
    let insert = [];
    // let child = [];
    const total = model_dsl.length;
    insert.push({
        blocks: 0,
        icon: "icon-activity",
        id: 1,
        name: "数据模型",
        parent: null,
        path: "/x/Chart/dashboard",
        visible_menu: 0,
    });
    for (let i = 0; i < model_dsl.length; i++) {
        // }
        // for (const i in model_dsl) {
        // const element = model_dsl[i];
        const name = model_dsl[i]["table"]["name"];
        const dotName = Studio("file.DotName", name);
        const icon = GetIcon(name);
        let item = {
            name: model_dsl[i].name,
            path: "/x/Table/" + dotName,
            icon: icon,
            rank: i + 1,
            status: "enabled",
            visible_menu: 0,
            model: name,
            blocks: 0,
            id: (i + 1) * 10,
            children: [],
        };
        if (total >= 10) {
            item.visible_menu = 1;
            // child.push(item);
            if (i == 0) {
                item.icon = "icon-align-justify";
                insert[1] = item;
            }
            else {
                insert[1]["children"].push(item);
            }
        }
        else {
            insert.push(item);
        }
    }
    // Studio("move.Mkdir", "flows");
    Studio("move.Mkdir", "flows/app");
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
    // 创建看板
    if (total >= 10) {
        Studio("dashboard.Create", insert, 1);
    }
    else {
        Studio("dashboard.Create", insert, 2);
    }
    //Process("models.xiang.menu.insert", columns, insert);
}
/**yao studio run menu.icon user
 * 获取菜单图标
 * @param {*} name
 */
function GetIcon(name) {
    let url = "https://brain.yaoapps.com/api/icon/search?name=" + name;
    let response = Process("xiang.network.Get", url, {}, {});
    if (response.status == 200) {
        return response.data.data;
    }
    return "icon-box";
}
