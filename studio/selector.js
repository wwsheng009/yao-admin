/**
 * 把hasOne变成下拉选择
 * @param {*} column
 * @param {*} model_dsl
 * @param {*} component
 * @returns
 */
function Select(column, model_dsl, component) {
  const props = column.props || {};
  const title = column.label;
  const name = column.name;

  const bind = `${name}`;
  var relation = model_dsl.relations;
  for (var i in relation) {
    if (relation[i].type == "hasOne" && column.name == relation[i]["foreign"]) {
      var field = Studio("remote.select", i, relation[i]);
      var component = {
        is_select: true,
        // bind: i + "." + field,
        bind,
        view: { props: props, type: "Text" },
        edit: {
          type: "Select",
          props: {
            xProps: {
              $remote: {
                process: "yao.component.SelectOptions",

                //"scripts." + relation[i].model + "." + i + ".GetSelect",
                // process: "models." + relation[i]["model"] + ".Get",
                query: {
                  model: Studio("file.DotName", relation[i].model),
                  label: field,
                  value: "id",
                },
              },
            },
          },
        },
      };
      component = Withs(component, i);
      return component;
    }
  }
  return component;
}

function EditSelect(column, model_dsl, component) {
  const props = column.props || {};
  const title = column.label;
  const name = column.name;
  // console.log("column name:", name);
  const bind = `${name}`;
  var relation = model_dsl.relations;

  for (var i in relation) {
    if (relation[i].type == "hasOne" && column.name == relation[i]["foreign"]) {
      var field = Studio("remote.select", i, relation[i]);
      var component = {
        bind: bind,
        view: { props: props, type: "Text" },
        edit: {
          type: "Select",
          props: {
            xProps: {
              $remote: {
                process: "yao.component.SelectOptions",
                // "scripts." + relation[i].model + "." + i + ".GetSelect",
                // process: "models." + relation[i]["model"] + ".Get",
                query: {
                  model: Studio("file.DotName", relation[i].model),
                  label: field,
                  value: "id",
                },
              },
            },
          },
        },
      };
      component = Withs(component, i);
      return component;
    }
  }
  return component;
}

function Withs(component, relation_name) {
  // "option": { "withs": { "user": {} } }

  var withs = [];
  withs.push({
    name: relation_name,
  });
  component.withs = withs;
  return component;
}

/**
 * 把hasMany变成列表
 */
function Table(form_dsl, model_dsl) {
  var relation = model_dsl.relations;
  for (var rel in relation) {
    // console.log(`translate.translate:${i}`);

    var translate = Studio("relation.translate", rel);
    if (relation[rel].type == "hasMany") {
      form_dsl.fields.form["表格" + translate] = {
        bind: "id",
        edit: {
          type: "Table",
          props: {
            model: relation[rel]["model"],
            query: {
              [`where.${relation[rel].key}.eq`]: "{{id}}",
            },
          },
        },
      };
      form_dsl.layout.form.sections.push({
        title: "表格" + translate + "信息",
        // desc: "表格" + translate + "信息",
        columns: [{ name: "表格" + translate, width: 24 }],
      });
    }
  }
  return form_dsl;
}
