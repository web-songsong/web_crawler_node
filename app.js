const config = require('./config')
const superagent = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const {mapLimit} = require('async')

/*获取列表列表信息*/
async function get_list_info(url) {
  const novel_list = []
  return superagent.get(url).then(res => {
    const $ = cheerio.load(res.text)
    $('.box_con #list dt').eq(1).nextAll().each((key, val) => {
      let link_a = $(val).find('a')
      novel_list.push({
        title: link_a.text(),
        href: link_a.attr('href')
      })
    })
    return novel_list
  })
}


/*解析结构*/
async function downloadNovel(local, {href, title}) {
  console.log('ok---', title)
  return superagent.get(local + href).then(res => {
    const $ = cheerio.load(res.text, {decodeEntities: false})
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


/*读取列表数据，进行获取， 写入操作*/
async function get_write(list, local, filePath = 'data.txt') {
  const ws = fs.createWriteStream(filePath)
  mapLimit(
    list,
    10,
    (item, callback) => {
      downloadNovel(local, item).then(str => {
        callback(null, str)
      })
    },
    (err, allData) => {
      if (err) throw err
      console.log('ws')
      allData.forEach(text => {
        ws.write(text)
      })
      console.log('ok')
      ws.end()
    }
  )
}


/*运行*/
async function start() {
  const {url, local} = config
  let list = await get_list_info(url)
  await get_write(list, local)
}

start()
