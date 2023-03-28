function main() {
  var query = new Query();

  var result = query.Get({
    select: ["table_comment"],
    wheres: [
      { ":table_schema": "状态", "=": "mall" },
      { ":table_name": "表名", "=": "cms_help_category" },
    ],
    from: "INFORMATION_SCHEMA.TABLES",
  });
  return result;
}
