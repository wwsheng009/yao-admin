
function Save(payload) {
  //先保存主表，获取id后再保存从表
  
  const t = new Query();
    t.Run({
      sql: {
      stmt: "START TRANSACTION;",
    },
  });
  
  let res = null
  try {
    res = Process('models.ddic.model.Save', payload);
    if (res.code && res.code > 300) {
      throw new Exception(res.message, res.code);
    }
    SaveRelations(res, payload);
  } catch (error) {
    console.log("Data Save Failed")
    
  t.Run({
    sql: {
      stmt: 'ROLLBACK;',
    },
  });
  
    if(error.message,error.code){
      console.log("error:",error.code,error.message)
      throw new Exception(error.message,error.code)
    }else{
      console.log(error)
      throw error
    }
  }

  t.Run({
    sql: {
      stmt: 'COMMIT;',
    },
  });

return res
}
//保存关联表数据
function SaveRelations(id, payload) {
  Save_columns(id,payload);
  return id;
}

//删除关联表数据
function BeforeDelete(id){
  Delete_columns(id);
}


//保存ddic.model.column
function Save_columns(id,payload){
  const items = payload.columns || {};
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
    var res = Process('models.ddic.model.column.EachSaveAfterDelete', deletes, data, {
      model_id: id,
    });
    if (res.code && res.code > 300) {
      console.log('ddic.model.column:AfterSave Error:', res);
      console.log(items)
      throw new Exception(res.message,res.code)
    }else{
      return id;
    }
  }
}



//删除ddic.model.column == model_id
function Delete_columns(id){
  let rows = Process('models.ddic.model.column.DeleteWhere', {
    wheres: [{ column: 'model_id', value: id }],
  });

  //remembe to return the id in array format
  return [id];
}



//多对一表数据查找
function AfterFind(payload){
  const t = new Query();
 payload["columns"]= t.Get(
      {"from":"ddic_model_column","wheres":[{"column":"model_id","op":"=","value":payload.id}],"select":["id","model_id","name","label","index","unique","element_id","type","length","precision","scale","nullable","crypt","default","comment"]},
  );
 return payload;
}
  
