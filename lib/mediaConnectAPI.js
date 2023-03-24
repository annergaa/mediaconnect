let appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING).start();
// let client = appInsights.defaultClient;

const axios = require('axios');

module.exports = mediaConnect = {
    getToken: function () {
        const params = {
            client_id: "no.nativemedia",
            client_secret: "RulL(y!Sa2+i",
            grant_type: "client_credentials"
        };
        const data = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        const configGetToken = {
            method: 'post',
            url: 'https://connectid.no/user/oauth/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        return axios(configGetToken);
    },
    getUserData: function (customerNumber, accessToken) {
        const configGetUserData = {
            method: 'get',
            url: 'https://api.mediaconnect.no/capi/v1/client/customer/info/' + customerNumber,
            headers: {
                'Authorization': "Bearer " + accessToken
            }
        };
        return axios(configGetUserData);
    },
    getSubscriptionData: function (customerNumber, accessToken) {
        const configGetUserData = {
            method: 'get',
            url: 'https://api.mediaconnect.no/capi/v1/client/subscription/' + customerNumber,
            headers: {
                'Authorization': "Bearer " + accessToken
            }
        };
        return axios(configGetUserData);
    },
    getOrderData: function (orderId, accessToken) {
        const configGetOrderData = {
            method: 'get',
            url: 'https://api.mediaconnect.no/capi/v1/client/order/status/' + orderId,
            headers: {
                'Authorization': "Bearer " + accessToken
            }
        };
        return axios(configGetOrderData);
    }
}
