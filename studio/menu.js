function Create(model_dsl) {
  var insert = [];
  var child = [];
  var total = model_dsl.length;
  insert.push({
    blocks: 0,
    icon: "icon-activity",
    id: 1,
    name: "数据模型",
    parent: null,
    path: "/x/Chart/dashboard",
    visible_menu: 0,
  });

  for (var i in model_dsl) {
    var name = Studio("file.DotName", model_dsl[i]["table"]["name"]);

    var item = {
      name: model_dsl[i].name,
      path: "/x/Table/" + name,
      icon: "",
      rank: i + 1,
      status: "enabled",
      parent: null,
      visible_menu: 0,
      blocks: 0,
      id: (i + 1) * 10,
      model: name,
      children: [],
    };
    if (total >= 10) {
      item.visible_menu = 1;
      // child.push(item);
      if (i == 0) {
        var icon = "icon-align-justify";
        item.icon = icon;
        insert[1] = item;
      } else {
        insert[1]["children"].push(item);
      }
    } else {
      var icon = GetIcon(name);
      item.icon = icon;
      insert.push(item);
    }
  }
  // Studio("move.Mkdir", "flows");
  Studio("move.Mkdir", "flows/app");
  var fs = new FS("dsl");

  var dsl = {
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

  var dsl = JSON.stringify(dsl);
  console.log(`create menu:/flows/app/menu.flow.json`);

  fs.WriteFile("/flows/app/menu.flow.json", dsl);

  // 创建看板
  if (total >= 10) {
    Studio("dashboard.Create", insert, 1);
  } else {
    Studio("dashboard.Create", insert, 2);
  }

  //Process("models.xiang.menu.insert", columns, insert);
}

/**yao studio run menu.icon user
 * 获取菜单图标
 * @param {*} name
 */
function GetIcon(name) {
  var url = "https://brain.yaoapps.com/api/icon/search?name=" + name;
  let response = Process("xiang.network.Get", url, {}, {});
  if (response.status == 200) {
    return response.data.data;
  }
  return "icon-box";
}
