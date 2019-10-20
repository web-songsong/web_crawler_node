const superagent = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const {mapLimit} = require('async')

/*获取列表列表信息*/
async function get_list_info(url) {
  const novel_list = []
  return superagent.get(url).then(res => {
    const $ = cheerio.load(res.text)
    $('.box_con #list  dl>dt').each((key, tagVal) => {
      if (
        $(tagVal)
          .text()
          .includes('正文')
      ) {
        $(tagVal)
          .nextAll('dd')
          .each((key, val) => {
            let link_a = $(val).find('a')
            novel_list.push({
              title: link_a.text(),
              href: link_a.attr('href')
            })
          })
      }

    })
    return novel_list
  })
}

/*解析结构*/
async function downloadNovel(local, {href, title}) {
  console.log('~~~~当前解析~~~~~: ', title)
  let url = local + href
  console.log(url)
  return superagent.get(url).then(res => {
    const $ = cheerio.load(res.text, {decodeEntities: false})
    let body = $('.content_read #content').html().trim().split(/<br>|\n/g).slice(1, -4).join('\r\n')
    return `
${title}

${body}
    `
  })
}

/*读取列表数据，进行获取， 写入操作*/
async function get_write(list, local, filePath = './', file_name = 'novel.txt') {
  const ws = fs.createWriteStream(filePath + file_name)
  mapLimit(
    list,
    10,
    async (item) => {
      return await downloadNovel(local, item)
    },
    (err, results) => {
      if (err) throw err
      console.log('开始写入')
      results.forEach(text => ws.write(text))
      ws.end()
      console.log('写入完成')
    }
  )
}

/*运行*/
async function start(config, callBack) {
  const {url, local, novel_path, file_name} = config
  let list = await get_list_info(url)
  get_write(list.slice, local, novel_path, file_name)
  callBack && callBack()
}

const config = require('./config')
start(config)