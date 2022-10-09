const express = require('express');
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const app = express();

app.use(bodyParser.json());
app.listen(4000);

app.get("/products/fetch", (req, res) => {

    console.log("GET product to update MTRL:", req.query.product.MTRL, " GROUPID:", req.query.product.GROUPID);

    return res.json({
        success: true,
        method: "GET",
        mtrl: req.query.product.MTRL,
        groupId: req.query.product.GROUPID
    })
})

app.post("/products/fetch", (req, res) => {

    console.log("POST product to update MTRL:", req.body.product.MTRL, " GROUPID:", req.body.product.GROUPID);

    if(req.body.product.GROUPID == "103"){
        console.log("-----------")
        return res.json({
            success: false
        })
    }

    return res.json({
        success: true,
        method: "POST",
        mtrl: req.body.product.MTRL,
        groupId: req.body.product.GROUPID
    })

});

app.post("/products", (req, res) => {

    // return res.json({
    //     success: false
    // })

    console.log(req.body);
    fse.appendFileSync('./dummyImport.txt', `${JSON.stringify(req.body)}\r\n`);

    return res.json({
        success: true,
        message: "Product saved",
        mtrl: req.body.mtrl,
        groupId: req.body.groupId
    })

});