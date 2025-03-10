require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const app = express()
const {compile } = require('morgan')
//init middlewares
app.use(morgan("dev"))    // ra tóm tắt (use for dev)
// app.use(morgan("combined"))  // ra full cho request(tốt cho production)
// morgan("common")
// morgan("short")
// morgan("tiny")
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

require('./dbs/init.mongodb')
const {checkOverload} = require('./helper/check.connect')
checkOverload()

//init db
//init routes
app.use('/', require('./routes'))
//handler error

module.exports = app