# cyy-cli

一个非常简单的通过命令生成模板的工具，用户可以按照默认的仓库配置文件的格式，上传自己的仓库配置文件，由此实现添加、删除各种模版。

## 安装

```bash
npm install cyy-cli -g

// 推荐 cnpm 方式安装
cnpm install cyy-cli -g
```
## 生成模板

```bash
cyy-cli
```

## 其他命令

上传模版

```bash
cyy-cli upload xxx.json
```

下载参考模版

```bash
cyy-cli download
```

重置参考模版

```bash
cyy-cli reset
```

#### 操作如下图


![操作流程](pic/cyy-cli.gif)

