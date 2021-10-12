const fs = require('fs')
const { exec } = require('child_process')

exec(`node ${process.pwd()}/templates/${process.argv[2]}.js && aws ses create-template --region us-east-1 --profile serverless-admin --cli-input-json file://templates/${process.argv[2]}.json`, (error, stdout, stderr) => {
  if (error) {
    console.log(error.message)
  } else if (stderr) {
    console.log(stderr)
  } else {
    const data = fs.readFileSync(`${process.cwd()}/templates/${process.argv[2]}`);
    const { Template: { TemplateName } } = JSON.parse(data);
    console.log(`Successfully created template: ${TemplateName}`)
  }
})
