const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const { mapLimit } = require('async')
const Url = 'https://www.bixiadu.com/bxd-53390/'

/**
 * 获取章节列表
 *
 * @param {*} url
 * @returns Promise
 */
function getLIst(url) {
  return request.get(url).then(res => {
    const list = []
    const $ = cheerio.load(res.text)
    console.log('start!!')
    $('.box_con #list dl>dt').each((index, value) => {
      if (
        $(value)
          .text()
          .includes('正文')
      ) {
        $(value)
          .nextAll()
          .each((key, val) => {
            let info = $(val).find('a')
            let title = info.text()
            let href = url + info.attr('href')
            list.push({
              title,
              href
            })
          })
      }
    })
    return list
  })
}

/**
 * 下载小说
 *
 * @param {*} {href,title}
 */
async function downloadNovel({ href, title }) {
  console.log('ok---', title)
  return await request.get(href).then(res => {
    const $ = cheerio.load(res.text, { decodeEntities: false })
    let body = $('.content_read #content')
      .html()
      .trim()
      .split(/<br>|\n/g)
      .slice(1, -4)
      .join('\r\n')
    return `
${title}

${body}
    `
  })
}
async function test() {
  const list = await getLIst(Url)
  const ws = fs.createWriteStream('data.txt')

  mapLimit(
    list,
    3,
    (item, callback) => {
      setTimeout(() => {
        downloadNovel(item).then(str => {
          callback(null, str)
        })
      }, Math.random * 1000)
    },
    (err, allData) => {
      if (err) throwerr
      console.log('ws')
      allData.forEach(text => {
        ws.write(text)
      })
      console.log('ok')
      ws.end()
    }
  )
}
test()
