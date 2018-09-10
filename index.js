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
