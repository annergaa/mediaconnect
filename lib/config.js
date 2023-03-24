module.exports = {
    user: 'atproff123', // better stored in an app setting such as process.env.DB_USER
    password: 'm1R20i14!', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'atproff.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'atproff', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        // encrypt: true
    }
}