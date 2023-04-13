# Yao Admin 增强版

基于官方的 yao-admin 进行改造的适用于 0.10.3-pre 版的 yao-admin。如果想了解 yao-admin 的基本功能，可以先去看看。[yao-admin](https://github.com/YaoApp/yao-admin)

主要功能是基于数据库表结构或是 yao 模型 dsl 文件生成 table/form/list 界面配置。

重要提示：**一定要使用 0.10.3-pre 版本的 yao**

## 特性

- 只需要编写 model dsl 定义文件，会自动的推算出大部分的界面配置。

- 支持 0.10.3-pre 版本的 yao,暂不支持其它的版本。

- 不支持 0.10.3-dev 版本，该版本的的 studio 函数还存在问题。

- 根据数据库表结构定义生成模型/表格/表单/列表 DSL 定义。

- 根据模型 DSL 定义生成/表格/表单/列表 DSL 定义。

- 针对一对多关联模型生成列表 List DSL 定义。

- 针对一对一关联模型生成 reference/floatcontent 界面定义。

- 生成一对多关联模型的数据保存脚本代码。

- 根据模型字段的 validations 配置生成界面的控件的 rules，比如正则，必输。

- 自带一个模型界面配置工具，可使用 xgen 配置模型字段，并生成模型 DSL 文件。

- 根据模型定义，生成 ts 类型定义文件。

- 生成菜单

## 使用方法

从数据库表结构自动生成,只需要下载项目，并执行 yao start，配置好数据库连接后，setup 方法会自动的生成相关的配置。打开登录界面，输入默认的用户名密码。

```sh

git clone https://github.com/wwsheng009/yao-admin

cd yao-admin

yao start
```

### 基于数据库表生成模型

数据库目前测试了 mysql/sqlite,mysql 支持最好，sqlite 兼容性未知。

基于数据库表时，会根据表的命名生成对应的文件目录结构。比如数据库表的名称是 a_b_c。会生成 a/b/c.mod.json 文件。默认是以下划线作为分隔符。

这个规则也适用于生成菜单。如果你的数据库表名有规范，那么会自动生成嵌套的菜单列表。

```sh
# 针对数据库结构
yao studio run model.cmd.CreateModelsFromDB
```

### 基于模型 DSL 生成界面配置文件。

为何要基于模型生成 DSL 文件，从数据库生成的模型 DSL 文件中的 label 值并一定是您想要的，可以调整模型的字段的 label 设置后再生成界面配置文件。

```sh
# 针对所有模型
yao studio run model.cmd.CreateFromFile

# 针对一个模型
yao studio run model.model.CreateOne model

```

### ddic 模型

项目里自带了一个模型设计器的子模块。这个子模型里作一个扩展 yao model 的功能，比如 form/table/list 的配置都可以配置 model 文件里，然后自动合并覆盖自动生成的配置。详细可以看看源代码。

### 云 cloud 的翻译功能

YAO 官方提供了一个云 cloud 的翻译功能，会把一些数据库表中英文的字段说明翻译成中文。默认情况去掉了这一功能，一个是耗时，二是翻译的内容并不会十分准确。

如果你想使用云 cloud 的翻译功能，请设置环境变量 USE_TRANSLATE=TRUE

## 测试

目前有测试过两个项目

- mall 商城管理后台

Github 地址 https://github.com/macrozheng/mall

- litemall 小程序商城管理后台

Github 地址 https://github.com/linlinjava/litemall

## studio 开发

这个项目的 studio 部分的功能比较复杂，使用的是另外一个 typescript 项目 [yao-admin-ts](https://github.com/wwsheng009/yao-admin-ts) 自动生成。

## 感谢 yao,yao-admin 这么优秀的项目
