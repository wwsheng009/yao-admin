// import { FS, Studio } from "yao-node-client";
/**
 * yao studio run model.selector.Select
 * 把hasOne变成下拉选择
 * @param {*} column
 * @param {*} modelDsl
 * @param {*} component
 * @returns
 */
function Select(column, modelDsl, component) {
    const props = column.props || {};
    // const title = column.label;
    const name = column.name;
    const bind = `${name}`;
    const relation = modelDsl.relations;
    for (const rel in relation) {
        if (relation[rel].type == "hasOne" &&
            column.name == relation[rel]["foreign"]) {
            const dotName = Studio("model.file.DotName", relation[rel].model);
            const field = Studio("model.remote.select", rel, relation[rel]);
            let component = {
                is_select: true,
                // bind: i + "." + field,
                bind,
                view: {
                    type: "Tag",
                    props: {
                        xProps: {
                            $remote: {
                                process: "yao.component.SelectOptions",
                                query: {
                                    model: dotName,
                                    label: field,
                                    value: "id",
                                },
                            },
                        },
                        ...props,
                    },
                },
                edit: {
                    type: "Select",
                    props: {
                        xProps: {
                            $remote: {
                                process: "yao.component.SelectOptions",
                                query: {
                                    model: dotName,
                                    label: field,
                                    value: "id",
                                },
                            },
                        },
                        ...props,
                    },
                },
            };
            return component;
        }
        // component = Withs(component, rel);
    }
    return component;
}
/**
 * yao studio run model.selector.EditSelect
 * Select控件。
 * @param column 模型的列
 * @param modelDsl 模型实例
 * @param component 新对象
 * @returns 返回新对象
 */
function EditSelect(column, modelDsl, component) {
    const props = column.props || {};
    const name = column.name;
    const bind = `${name}`;
    const relation = modelDsl.relations;
    for (const rel in relation) {
        if (relation[rel].type == "hasOne" &&
            column.name == relation[rel]["foreign"]) {
            const field = Studio("model.remote.select", rel, relation[rel]);
            let component = {
                bind: bind,
                edit: {
                    type: "Select",
                    props: {
                        xProps: {
                            $remote: {
                                process: "yao.component.SelectOptions",
                                query: {
                                    model: Studio("model.file.DotName", relation[rel].model),
                                    label: field,
                                    value: "id",
                                },
                            },
                        },
                        ...props,
                    },
                },
            };
            return component;
        }
        // component = Withs(component, rel);
    }
    return component;
}
// /**
//  *  yao studio run model.selector.GetWiths
//  * @param modelDsl
//  */
function GetWiths(modelDsl) {
    const relations = modelDsl.relations;
    let withs = {};
    for (const rel in relations) {
        withs[rel] = {};
    }
    return withs;
}
// /**增加关联表关系 */
// function Withs(component: FieldColumn, relation_name: string) {
//   const withs = [];
//   withs.push({
//     name: relation_name,
//   });
//   component.withs = withs;
//   return component;
// }
/**
 * 把hasMany变成表单中的Table
 */
function Table(formDsl, modelDsl) {
    const relation = modelDsl.relations;
    for (const rel in relation) {
        // console.log(`translate.translate:${i}`);
        const translate = Studio("model.relation.translate", rel);
        if (relation[rel].type == "hasMany") {
            formDsl.fields.form["表格" + translate] = {
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
            formDsl.layout.form.sections.push({
                // title: "表格" + translate + "信息",
                // desc: "表格" + translate + "信息",
                columns: [{ name: "表格" + translate, width: 24 }],
            });
        }
    }
    return formDsl;
}
/**
 * yao studio run model.selector.List
 * 把hasMany变成表单中的List
 */
function List(formDsl, modelDsl) {
    const relations = modelDsl.relations;
    let RelList = [];
    for (const rel in relations) {
        // console.log(`translate.translate:${i}`);
        if (relations[rel].type != "hasMany") {
            continue;
        }
        RelList.push({
            name: rel,
            model: relations[rel].model,
            key: relations[rel].key,
        });
        //创建控件
        const translate = Studio("model.relation.translate", rel);
        formDsl.fields.form["列表" + translate] = {
            bind: rel,
            edit: {
                type: "List",
                props: {
                    name: relations[rel].model,
                    showLabel: true,
                },
            },
        };
        formDsl.layout.form.sections.push({
            // title: "表格" + translate + "信息",
            // desc: "表格" + translate + "信息",
            columns: [{ name: "列表" + translate, width: 24 }],
        });
    }
    const tabName = modelDsl.table.name;
    let funtionName = Studio("model.file.SlashName", tabName);
    let modelName = Studio("model.file.DotName", tabName);
    RelList.forEach((rel) => CreateListFile(rel));
    //function templates
    const saveDataFunList = RelList.map((rel) => CreateDataSaveCode(rel));
    const deleteDataFunList = RelList.map((rel) => CreateDataDeleteCode(rel));
    //called code list
    const saveDataCodes = RelList.map((rel) => `Save_${rel.name}(id,payload);`);
    const deleteDataCodes = RelList.map((rel) => `Delete_${rel.name}(id);`);
    if (RelList.length) {
        formDsl.action.save = {
            process: `scripts.${modelName}.Save`,
        };
        formDsl.action["before:delete"] = `scripts.${modelName}.BeforeDelete`;
        WriteScript(funtionName, modelName, saveDataCodes, deleteDataCodes, saveDataFunList, deleteDataFunList);
    }
    return formDsl;
}
function CreateDataDeleteCode(rel) {
    return `
//删除${rel.model} == ${rel.key}
function Delete_${rel.name}(id){
  let rows = Process('models.${rel.model}.DeleteWhere', {
    wheres: [{ column: '${rel.key}', value: id }],
  });

  //remembe to return the id in array format
  return [id];
}
`;
}
function StartTrans() {
    const ismysql = Studio("model.utils.IsMysql");
    return ismysql
        ? `
const t = new Query();
t.Run({
sql: {
stmt: "START TRANSACTION;",
},
});
`
        : "";
}
function Commit() {
    const ismysql = Studio("model.utils.IsMysql");
    return ismysql
        ? `
t.Run({
sql: {
stmt: 'COMMIT;',
},
});
`
        : "";
}
function Rollback() {
    const ismysql = Studio("model.utils.IsMysql");
    return ismysql
        ? `
t.Run({
sql: {
stmt: 'ROLLBACK;',
},
});
`
        : "";
}
function WriteScript(functionName, modelName, saveDataCodes, deleteDataCodes, saveDataFunctionList, deleteDataFuntionList) {
    let sc = new FS("script");
    let scripts = `
function Save(payload) {
//先保存主表，获取id后再保存从表
${StartTrans()}
try {
  var id = Process('models.${modelName}.Save', payload);
  SaveRelations(id, payload);
} catch (error) {
  ${Rollback()}
  throw new Exception(error,500)
}
${Commit()}
}
//保存关联表数据
function SaveRelations(id, payload) {
${saveDataCodes.join("\n\t")}
return id;
}

//删除关联表数据
function BeforeDelete(id){
${deleteDataCodes.join("\n\t")}
}

${saveDataFunctionList.join("\n")}

${deleteDataFuntionList.join("\n")}

`;
    sc.WriteFile(`/${functionName}.js`, scripts);
}
/**
 * 生成数据保存代码
 * @param rel 关联关系
 * @returns 代码模板
 */
function CreateDataSaveCode(rel) {
    return `
//保存${rel.model}
function Save_${rel.name}(id,payload){
  const items = payload.${rel.name} || {};
  const deletes = items.delete || [];
  const data = items.data || items || [];
  if (data.length > 0 || deletes.length > 0) {
    // 忽略实际数据 ( 通过 record 计算获取)
    for (const i in data) {
      if (typeof data[i].id === 'string' && data[i].id.startsWith('_')) {
        //新增项目，在前端会生成唯一字符串,
        //由于后台使用的自增长ID，不需要生成的唯一字符串，由数据库生成索引
        delete data[i].id;
      }
    }

    // 保存物品清单
    var res = Process('models.${rel.model}.EachSaveAfterDelete', deletes, data, {
      ${rel.key}: id,
    });
    if (res.code && res.code > 300) {
      console.log('${rel.model}:AfterSave Error:', res);
      console.log(items)
      throw new Exception(res.message,res.code)
    }else{
      return id;
    }
  }
}
`;
}
/**创建列表，并不需要所有的模型都创建列表 */
function CreateListFile(rel) {
    const modelName = rel.model;
    const excludeField = rel.key;
    let modelDsl = Studio("model.cmd.Get", modelName);
    if (!modelDsl) {
        console.log(`Model ${modelName} not exist`);
        return;
    }
    modelDsl.columns = modelDsl.columns.filter((col) => col.name !== excludeField);
    let listDsl = Studio("model.colunm.toList", modelDsl); //这里有studio js读取操作
    let listJson = JSON.stringify(listDsl);
    let fs = new FS("dsl");
    let tableName = Studio("model.file.SlashName", modelDsl.table.name);
    let listFileName = tableName + ".list.json";
    Studio("model.move.Move", "lists", listFileName);
    fs.WriteFile("/lists/" + listFileName, listJson);
}
