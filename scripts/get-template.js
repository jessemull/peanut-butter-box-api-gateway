const fs = require('fs')
const { exec } = require('child_process')

let data = fs.readFileSync(`${process.cwd()}/templates/${process.argv[2]}`);
let { Template: { TemplateName } } = JSON.parse(data);

exec(`aws ses get-template --region us-east-1 --profile serverless-admin --template-name ${TemplateName}`, (error, stdout, stderr) => {
  if (error) {
    console.log(error.message)
  } else if (stderr) {
    console.log(stderr)
  } else {
    console.log(stdout)
  }
})
