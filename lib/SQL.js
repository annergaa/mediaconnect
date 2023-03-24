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

const sql = require('mssql');
const config = require('./config')
const mediaConnect = require('./mediaConnectAPI');

module.exports = SQL = {
    selectCustomer: async function (customer) {
        try {
            const poolConnectionSelect = await sql.connect(config);
            const selectResponse = await poolConnectionSelect.request().query(
                `SELECT * FROM [dbo].[customers] WHERE customerNumber = ${customer.customerNumber}`);
            poolConnectionSelect.close();
            return new Promise((resolve, reject) => {
                resolve(selectResponse);
            })
        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    selectSubscription: async function (customerNumber, product) {
        try {
            const poolConnectionSelect = await sql.connect(config);
            const selectResponse = await poolConnectionSelect.request().query(
                `SELECT * FROM [dbo].[subscriptions] WHERE customerNumber = ${customerNumber} AND product = '${product}'`);
            poolConnectionSelect.close();
            return new Promise((resolve, reject) => {
                resolve(selectResponse);
            })
        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    selectOrders: async function (order) {
        try {
            const poolConnectionSelect = await sql.connect(config);
            const selectResponse = await poolConnectionSelect.request().query(
                `SELECT * FROM [dbo].[orders] WHERE orderId = ${order.orderId}`);
            poolConnectionSelect.close();
            return new Promise((resolve, reject) => {
                resolve(selectResponse);
            })
        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    insertCustomer: async function (customer) {
        try {
            const poolConnectionInsert = await sql.connect(config);
            const insertResponse = await poolConnectionInsert.request().query(
                `INSERT INTO [dbo].[customers] (customerNumber, customerFirstName, customerLastName, companyName, phoneNumber, email)
                VALUES (${customer.customerNumber}, '${customer.firstName}', '${customer.lastName}', '${customer.company}', '${customer.phone}', '${customer.email}')`
            );
            poolConnectionInsert.close();
            return new Promise((resolve, reject) => {
                resolve(insertResponse);
            })
        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    insertSubscription: async function (customerNumber, subscription) {
        try {
            let startTime = new Date(subscription.startTime).toISOString();
            let endTime = new Date(subscription.endTime).toISOString();

            const poolConnectionUpdate = await sql.connect(config);
            const insertResponse = await poolConnectionUpdate.request().query(
                `INSERT INTO [dbo].[subscriptions] (customerNumber, product, couponCode, stopped, startTime, endTime, paid, couponNumber, discountFromFullSm, promotion, selger)
                        VALUES (${customerNumber}, '${subscription.product}', '${subscription.priceDetails.couponCode}', '${subscription.stopped}', '${startTime}', '${endTime}', '${subscription.paid}', 
                        ${subscription.priceDetails.couponNumber}, ${subscription.priceDetails.discountfromfullsm}, '${subscription.priceDetails.promotion}', '${subscription.salesPerson}')`
            );
            poolConnectionUpdate.close();
            return new Promise((resolve, reject) => {
                resolve(insertResponse);
            })

        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    insertOrder: async function (order, accessToken) {
        try {
            const orderDataResponse = await mediaConnect.getOrderData(order, accessToken);
            console.log(orderDataResponse.data);
            const orderTime = new Date(orderDataResponse.data.orders[0].orderTime).toISOString();
            try {

                const poolConnectionInsert = await sql.connect(config);
                const insertResponse = await poolConnectionInsert.request().query(
                    `INSERT INTO [dbo].[orders] (orderId, customerNumber, externalOrderId, orderTime, orderStatus, orderAmount)
                VALUES (${orderDataResponse.data.orders[0].orderId}, ${orderDataResponse.data.orders[0].customerNumber}, ${orderDataResponse.data.orders[0].externalOrderId}, '${orderTime}', '${orderDataResponse.data.orders[0].orderStatus}', ${orderDataResponse.data.orders[0].orderAmount})`
                );
                poolConnectionInsert.close();
                return new Promise((resolve, reject) => {
                    resolve(insertResponse);
                })
            } catch (e) {
                client.trackException({ exception: new Error(e.message) });
            }
        } catch (e) {

            client.trackException({ exception: new Error(e.message) });
        }
    },
    updateCustomer: async function (customer) {
        try {
            const poolConnectionUpdate = await sql.connect(config);
            const updateResponse = await poolConnectionUpdate.request().query(
                `UPDATE [dbo].[customers] SET customerFirstName = '${customer.firstName}', customerLastName= '${customer.lastName}', companyName='${customer.company}'  WHERE customerNumber = ${customer.customerNumber}`);
            poolConnectionUpdate.close();
            return new Promise((resolve, reject) => {
                resolve(updateResponse);
            })

        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }
    },
    updateSubscription: async function (customerNumber, subscription) {
        try {
            let startTime = new Date(subscription.startTime).toISOString();
            let endTime = new Date(subscription.endTime).toISOString();

            const poolConnectionUpdate = await sql.connect(config);
            const updateResponse = await poolConnectionUpdate.request().query(
                `UPDATE [dbo].[subscriptions] SET customerNumber=${customerNumber}, product='${subscription.product}', couponCode='${subscription.priceDetails.couponCode}', stopped='${subscription.stopped}', 
                    startTime='${startTime}', endTime='${endTime}', paid='${subscription.paid}', couponNumber=${subscription.priceDetails.couponNumber}, discountFromFullSm=${subscription.priceDetails.discountfromfullsm}, 
                    promotion='${subscription.priceDetails.promotion}', selger='${subscription.salesPerson}'  WHERE customerNumber = ${customerNumber} AND product = '${subscription.product}'`);

            poolConnectionUpdate.close();
            return new Promise((resolve, reject) => {
                resolve(updateResponse);
            })

        } catch (e) {
            client.trackException({ exception: new Error(e.message) });
        }

    },
    updateOrder: async function (order, accessToken) {
        try {
            const orderDataResponse = await mediaConnect.getOrderData(order.orderId, accessToken);
            const orderTime = new Date(orderDataResponse.data.orders[0].orderTime).toISOString();
            console.log(orderDataResponse.data.orders[0].orderTime);
            console.log(orderTime);


            try {
                const poolConnectionUpdate = await sql.connect(config);
                const updateResponse = await poolConnectionUpdate.request().query(
                    `UPDATE [dbo].[orders] SET orderId = ${orderDataResponse.data.orders[0].orderId}, customerNumber= ${orderDataResponse.data.orders[0].customerNumber}, externalOrderId=${orderDataResponse.data.orders[0].externalOrderId}, orderTime='${orderTime}', orderStatus='${orderDataResponse.data.orders[0].orderStatus}', orderAmount=${orderDataResponse.data.orders[0].orderAmount}  WHERE orderId = ${orderDataResponse.data.orders[0].orderId}`);
                poolConnectionUpdate.close();
                return new Promise((resolve, reject) => {
                    resolve(updateResponse);
                })

            } catch (e) {
                client.trackException({ exception: new Error(e.message) });
            }
        } catch (e) {

            client.trackException({ exception: new Error(e.message) });
        }

    }

}