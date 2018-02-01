import request = require('request')
import cron = require('node-cron')
import shell = require('shelljs')
// let shell = require('./shellHelper')

cron.schedule('* 30 * * * *', () => {
  request.get('https://slack.com/api/users.getPresence',
    {
      qs: {
        token: process.env.SLACK_API_TOKEN,
        user: process.env.PROCESS_CHECK_USER,
      }
    }, (error,response,body) => {
      if (error) {
        request.post('https://slack.com/api/chat.postMessage', 
        {
          form: {
            token: process.env.SLACK_API_TOKEN,
            channel: process.env.SLACK_NOTICE_CHANNEL,
            username: '#{name}',
            text: 'bot restart failed:'
          }
        }, (err,res,b) => {
          console.error(err)
        })
      } else {
        if (JSON.parse(body).presence !== "active") {
          (async () => {
            await shell.cd(process.env.BOT_APP_PATH)
            // pm2 exe
            await shell.exec('pm2 restart #{main script name} --merge-logs --log-date-format="YYYY-MM-DD HH:mm Z"')
          })()
        }
      }
    }
  )
})
