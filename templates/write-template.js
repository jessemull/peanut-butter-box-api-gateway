const fs = require('fs')
const path = require('path')

const regex = /(?<=>)\s+(?=<)/gi

const writeTemplate = ({ fileName, SubjectPart, TemplateName }) => {
  const html = fs.readFileSync(path.join(__dirname, `${fileName}.template`), 'utf8')
  const template = {
    Template: {
      TemplateName,
      SubjectPart,
      HtmlPart: html.replace(regex, '')
    }
  }
  const data = JSON.stringify(template, null, 2)
  fs.writeFileSync(path.join(__dirname, `${fileName}.json`), data)
}

module.exports = writeTemplate
