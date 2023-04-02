# 使用方法:

克隆项目后,执行 `yao start`,打开配置界面`http://127.0.0.1:5099`配置好数据库配置,注意:数据库里面要有数据表,否则不会生成页面

![配置界面](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/mall%E5%95%86%E5%9F%8E/1.png)

![界面2](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/mall%E5%95%86%E5%9F%8E/2.png)

等待数据表生成以后,就可以打开登录界面 `http://127.0.0.1:5099/yao/login/admin`输入默认用户名: `xiang@iqka.com`， 密码: `A123456p+`

<br>

# 教程：使用 Yao Studio 来构建 Admin 后台

Yao Studio 是[0.10.2 版本](https://release-sv-1252011659.cos.na-siliconvalley.myqcloud.com/archives/yao-0.10.2-linux-amd64)新增的一个功能，该功能主要分为三个部分：模型构造器,表格构造器,组件菜单构造器。可以让你连接任意数据库后，一键生成数据表格和模型菜单，减少 99%的工作量,实现真正的零代码。
源码地址：https://github.com/YaoApp/yao-admin

## 效果预览图

!["品牌列表"](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/litemall%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%95%86%E5%9F%8E/1666694365169.png)

!["商品列表"](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/litemall%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%95%86%E5%9F%8E/1666694653147.png)
!["优惠券"](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/litemall%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%95%86%E5%9F%8E/1666694544787.png)

studio 文件结构说明

```
├─studio
│  ├─colunm.js
│  ├─dashboard.js
│  ├─hasmany.js
│  ├─hasone.js
│  ├─menu.js
│  ├─model.js
│  ├─move.js
│  ├─relation.js
│  ├─remote.js
│  ├─schema.js
│  ├─selector.js
│  └─table.js
```

studio 文件说明

| 文件         | 类型       | 说明                                       |
| ------------ | ---------- | ------------------------------------------ |
| colunm.js    | javascript | 用于 tables 和 forms 文件字段生成的脚本    |
| dashboard.js | javascript | 登录进去后首页展示的看板图脚本             |
| hasmany.js   | javascript | 用于一对多关联关系的推测与生成的规则的脚本 |
| hasone.js    | javascript | 用于一对一关联关系的推测脚本               |
| menu.js      | javascript | 生成登录菜单和图标的脚本                   |
| model.js     | javascript | 生成模型 DSL 脚本                          |
| move.js      | javascript | 文件操作,目录操作,移动删除脚本             |
| relation.js  | javascript | 其他关联关系规则生成脚本                   |
| remote.js    | javascript | 生成 hasOne 下拉列表接口的脚本             |
| schema.js    | javascript | 模型 dsl 字段处理,表名称处理脚本           |
| selector.js  | javascript | 下拉 select 选择框规则处理                 |
| table.js     | javascript | 表格生成脚本调用                           |

## 第一步：配置数据库连接

### 在`yao start`命令执行过后文件中配置好数据库连接,`.env`文件就会出现如下配置

```bash
YAO_DB_AESKEY="KBPdcRn44LzykphsVM\*y"
YAO_DB_DRIVER=mysql
YAO_DB_PRIMARY="root:123456@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local" # 主库连接
YAO_DB_SECONDARY="root:123456@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local" # 主库连接
```

## 第二步：增加模型构造器，新建文件`/studio/model.js`，有关 Studio 的功能操作要全部写在 studio 文件夹下

```javascript

```

| **命令**                   | **说明**                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Studio("schema.Relation"); | Studio 函数,[详情](https://github.com/YaoApp/yao/blob/main/studio/studio.go),调用的是`/studio/schema.Relation`方法                    |
| FS("dsl");                 | 文件操作函数[详情](https://github.com/YaoApp/gou/blob/main/fs/fs_test.go),dsl 是指文件的根目录,可以对文件进行移动删除,复制,新建等操作 |

<br>

`Studio`函数是专门用来调用`/studio`目录下的 js 脚本的,运行该方法，我们可以使用专门的命令：`yao studio run model.Create`,注意：该命令只允许在`YAO_ENV=development`模式下运行

分别新建`/studio/schema.js`和`/studio/relation.js`文件,其中`schema.js`的作用是获取数据库表名称,和表的所有字段,`relation.js`是根据现有的表名称和字段来生成对应的关联关系

<br>

| 方法            | 说明                                        |
| --------------- | ------------------------------------------- |
| Create()        | 生成模型 DSL                                |
| version10_0_2() | 生成 yao-0.10.2 版本的启动配置文件 app.json |
| login()         | 生成 yao-0.10.2 版本登录脚本文件            |

<br>
schema.js文件内容

```javascript

```

<br>

| 方法                             | 说明                                 |
| -------------------------------- | ------------------------------------ |
| GetTable()                       | 主要是通过表格名称用来获取表格的字段 |
| GetTableName()                   | 获取当前数据库连接的表格名称         |
| Relation()                       | 关联关系推测脚本                     |
| FieldHandle()                    | 防止字段过长,截取字段的              |
| TablePrefix() 和 ReplacePrefix() | 去除表前缀                           |

<br>

relation.js 文件内容

```javascript

```

<br>

| 方法        | 说明                                     |
| ----------- | ---------------------------------------- |
| parent()    | 父级 id 的关联关系推测                   |
| child()     | 子集 id 的关联关系推测                   |
| other()     | 其他关联关系推测                         |
| translate() | 调用 yao-brain 的翻译接口,对字段进行翻译 |

<br>

新建`/studio/move.js`该文件主要用于文件移动,在新建模型文件和表格文件的时候,如果发现同名的文件会把文件移动到`.trash`文件夹下面,然后新建一个文件

```javascript

```

<br>

| 方法     | 说明                                            |
| -------- | ----------------------------------------------- |
| Move()   | 文件移动,如果文件已经存在,复制到.trash 文件夹内 |
| Mkdir()  | 生成目录                                        |
| Copy()   | 复制文件                                        |
| Exists() | 判断文件是否存在                                |

<br>

## 第三步：增加表格构造器，新建文件`/studio/table.js`

```javascript

```

新增菜单图标脚本 `/studio/menu.js`

```javascript

```

新增 `dashboard.js`,用于生成登录后面板的看板数据统计

```javascript

```

最后运行调试命令`yao studio run model.Create`,我们可以看到创建了不少的数据模型和表格,我们运行`yao start`访问一下`http://127.0.0.1:5099/yao/login/admin`,输入默认用户名: `xiang@iqka.com`， 密码: `A123456p+`
