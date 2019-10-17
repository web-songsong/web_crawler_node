const config = require('./config')
const superagent = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const {mapLimit} = require('async')

/*获取列表列表信息*/
async function get_list_info(url) {
  const novel_list = []
  return await superagent.get(url).then(res => {
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
  return await superagent.get(local + href).then(res => {
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
async function get_write(list, filePath = 'data.txt') {
  const ws = fs.createWriteStream(filePath)
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

async function start() {
  let list = await get_list_info(config.url)
  // console.log(await downloadNovel(config.local, list[0]))
  get_write(list)
}

start()
