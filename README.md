# web_crawler_node

# 利用node.js完成爬虫

> 网络爬虫是一种按照一定的规则，自动地抓取网络信息的程序或者脚本

## 目标

* 了解爬虫的本质
* 利用node的相关模块来解决爬虫的问题
* 分析数据的结构以及对数据进行处理

## 流程

1. 利用superagent请求数据
2. 利用cheerio解析获取的数据
3. 利用fs来写入数据
4. 利用async模块来优化请求流程

## 实现

1. 首先需要安装需要的依赖包

   ```bash
   yarn add superagent cheerio async
   ```

   > 如果不知道如何每个模块的功能，可以在[npm](https://www.npmjs.com/) 查找相应的功能以及用法

2. 寻找想要爬去的东西以及地址

   这里以http://xclient.info/s/ 网站为例，这个是一个mac软件下载的优质网站，用来爬去软件的名字和地址，方便快速查询软件的下载地址。

   > 这里有点取巧，没有识别页面中的下一页的链接来继续爬去下一页的信息，我看到这个网站的每一页的连接只是更改url上的页面数，所以这里直接利用while来写url的数组。

   ```javascript
   const request = require('superagent')
   const cheerio = require('cheerio')
   const async = require('async')
   const fs = require('fs')
   let n = 1
   
   const URLs = []
   while (n < 64) {
     URLs.push(`http://xclient.info/s/${n}`)
     n++
   }
   async.mapLimit(
     URLs,
     5,
     async function(url) {
       return request.get(url).then(res => {
         const $ = cheerio.load(res.text)
         let file = {}
         $('.post_list li .main>a').each((key, val) => {
           const itemHref = $(val).attr('href')
           const itemTitle = $(val).attr('title')
           file[key] = { name: itemTitle, url: itemHref }
         })
         return file
       })
     },
     (err, res) => {
       if (err) throw err
       fs.writeFile('data.json', JSON.stringify(res), err => {
         if (err) throw err
         console.log('ok')
       })
     }
   )
   ```

   >  如果有哪里不懂可以评论留言
