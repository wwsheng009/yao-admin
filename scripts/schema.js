/**
 * 获取单个表字段
 * @param {*} name
 * @returns
 */
function GetTable(name) {
  let res = Process("schemas.default.TableGet", name);
  return res;
}
/**
 * 获取所有表格名称
 */
function GetTableName() {
  let res = Process("schemas.default.Tables");
  return res;
  // for (var i in res) {
  //   //  todo 分析表字段关联关系
  // }
}

/**
 * 分析关联关系处理器
 * @param {*} type
 * yao run scripts.schema.Relation
 */
function Relation() {
  // var all_table =["test","admin","icon"]
  var all_table = GetTableName();
  var table_arr = [];
  for (var i in all_table) {
    var col = GetTable(all_table[i]);

    col.name = all_table[i];
    col.table = {};
    col.table.name = all_table[i];
    col.table.comment = all_table[i];
    col.relations = {};
    var parent = Process(
      "scripts.relation.parent",
      all_table[i],
      col.columns,
      col
    );
    var parent = Process(
      "scripts.relation.child",
      all_table[i],
      col.columns,
      parent
    );
    table_arr.push(parent);
  }

  table_arr = Process("scripts.relation.other", table_arr);
  return table_arr;
}

/**
 * 文件复制移动逻辑
 */
function Move() {
  var base_dir = ".trash";
  // 判断文件夹是否存在.不存在就创建
  Mkdir(base_dir);
  var new_dir = parseInt(Date.now() / 1000);
  // models的文件移动到
  var models = Relation();
  for (var i in models) {
    var target_name = "models/" + models[i]["table"]["name"] + ".mod.json";
    // 如果表已经存在,则
    if (Exists(models[i]["table"]["name"])) {
      Mkdir(base_dir + "/" + new_dir);
      Copy(
        target_name,
        base_dir + "/" + new_dir,
        models[i]["table"]["name"] + ".mod.json"
      );

      // 复制完成后,删除文件
      Process("fs.dsl.Remove", target_name);
    } else {
      // 否则就创建文件
      Process("fs.dsl.WriteFile", target_name);
    }
  }
}
/**
 * 查看模型是否存在
 * @param {*} file_name
 * @returns
 */
function Exists(file_name) {
  file_name = file_name + ".mod.json";
  var res = Process("fs.dsl.Exists", "models/" + file_name);
  return res;
}

function Mkdir(name) {
  var res = Process("fs.dsl.ReadDir", name);
  if (res.code) {
    Process("fs.dsl.Mkdir", name);
  }
}

function Copy(from, to, name) {
  console.log([from, to]);
  Process("fs.dsl.Copy", from, to + "/" + name);
}

/**
 * 获取图标
 */
function Icon() {}
