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


#### repo.config.json 文件说明

字段说明：

```javascript
"message": "xxx"    //  必填，提示
"type": "list"      //  必填，单选项内容
"type": "input"     //  必填，输入项内容
"name": "xxx"       //  必填，唯一值，用于模版层级识别 
"text": "xxx"       //  单选项显示的文字
"child": []         //  非必填，如果此层下面没有选项了，可不填该属性
```

默认 repo.config.json 示范输入项结构说明

```bash
├── 请选择平台类型                                 
├── 移动端                                 
│   ├── 请选择移动端类型                                 
│   ├── >单页应用       
│   │      ├── >react框架    
│   │      ├──  angular框架    
│   │      └──  vue框架                   
│   └──  活动           
│   │      ├── >普通    
│   │      └──  抽奖                  
├── PC端                                 
│   ├── 请选择PC端类型                            
│   ├── >单页应用     
│   │      ├── >react框架    
│   │      ├──  angular框架    
│   │      └──  vue框架                        
│   └──  活动             
│   │      └── >抽奖                    
├── APP端                    
│   ├── 请选择APP端类型                                
│   ├── >react-native框架                                 
│   ├──  weex框架                                      
│   ├──  mui框架                           
│   └──  ionic框架                          
```

```json
[{
        "type": "list",
        "message": "请选择平台类型",
        "name": "plaform",
        "text": "平台",
        "child": [{
                "name": "mobile",
                "text": "移动端",
                "child": [{
                    "name": "spa",
                    "text": "单页应用框架",
                    "child": [{
                        "name": "react",
                        "text": "react框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }, {
                        "name": "angular",
                        "text": "angular框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }, {
                        "name": "vue",
                        "text": "vue框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git",
                        "child": [{
                            "name": "cli",
                            "text": "vue-cli",
                            "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                        }]
                    }]
                }, {
                    "name": "act",
                    "text": "活动",
                    "child": [{
                        "name": "normal",
                        "text": "普通",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }, {
                        "name": "lottery",
                        "text": "抽奖",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }]
                }]
            },
            {
                "name": "pc",
                "text": "PC端",
                "child": [{
                    "name": "spa",
                    "text": "单页应用框架",
                    "child": [{
                        "name": "react",
                        "text": "react框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }, {
                        "name": "angular",
                        "text": "angular框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }, {
                        "name": "vue",
                        "text": "vue框架",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }]
                }, {
                    "name": "act",
                    "text": "活动",
                    "url": "https://github.com/chenyaoyi88/cyy-tool.git",
                    "child": [{
                        "name": "lottery",
                        "text": "抽奖",
                        "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                    }]
                }]
            },
            {
                "name": "app",
                "text": "APP端",
                "child": [{
                    "name": "react-native",
                    "text": "react-native框架",
                    "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                }, {
                    "name": "weex",
                    "text": "weex框架",
                    "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                }, {
                    "name": "mui",
                    "text": "mui框架",
                    "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                }, {
                    "name": "ionic",
                    "text": "ionic框架",
                    "url": "https://github.com/chenyaoyi88/cyy-tool.git"
                }]
            }
        ]
    },
    {
        "type": "input",
        "name": "appName",
        "message": "请输入项目名"
    },
    {
        "type": "input",
        "name": "author",
        "message": "请输入开发人员名字"
    }
]
```