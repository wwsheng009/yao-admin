// import { Process } from "yao-node-client";
function onChange(query) {
  const { key, value, params, isOnload } = query;
  let setting = Process("yao.form.Setting", "ddic.element"); // 根据新数值生成配置信息;
  if (key === "type" && value === "enum") {
    // let columns: XgenForm.Column[] = [];
    setting.form.sections[0].columns = setting.form.sections[0].columns.filter(
      (item) => {
        return ["描述", "数据类型", "可选项"].includes(item.name);
      }
    );
    // setting.form.sections[0].columns.forEach((col: XgenCommon.BaseColumn) => {
    //   if (["name", "type", "options"].includes(col.name)) {
    //     setting.form.sections[0].columns.push(col);
    //   }
    // });
    // if (columns.length) {
    //   setting.form.sections[0].columns = columns;
    // }
  }
  return { setting };
}
