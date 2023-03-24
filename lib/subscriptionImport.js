let appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING).start();
// let client = appInsights.defaultClient;

const mediaConnect = require('./mediaConnectAPI');
const SQL = require('./SQL')
const getRow = require('./googleSheetAPI');

module.exports = subscriptionImport = async () => {
    const accessTokenResponse = await mediaConnect.getToken();
    const accessToken = accessTokenResponse.data.access_token;

    //HENTE ALLE NYE BRUKERE FRA GOOGLE SHEET
    const customers = await getRow.customers();

    //LOOPE GJENNOM ALLE BRUKERE
    for (let ic = 0; customers.length > ic; ic++) {
        try {
            //HENTE ALL BRUKERDATA FRA MEDIA CONNECT VED Å SENDE INN BRUKER_ID OG ACCESSTOKEN
            const subscriptionDataResponse = await mediaConnect.getSubscriptionData(customers[ic].customerNumber, accessToken);
            const subscriptions = subscriptionDataResponse.data.subscriptions
            //LOOPE GJENNOM ALLE ABONNEMENT PR BRUKER
            for (let is = 0; subscriptions.length > is; is++) {

                //SØKE ETTER ABONNEMENT I SQL VED Å SENDE INN BRUKERID OG PRODUKTNAVN
                const cn = await SQL.selectSubscription(customers[ic].customerNumber, subscriptions[is].product);
                if (cn.rowsAffected[0] > 0) {
                    try {
                        //OPPDATERE ABONNEMENTET VED Å SENDE INN BRUKERID OG HELE ABONNEMENT OBJEKTET
                        await SQL.updateSubscription(customers[ic].customerNumber, subscriptions[is]);
                        console.log("update " + " " + [is] + " " + customers[ic].customerNumber + " " + subscriptions[is].product)
                    } catch (e) {
                        // client.trackException({ exception: e.message });
                    }
                }
                else {
                    try {
                        //LEGGE INN AONNEMENTET VED Å SENDE INN BRUKERID OG HELE ABONNEMENT OBJEKTET
                        await SQL.insertSubscription(customers[ic].customerNumber, subscriptions[is]);
                        console.log("insert " + " " + [is] + " " + customers[ic].customerNumber + " " + subscriptions[is].product);
                    } catch (e) {
                        // client.trackException({ exception: e.message });
                    }
                }
            }

        } catch (e) {
            // client.trackException({ exception: e.message });
        }
    }
}