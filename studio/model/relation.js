// import { Studio } from "yao-node-client";
const parents = ["parent", "parent_id", "pid"];
const children = ["children", "children_id", "child", "child_id"];
/**
 * 关联关系分析同一个表中关联关系
 * @param {*} modelName
 * @param {*} columns
 * @param {*} tableStruct
 */
function child(modelName, columns, tableStruct) {
    const dotName = Studio("model.file.DotName", modelName);
    const childColumns = columns.filter((column) => column.type === "integer" && children.includes(column.name));
    if (childColumns.length > 0) {
        tableStruct.relations.children = {
            type: "hasMany",
            model: dotName,
            key: childColumns[0].name,
            foreign: "id",
            query: {},
        };
    }
    return tableStruct;
}
/**
 * 分析子集
 * @param {*} modelName
 * @param {*} columns
 * @param {*} table_struct
 * @returns
 */
function parent(modelName, columns, table_struct) {
    const dotName = Studio("model.file.DotName", modelName);
    const parentColumn = columns.find((column) => column.type === "integer" && parents.includes(column.name));
    if (parentColumn) {
        table_struct.relations.parent = {
            type: "hasOne",
            model: dotName,
            key: "id",
            foreign: parentColumn.name,
            query: {},
        };
    }
    return table_struct;
}
function other(all_table_struct) {
    for (const table of all_table_struct) {
        const columns = table.columns;
        all_table_struct = hasOne(table.table.name, all_table_struct);
        for (const column of columns) {
            all_table_struct = hasMany(table.table.name, column.name, all_table_struct);
        }
    }
    return all_table_struct;
}
function hasOne(table_name, all_table) {
    const foreignIds = [`${table_name}_id`, `${table_name}ID`, `${table_name}Id`];
    const prefix = Studio("model.schema.TablePrefix");
    if (prefix.length) {
        foreignIds.push(`${Studio("model.schema.ReplacePrefix", prefix, table_name)}_id`);
        foreignIds.push(`${Studio("model.schema.ReplacePrefix", prefix, table_name)}ID`);
        foreignIds.push(`${Studio("model.schema.ReplacePrefix", prefix, table_name)}Id`);
    }
    const dotName = Studio("model.file.DotName", table_name);
    return all_table.map((table) => {
        table.columns.forEach((column) => {
            if (foreignIds.includes(column.name)) {
                table.relations[table_name] = {
                    type: "hasOne",
                    model: dotName,
                    key: "id",
                    foreign: column.name,
                    query: {},
                };
            }
        });
        return table;
    });
}
function hasMany(tableName, fieldName, allTables) {
    const relationSuffixes = ["_id", "_ID", "_Id"];
    const tablePrefixes = Studio("model.schema.TablePrefix");
    const dotName = Studio("model.file.DotName", tableName);
    for (const suffix of relationSuffixes) {
        for (const table of allTables) {
            if (fieldName.endsWith(suffix)) {
                const target = fieldName.replace(suffix, "");
                if (target === table.table.name ||
                    tablePrefixes.some((prefix) => `${prefix}_${target}` === table.table.name)) {
                    table.relations[tableName] = {
                        type: "hasMany",
                        model: dotName,
                        key: fieldName,
                        foreign: "id",
                        query: {},
                    };
                }
            }
        }
    }
    return allTables;
}
/**
 * yao studio run model.relation.Select
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
 * yao studio run model.relation.EditSelect
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
        if (relation[rel].type === "hasOne" &&
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
//  *  yao studio run model.relation.GetWiths
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
    const relations = modelDsl.relations;
    for (const rel in relations) {
        // console.log(`translate.translate:${i}`);
        if (relations[rel].type != "hasMany") {
            continue;
        }
        let label = relations[rel].label;
        if (!label) {
            label = "列表" + Studio("model.translate.translate", rel);
        }
        if (!label) {
            label = rel;
        }
        formDsl.fields.form[label] = {
            bind: "id",
            edit: {
                type: "Table",
                props: {
                    model: relations[rel].model,
                    query: {
                        [`where.${relations[rel].key}.eq`]: "{{id}}",
                    },
                },
            },
        };
        formDsl = Studio("model.column.form.AddTabColumn", formDsl, {
            name: label,
            width: 24,
        });
    }
    return formDsl;
}
/**
 * yao studio run model.relation.List
 * 把hasMany变成表单中的List
 */
function List(formDsl, modelDsl) {
    const relations = modelDsl.relations;
    let RelList = [];
    // let tabs: YaoForm.SectionDSL[] = [];
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
        let label = relations[rel].label;
        if (!label) {
            label = "列表" + Studio("model.translate.translate", rel);
        }
        if (!label) {
            label = rel;
        }
        formDsl.fields.form[label] = {
            bind: rel,
            edit: {
                type: "List",
                props: {
                    name: relations[rel].model,
                    showLabel: true,
                },
            },
        };
        formDsl = Studio("model.column.form.AddTabColumn", formDsl, {
            name: label,
            width: 24,
        });
    }
    if (RelList.length === 0) {
        return formDsl;
    }
    const tabName = modelDsl.table.name;
    let funtionName = Studio("model.file.SlashName", tabName);
    let modelName = Studio("model.file.DotName", tabName);
    RelList.forEach((rel) => CreateListFile(rel));
    //function templates
    const saveDataFunList = RelList.map((rel) => CreateDataSaveCode(rel));
    const deleteDataFunList = RelList.map((rel) => CreateDataDeleteCode(rel));
    const AfterFind = CreateAfterFind(relations);
    //called code list
    const saveDataCodes = RelList.map((rel) => `Save_${rel.name}(id,payload);`);
    const deleteDataCodes = RelList.map((rel) => `Delete_${rel.name}(id);`);
    if (RelList.length) {
        formDsl.action.save = {
            process: `scripts.${modelName}.Save`,
        };
        formDsl.action["before:delete"] = `scripts.${modelName}.BeforeDelete`;
        formDsl.action["after:find"] = `scripts.${modelName}.AfterFind`;
        WriteScript(funtionName, modelName, saveDataCodes, deleteDataCodes, saveDataFunList, deleteDataFunList, AfterFind);
    }
    return formDsl;
}
function CreateAfterFind(relations) {
    let templates = [];
    const payload = {
        id: 0,
    };
    for (const rel in relations) {
        const element = relations[rel];
        if (element.type !== "hasMany") {
            continue;
        }
        const model = Studio("model.model.GetModel", element.model);
        if (!model) {
            console.log(`模型${element.model}不存在！`);
            continue;
        }
        let query = {};
        if (element.query) {
            query = element.query;
        }
        else {
        }
        if (!query.from) {
            query.from = model.table.name;
        }
        // if (!query.limit) {
        //   query.limit = 100;
        // }
        query.wheres = query.wheres || [];
        if (!query.select) {
            query.select = [];
            model.columns.forEach((col) => query.select.push(col.name));
        }
        query.wheres.push({
            column: element.key,
            op: "=",
            value: ">>>payload.id<<<",
        });
        let str = `payload["${rel}"]= t.Get(
      ${JSON.stringify(query)},
  );`.replace(/">>>payload.id<<<"/g, "payload.id");
        templates.push(str);
    }
    return `
//多对一表数据查找
function AfterFind(payload){
  const t = new Query();
 ${templates.join("\n")}
 return payload;
}
  `;
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
function WriteScript(functionName, modelName, saveDataCodes, deleteDataCodes, saveDataFunctionList, deleteDataFuntionList, AfterFind) {
    // let sc = new FS("script");
    let scripts = `
function Save(payload) {
  //先保存主表，获取id后再保存从表
  ${StartTrans()}
  let res = null
  try {
    res = Process('models.${modelName}.Save', payload);
    if (res.code && res.code > 300) {
      throw new Exception(res.message, res.code);
    }
    SaveRelations(res, payload);
  } catch (error) {
    console.log("Data Save Failed")
    ${Rollback()}
    if(error.message,error.code){
      console.log("error:",error.code,error.message)
      throw new Exception(error.message,error.code)
    }else{
      console.log(error)
      throw error
    }
  }
${Commit()}
return res
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

${AfterFind}
`;
    // sc.WriteFile(`/${functionName}.js`, scripts);
    Studio("model.file.WriteScript", `/${functionName}.js`, scripts);
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
    let modelDsl = Studio("model.model.GetModel", modelName);
    if (!modelDsl) {
        console.log(`Model ${modelName} not exist`);
        return;
    }
    //在列表显示中不需要显示外键
    modelDsl.columns = modelDsl.columns.filter((col) => col.name !== excludeField);
    let listDsl = Studio("model.column.list.toList", modelDsl); //这里有studio js读取操作
    let tableName = Studio("model.file.SlashName", modelDsl.table.name);
    let listFileName = tableName + ".list.json";
    Studio("model.file.MoveAndWrite", "lists", listFileName, listDsl);
}
