<p align="center">
    <h1 align="center">Yao Admin</h1>
</p>
<p align="center">
  <a aria-label="website" href="https://yaoapps.com" target="_blank">
    Website
  </a>
  ·
  <a aria-label="producthunt" href="https://www.producthunt.com/posts/yao-app-engine" target="_blank">
    Producthunt
  </a>
  ·
  <a aria-label="twitter" href="https://twitter.com/YaoApp" target="_blank">
    Twitter
  </a>
  ·
  <a aria-label="discord" href="https://discord.gg/nsKmCXwvxU" target="_blank">
    Discord
  </a>
</p>

真零代码，使用 Yao-Admin 连接数据库，你就有了一个管理后台。

![演示](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/yao-admin/%E6%80%BB%E9%A2%84%E8%A7%88.gif)

Yao Admin 采用 <a href="https://github.com/YaoApp/yao">Yao 应用引擎开发</a>，借助强大的 Yao Studio API 和 Yao Brain 平台，自动生成数据模型、表格、表单和图表界面；实现连接数据库，全自动生成一套功能完整的管理后台。适用于快速搭建应用管理后台和 API 接口，快速制作应用 API 接口等场景。

### 为什么使用 Yao Admin ?

1.**零代码** 连接数据库直接生成管理后台。

2.**可迭代** 可根据业务需求，按需修改管理界面

3.**接口生成** 低代码方式制作 API 接口，支持多种鉴权方式

### 安装

**首先准备好一个有数据表的数据库**

#### 使用 Yao

[安装 YAO](https://yaoapps.com/doc/%E4%BB%8B%E7%BB%8D/%E5%AE%89%E8%A3%85%E8%B0%83%E8%AF%95)

```bash
mkdir -p /app/data
cd /app/data
yao get yaoapp/yao-admin
yao start
```

根据命令行提示配置后登录管理后台

管理后台地址: `http://<IP>:<PORT>/yao/`

示例:` http://127.0.0.1:5099/yao`

根据命令行提示配置后登录管理后台

管理后台地址: `http://<IP>:<PORT>/yao/`

示例:` http://127.0.0.1:5099/yao`

默认用户名: `xiang@iqka.com`

默认密码: `A123456p+`

## 效果演示

我们找了一些优秀的开源项目，测试 Yao-Admin 生成管理后台的实际效果。
