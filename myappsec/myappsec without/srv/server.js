const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    hana: { tag: 'hana' }
});

const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));

const {
    desc
} = require("@sap-cloud-sdk/core");

const {
    SalesOrder,
    SalesOrderItem
} = require("@sap/cloud-sdk-vdm-sales-order-service");

app.use(bodyParser.json());

app.get('/srv/students', function (req, res) {
    req.db.exec('SELECT * FROM "myappsec.db::students" WHERE "score" > 90 ORDER BY "score" DESC', function (err, results) {
        if (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.toString());
            return;
        }
        res.status(200).json(results);
    });
});

app.get('/srv/user', function (req, res) {
    res.status(200).json(req.user);
});

app.get('/srv/session', function (req, res) {
    req.db.exec('SELECT * FROM M_SESSION_CONTEXT', function (err, results) {
        if (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.toString());
            return;
        }
        res.status(200).json(results);
    });
});

app.get('/srv/db', function (req, res) {
    req.db.exec('SELECT SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE FROM M_DATABASE', function (err, results) {
        if (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.toString());
            return;
        }
        res.status(200).json(results);
    });
});

app.get("/srv/sales", function (req, res) {
    getSalesOrders()
        .then(salesOrders => {
            res.status(200).json(salesOrders);
        });
});

function getSalesOrders() {
    return SalesOrder.requestBuilder()
        .getAll()
        .filter(SalesOrder.TOTAL_NET_AMOUNT.greaterThan(2000))
        .top(3)
        .orderBy(new desc(SalesOrder.LAST_CHANGE_DATE_TIME))
        .select(
            SalesOrder.SALES_ORDER,
            SalesOrder.LAST_CHANGE_DATE_TIME,
            SalesOrder.INCOTERMS_LOCATION_1,
            SalesOrder.TOTAL_NET_AMOUNT,
            SalesOrder.TO_ITEM.select(SalesOrderItem.MATERIAL, SalesOrderItem.NET_AMOUNT)
        )
        .withCustomHeaders({
            'APIKey': '<APIKEY>'
        })
        .execute({
            url: 'https://sandbox.api.sap.com/s4hanacloud'
            //destinationName: ''
        });
}

const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});
