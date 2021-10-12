const fs = require('fs')
const { exec } = require('child_process')

exec(`node ${process.cwd()}/templates/${process.argv[2]}.js`, (error, stdout, stderr) => {
  if (error) {
    console.log(error.message)
  } else if (stderr) {
    console.log(stderr)
  } else {
    const data = fs.readFileSync(`${process.cwd()}/templates/${process.argv[2]}.json`);
    const { Template: { TemplateName } } = JSON.parse(data);
    console.log(`Successfully wrote template: ${TemplateName}`)
  }
})
