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

module.exports = orderImport = async () => {
    const accessTokenResponse = await mediaConnect.getToken();
    const accessToken = accessTokenResponse.data.access_token;

    //HENTE ALLE NYE ORDRE FRA GOOGLE SHEET
    const orders = await getRow.orders();

    // LOOPE GJENNOM ALLE ORDRE
    for (let ic = 0; orders.length > ic; ic++) {
        try {
            //HENTE ALL ORDREDATA FRA MEDIA CONNECT VED Å SENDE INN CONNECTIDORDERNUMBER OG ACCESSTOKEN
            const orderDataResponse = await mediaConnect.getOrderData(orders[ic].connectIdOrderNumber, accessToken);
            const order = orderDataResponse.data.orders

            // SØKE ETTER ORDRE I SQL VED Å SENDE INN CONNECTIDORDERNUMBER
            const cn = await SQL.selectOrders(order[0].orderId);
            if (cn.rowsAffected[0] > 0) {
                try {
                    //OPPDATERE ABONNEMENTET VED Å SENDE INN HELE ORDRE OBJEKTET
                    await SQL.updateOrder(order);
                    console.log("update " + [ic] + " " + order[0].orderId)
                } catch (e) {
                    client.trackException({ exception: new Error(e.message) });
                }
            }
            else {
                try {
                    //LEGGE INN AONNEMENTET VED Å SENDE INN HELE ORDER OBJEKTET
                    await SQL.insertOrder(order);
                    console.log("insert " + [ic] + " " + order[0].orderId);
                } catch (e) {
                    client.trackException({ exception: new Error(e.message) });
                }
            }


        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    }
}