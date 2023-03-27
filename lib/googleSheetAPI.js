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

const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const RESPONSES_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);
const CREDENTIALS = JSON.parse(fs.readFileSync('./lib/anlegg-og-transport-71e117fe9131.json'));

let now = Math.trunc(Date.now() / 1000);
let hoursAgo = 60 * 60 * 2
let importRows = now - hoursAgo;

module.exports = getRow = {
    customers: async function () {
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await doc.loadInfo();
        let sheet = doc.sheetsById[0];
        let rows = await sheet.getRows();

        let rowReturns = [];
        for (i = 0; rows.length > i; i++) {
            rowReturns.push({
                customerNumber: rows[i].customerNumber,
                time: rows[i].Time
            });
        }

        let rowReturnsFiltered = rowReturns.filter((row) => {
            return row.time > importRows
        })

        return new Promise((resolve, reject) => {
            resolve(rowReturnsFiltered);
        })
    },
    subscriptions: async function () {
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await doc.loadInfo();
        let sheet = doc.sheetsById[0];
        let rows = await sheet.getRows();

        let rowReturns = [];
        for (i = 0; rows.length > i; i++) {
            rowReturns.push({
                customerNumber: rows[i].customerNumber,
                // product: rows[i].Product,
                time: rows[i].Time
            });
        }

        let rowReturnsFiltered = rowReturns.filter((row) => {
            return row.time > importRows
        })

        return new Promise((resolve, reject) => {
            resolve(rowReturnsFiltered);
        })
    },
    orders: async function () {
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await doc.loadInfo();
        let sheet = doc.sheetsById[1285523461];
        let rows = await sheet.getRows();

        let rowReturns = [];
        for (i = 0; rows.length > i; i++) {
            rowReturns.push({
                connectIdOrderNumber: rows[i].connectIdOrderNumber,
                connectOrderNumber: rows[i].connectOrderNumber,
                payer: rows[i].payer,
                time: rows[i].time
            });
        }

        let rowReturnsFiltered = rowReturns.filter((row) => {
            return row.time > importRows
        })

        return new Promise((resolve, reject) => {
            resolve(rowReturnsFiltered);
        })
        
    }
}


// https://www.youtube.com/watch?v=9tD0YmfGZ1s&t=603s