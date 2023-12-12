B = (e, t) => Object(a["d"])("https://dict.youdao.com/webtranslate", Object(n["a"])(Object(n["a"])({}, e), E(t)), {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
})
// 这段js的意思是把函数(e, t) => Object(a["d"])("https://dict.youdao.com/webtranslate", Object(n["a"])(Object(n["a"])({}, e), E(t)), {
//     headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//     }
// })传给B,e和t都是形参而非实参
// 翻译一下就是
B = function fn(e, t) {
    return Object(a["d"])("https://dict.youdao.com/webtranslate", Object(n["a"])(Object(n["a"])({}, e), E(t)), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
}
a["d"] = function l(e, t, o) {
    return new Promise((n, i) => {
            axios.post(e, t, o).then(e => {
                    n(e.data)
                }
            ).catch(e => {
                    i(e)
                }
            )
        }
    )
}
// 规范为
a["d"] = function l(e, t, o) {
    return new Promise(function (n, i) {
            return axios.post(e, t, o).then(e => {
                n(e.data)
            }).catch(e => {
                i(e)
            })
        }
    )
}

/**
 B被调用,相当于a["d"]被调用,a["d"]相当于send函数,发请求,之后应该执行then方法
 具体resolve的逻辑 是在B被调用时传入的而非在这里定义的
 new Promise()应该传入一个函数function(resolve,reject){}
 new Promise(function (resolve,reject) {
    if(请求成功){
            resolve(response)
    }else{
        reject(response)
    }
 })
 **/
function j(e) {
    return c.a.createHash("md5").update(e.toString()).digest("hex")
}

function k(e, t) {
    return j(`client=${u}&mysticTime=${e}&product=${d}&key=${t}`)
}

function E(e, t) {
    const o = (new Date).getTime();
    return {
        sign: k(o, e),
        client: u,
        product: d,
        appVersion: p,
        vendor: g,
        pointParam: m,
        mysticTime: o,
        keyfrom: b,
        mid: A,
        screen: h,
        model: f,
        network: v,
        abtest: O,
        yduuid: t || "abcdefg"
    }
}


/**
 浏览器中Object(n["a"])(Object(n["a"])({}, e), E(t))的返回值是
 {
    "keyid": "ai-translate-llm-pre",
    "token": "70a5478eef134328b54cd0733bc45fa4",
    "sign": "f789a870a78ebbd5e06ad241e68e50c7",
    "client": "fanyideskweb",
    "product": "webfanyi",
    "appVersion": "1.0.0",
    "vendor": "web",
    "pointParam": "client,mysticTime,product",
    "mysticTime": 1701693148591,
    "keyfrom": "fanyi.web",
    "mid": 1,
    "screen": 1,
    "model": 1,
    "network": "wifi",
    "abtest": 0,
    "yduuid": "abcdefg"
}
 我们应该能意识到Object(n["a"])等价于(n["a"])等价于(n.a)是一个函数 是一个合并对象的函数
 e的值是
 {
        "i": "god",
        "from": "auto",
        "to": "",
        "dictResult": true,
        "keyid": "webfanyi"
    }
 t的值是"fsdsogkndfokasodnaso"
 合并完之后变成上边的样子 说明E(t)一定生成了对象的其他部分 经过浏览器调试E(t)结果为
 {
    "sign": "465f61f9206c7d1b55538fc56e67d71d",
    "client": "fanyideskweb",
    "product": "webfanyi",
    "appVersion": "1.0.0",
    "vendor": "web",
    "pointParam": "client,mysticTime,product",
    "mysticTime": 1701703127822,
    "keyfrom": "fanyi.web",
    "mid": 1,
    "screen": 1,
    "model": 1,
    "network": "wifi",
    "abtest": 0,
    "yduuid": "abcdefg"
}
 验证了我们的所想
 所以函数a["d"]应该是有三个参数 第一个参数是url,第二个参数是该url传递的参数,第三个url是请求头
 这显然是一个发送请求的函数
 也就是说B可以被调用 调用之后发送朝向https://dict.youdao.com/webtranslate的请求
 t是EZAmCfVOH2CrBGMtPrtIPUzyv3bheLdk E(t)能够形成一个对象
 显然E(t)就是我们要的 我们进入E函数看看怎么实现的 如上所示
 观察之后发现核心的参数sign是把传入的第一个参数和当前时间const o = (new Date).getTime();
 放到k函数里边k(o, e)
 接下来看k
 function j(e) {
    return c.a.createHash("md5").update(e.toString()).digest("hex")
    }

 function k(e, t) {
    return j(`client=${u}&mysticTime=${e}&product=${d}&key=${t}`)
    }
 发现实际上sign是把一个字符串进行md5操作
 为了验证j函数是不是普通的md5 有没有加盐 我们在控制台调用j(123456)
 发现结果是e10adc3949ba59abbe56e057f20f883e
 说明是原版的md5
 实际上createHash("md5").update(str).digest("hex")本来就是nodejs原生库crypto
 调用方法为
 const crypto = require("crypto")
 s=crypto.createHash("md5").update("123456".toString()).digest("hex")
 console.log(s)
 显示e10adc3949ba59abbe56e057f20f883e
 所以sign参数就是把字符串"client=${u}&mysticTime=${e}&product=${d}&key=${t}"
 进行md5哈希摘要算法
 u是"fanyideskweb",e是当前时间(new Date).getTime();d是"webfanyi",t是传进来的参数 我们发现是固定的fsdsogkndfokasodnaso
 这个参数应该也是加密字符 我们现在只需要看看t的传入

 现在只需要看看B什么时候被调用的 传入的参数怎么来的 就可以了
 B被调用的逻辑是如下面

 显然B的调用如下所示 第一个实参是合并函数生成一个对象 第二个实参是"fsdsogkndfokasodnaso"固定值
 {
        "i": "god",
        "from": "auto",
        "to": "",
        "dictResult": true,
        "keyid": "webfanyi"
    }
 所以B传入的参数改变的值要翻译的单词有关 其他不会改变
 那么then里边就是调用之后返回值的处理 我们只需要看看 返回之后对返回值做了什么
 显然可以看到 decodeData就是解码函数 解码函数下面看
 可以看出 解码是先把返回值进行base64解密 再进行aes解密 至此分析完成
 **/
B(hebing(hebing({
    i: e.data.keyword,
    from: e.data.from,
    to: e.data.to
}, a), {}, {
    dictResult: !0,
    keyid: "webfanyi"
}), o).then(o => {
    Ko["a"].cancelLastGpt();
    const a = Ko["a"].decodeData(o, zo["a"].state.text.decodeKey, zo["a"].state.text.decodeIv)
        , n = a ? JSON.parse(a) : {};
    0 === n.code ? e.success && t(e.success)(n) : e.fail && t(e.fail)(n)
})
then_func = function (resp) {
    Ko["a"].cancelLastGpt();
    const a = Ko["a"].decodeData(resp, zo["a"].state.text.decodeKey, zo["a"].state.text.decodeIv)
        , n = a ? JSON.parse(a) : {};
    0 === n.code ? e.success && t(e.success)(n) : e.fail && t(e.fail)(n)
}
R = (t, o, n) => {
    const a = Buffer.alloc(16, y(o))
        , i = e.alloc(16, y(n))
        , r = crypto.createDecipheriv("aes-128-cbc", a, i);
    let s = r.update(t, "base64", "utf-8");
    return s += r.final("utf-8"),
        s
}