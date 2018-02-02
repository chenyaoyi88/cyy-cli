const repo = [{
        "name": "移动端",
        "child": [{
            "name": "SPA",
            "child": [{
                "name": "react",
                "url": "m.spa.react.git",
            }, {
                "name": "angular",
                "url": "m.spa.angular.git",
            }, {
                "name": "vue",
                "url": "m.spa.vue.git",
                "child": [{
                    "name": "vue-cli",
                    "url": "m.spa.vue.cli.git",
                    "child": []
                }]
            }]
        }, {
            "name": "单页活动",
            "child": [{
                "name": "普通",
                "url": "m.act.normal.git",
            }, {
                "name": "抽奖",
                "url": "m.act.lottery.git",
            }]
        }]
    },
    {
        "name": "PC端",
        "child": [{
            "name": "SPA",
            "url": "pc.spa.git",
            "child": [{
                "name": "react",
                "url": "pc.spa.react.git",
            }, {
                "name": "angular",
                "url": "pc.spa.angular.git",
            }, {
                "name": "vue",
                "url": "pc.spa.vue.git",
            }]
        }, {
            "name": "单页活动",
            "url": "pc.act.git",
            "child": [{
                "name": "抽奖",
                "url": "pc.act.lottery.git",
            }]
        }]
    },
    {
        "name": "APP端",
        "child": [{
            "name": "rn",
            "url": "app.rn.git",
        }, {
            "name": "weex",
            "url": "app.weex.git",
        }, {
            "name": "mui",
            "url": "app.mui.git",
        }]
    }
];