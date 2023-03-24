const customerImport = require('../lib/customerImport')
const subscriptionImport = require('../lib/subscriptionImport')
const sendSlackMessage = require('../lib/slackApi')

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    await sendSlackMessage("Timer started");
    await customerImport();
    await subscriptionImport();
    await sendSlackMessage("Timer ended");

    context.log('JavaScript timer trigger function ran!', timeStamp);   
};