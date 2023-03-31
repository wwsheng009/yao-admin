function Test1(id) {
  const query = new Query("default");
  const data = query.Get({
    sql: { stmt: "SELECT id,name FROM yao_demo_pet WHERE id = ?", args: [id] },
  });
  return data;
}

function Test2(id) {
  const query = new Query();
  const data = query.Get({
    select: ["id", "name"],
    wheres: [{ ":id": "id", op: "eq", value: id }],
    from: "yao_demo_pet",
    limit: 10,
  });
  return data;
}

function Test3(id) {
  const query = new Query("xiang1");
  const data = query.Run({
    sql: { stmt: "SELECT id,name FROM yao_demo_pet WHERE id = ?", args: [id] },
  });
  return data;
}
