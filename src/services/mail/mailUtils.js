var fs = require('fs')
var path = require('path')
var Handlebars = require('handlebars')
var mjml = require('mjml')

module.exports = {
  readAndRenderTemplate
}

/**
 * Generates templates based on passed data
 * @param {any} templateName -> Template name register_user, welcome, password_reset
 * @param {any} templateData -> Data ex: domain, activationurl, username and so on
 * @returns result GeneratedTemplate with passed data
 */
function readAndRenderTemplate (templateName, templateData) {
  return new Promise((resolve, reject) => {
    var template = path.join(`${__dirname}/templates/${templateName}.mjml`)
    fs.readFile(template, 'utf8', (err, file) => {
      if (err) {
        reject(err)
      }
      const handlebarTemplate = Handlebars.compile(file)
      const text = handlebarTemplate(templateData)
      const htmlOutput = mjml(text)
      resolve(htmlOutput.html)
    })
  })
}

