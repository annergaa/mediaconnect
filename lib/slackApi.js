// let appInsights = require('applicationinsights');
// appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
// .setAutoDependencyCorrelation(true)
// .setAutoCollectRequests(true)
// .setAutoCollectPerformance(true, true)
// .setAutoCollectDependencies(true)
// .setAutoCollectConsole(true)
// .setUseDiskRetryCaching(true)
// .setSendLiveMetrics(false)
// .start();

const axios = require("axios")


const sendSlackMessage = (file, scope, name, code, message) => {
    
    const line = "----------------" + '\n';
    const fileSlack = "file: " + file + '\n';
    const scopeSlack = "scope: " + scope + '\n';
    const nameSlack = "name: " + name + '\n';
    const codeSlack = "code: " + code + '\n';
    const messageSlack = "message: " + message + '\n';

    const data = JSON.stringify({
        text: line + fileSlack + scopeSlack + nameSlack + codeSlack + messageSlack + line
    });
    console.log(data);
    const configSendSlackMessage = {
        method: 'post',
        url: process.env.SLACK_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };
    return axios(configSendSlackMessage);
}

module.exports = sendSlackMessage;