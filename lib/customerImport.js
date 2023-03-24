let appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setUseDiskRetryCaching(true)
    .setAutoCollectPreAggregatedMetrics(true)
    .setSendLiveMetrics(false)
    .setAutoCollectHeartbeat(false)
    .setAutoCollectIncomingRequestAzureFunctions(true)
    .setInternalLogging(false, true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .enableWebInstrumentation(false)
    .start();

let client = appInsights.defaultClient;

const mediaConnect = require('./mediaConnectAPI');
const SQL = require('./SQL')
const getRow = require('./googleSheetAPI');

module.exports = customerImport = async () => {

    const accessTokenResponse = await mediaConnect.getToken();
    const accessToken = accessTokenResponse.data.access_token;

    //HENTE ALLE NYE BRUKERE FRA GOOGLE SHEET
    const customers = await getRow.customers();

    //LOOPE GJENNOM ALLE BRUKERE
    for (let ic = 0; customers.length > ic; ic++) {
        try {
            //HENTE ALL BRUKERDATA FRA MEDIA CONNECT VED Å SENDE INN BRUKER_ID OG ACCESSTOKEN
            const customerDataResponse = await mediaConnect.getUserData(customers[ic].customerNumber, accessToken)
            const customer = customerDataResponse.data;

            //SØKE ETTER BRUKER I SQL VED Å SENDE INN HELE BRUKEROBJEKTET
            const cn = await SQL.selectCustomer(customer);
            if (cn.rowsAffected[0] > 0) {
                try {
                    //OPPDATERE BRUKER VED Å SENDE INN HELE BRUKEROBJEKTET
                    await SQL.updateCustomer(customer);
                    console.log("update " + ic);
                } catch (e) {
                    client.trackException({ exception: new Error(e.message) });
                }
            }
            else {
                try {
                    //LEGGE INN BRUKER VED Å SENDE INN HELE BRUKEROBJEKTET
                    await SQL.insertCustomer(customer);
                    console.log("insert " + ic);
                } catch (e) {
                    client.trackException({ exception: new Error(e.message) });
                }
            }
        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    }
}