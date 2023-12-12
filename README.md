# youdao_translate
对于有道翻译的翻译接口的逆向
打开有道翻译,可以清楚的看到,异步发送的请求只有两个,显然是webtranslate,来看请求头,显然没什么特殊的请求头,在请求体中可以清楚的看到,该请求是post请求,参数包括了很多字段,显然需要逆向的字段是sign
<img width="1021" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/02a6514f-5709-4898-80fd-881937682250">
<img width="678" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/11dc6380-b2fe-4512-9864-4cae1f4e37ea">
<img width="235" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/63ae29b5-97c3-4d56-b8aa-8f0d23749be5">
这个sign看着像是md5编码,但是还不确定.
同时看key请求可以发现key请求并未有sign字段。
现在有两个思路,一是全局搜索sign字段,而是搜索url
先搜索sign试试,发现有很多结果,因此尝试搜索/webtranslate
<img width="1272" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/18dfc58e-91fb-4bc6-8cae-965704979bdb">
只有一个结果,显然入口就是这里,进去打断点.这里注意断点打在里边一点,不然没办法断住。这一句包含url和请求头,很可能就是请求发送的地方.这一句是箭头函数,我们把它拿出来,放到nodejs中,转成es5的函数形式,如下
<img width="1246" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/a899fc3c-7557-4375-bfc1-b6ec874698dc">
<img width="720" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/9b110e37-b59f-41f1-a845-c343bfc2ef15">
<img width="660" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/11d1c265-129e-4dac-8637-6e0a7e3474d3">
意思是,把这个匿名函数赋值给B,这个匿名函数有两个参数,一个是e,一个是t.同时这个匿名函数被调用时,返回另一个匿名函数a["d"],a["d"]这个函数有三个参数,第一个参数是"https://dict.youdao.com/webtranslate",
第二个是Object(n["a"])(Object(n["a"])({}, e), E(t)),第三个参数是一个对象,里边是请求头信息.通过console,我们看看e,t,还有Object(n["a"])(Object(n["a"])({}, e), E(t))都是什么
<img width="443" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/c2273109-b812-4be4-9101-5821874040b7">
<img width="417" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/4ffdaecf-d302-43f2-b8c6-9f2af8872c04">
可以看到,很显然,e是部分请求参数,t是一段固定字符串(多试几次),Object(n["a"])(Object(n["a"])({}, e), E(t))是包含sign的请求体,通过console,我们看看e,t,还有Object(n["a"])(Object(n["a"])({}, e), E(t))都是什么
Object(n["a"])(Object(n["a"])({}, e), E(t))可以简写成n["a"](n["a"]({}, e), E(t)),有经验的一眼看出来,n["a"]是一个合并对象的函数,也就是说E[t]是关键点,通过console验证一下,
现在我们进入E函数,看看传入一个固定字符串t,是怎么把sign算出来的.就在上边,可以看待其他参数都可以固定,唯独sign参数  通过传进来的参数和当前时间戳算出来。k(o, e),进入k函数看看,
<img width="689" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/561a12a4-1b28-4c36-a8d8-f6b9da29f68e">
<img width="405" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/ed2c67a8-425a-45ba-a9e2-a8549fb325fa">
<img width="456" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/103fb131-a96e-4f3d-a040-872b1d0e7e4d">
k同样在上边,可以看得出来是典型的md5加密,j函数中应该是crypto.createHash("md5").update(e.toString()).digest("hex"),crypto是nodejs原生库,可以直接导入,
当然这里如果不是特别熟悉md5加密的话可以把j函数放到console试试,跟标准的md5一不一样.
在这里已经很清晰了,sign就是一个md5加密,其他都固定,只有时间是当前时间戳.这时我们用python完全可以实现这个请求的发送部分.
代码在其他文件里,发现返回值是一段密文,如下,显然返回值是加密的.这时候,我们可以看看请求的调用栈,看看发送逻辑.
<img width="970" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/31a81a02-f96a-4eb0-93a0-2864737e08b2">
<img width="648" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/30625fa6-dc93-4c3d-be09-cac95c0f4e1e">
显然chunk开头的都是第三方函数,我们直接从第一个自己写的函数开始看,即app.03be6f01.js,由于是promise发送的请求,和普通的ajax不一样.
这里其实一看就知道了,其实就是一个对promise的封装,实际调用的逻辑应该是l().then(function(){}).catch(function(){}),then里边是请求成功时执行的函数
该传入的参数是response.data.这里是l的定义,我们来看l的调用,另外我们发现l其实就是a["d"],逻辑是B封装了l,调用b返回l，之后执行then(),
显然Ko["a"].decodeData(o, zo["a"].state.text.decodeKey, zo["a"].state.text.decodeIv)就是对返回数据的解密,进入看看
<img width="517" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/8fac8596-2622-4eff-b43a-b2b7267e5b0e">
<img width="388" alt="image" src="https://github.com/zhizhuodemao/youdao_translate/assets/47770924/fc0585d2-9fa3-40e4-8df7-b1b62c94dff1">
可以知道,解密方法是先对返回值进行base64解密,在进行aes解密,模式是cbc,key和iv都是已知固定字符串的md5加密形式,这里看到y()函数就是md5加密函数
可以尝试用python实现了。需要注意的是,该base64的加密有点不同,把+换成了-，把/换成了_.我们需要换回来,不然会报错







