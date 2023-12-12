import requests
import datetime
from hashlib import md5
from Crypto.Cipher import AES, DES
from Crypto.Util.Padding import pad, unpad
import base64
# 直接用浏览器中的参数发送请求 发现返回值太短了 说明参数肯定不合法
# 肯定是sign参数出了问题 可能还有mysticTime参数也需要获取当前时间
# 我们需要知道sign参数的来源 根据分析.js我们知道sign参数有下列参数生成
"""
sign的生成
"""
u = "fanyideskweb"
e = int(datetime.datetime.now().timestamp() * 1000)
d = "webfanyi"
t = "fsdsogkndfokasodnaso"
sign_param = f"client={u}&mysticTime={e}&product={d}&key={t}"
sign_md5 = md5()
sign_md5.update(sign_param.encode())
sign = sign_md5.hexdigest()
"""
url和其他参数的组装
"""
url = "https://dict.youdao.com/webtranslate"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "https://fanyi.youdao.com/",
    "Cookie": "OUTFOX_SEARCH_USER_ID=-580141615@121.19.39.73; OUTFOX_SEARCH_USER_ID_NCOO=1063133201.7130609"
}
data = {
    "i": "god",
    "from": "auto",
    "to": "",
    "domain": "0",
    "dictResult": "true",
    "keyid": "webfanyi",
    "sign": sign,
    "client": "fanyideskweb",
    "product": "webfanyi",
    "appVersion": "1.0.0",
    "vendor": "web",
    "pointParam": "client,mysticTime,product",
    "mysticTime": e,
    "keyfrom": "fanyi.web",
    "mid": 1,
    "screen": 1,
    "model": 1,
    "network": "wifi",
    "abtest": 0,
    "yduuid": "abcdefg"
}
resp = requests.post(url=url, data=data, headers=headers)
print(resp.text)
"""
开始解密
"""
decode_key_str = "ydsecret://query/key/B*RGygVywfNBwpmBaZg*WT7SIOUP2T0C9WHMZN39j^DAdaZhAnxvGcCY6VYFwnHl"
decode_iv_str = "ydsecret://query/iv/C@lZe2YzHtZ2CYgaXKSVfsb7Y4QWHjITPPZ0nQp87fBeJ!Iv6v^6fvi2WN@bYpJ4"

key_md5 = md5()
iv_md5 = md5()
key_md5.update(decode_key_str.encode())
iv_md5.update(decode_iv_str.encode())
key_md5_bytes = key_md5.digest()
iv_md5_bytes = iv_md5.digest()

aes = AES.new(key=key_md5_bytes, mode=AES.MODE_CBC, iv=iv_md5_bytes)
b64_bytes = base64.b64decode(resp.text.replace("_", "/").replace("-", "+"))
result = unpad(aes.decrypt(b64_bytes), 16).decode("utf-8")
print(result)
