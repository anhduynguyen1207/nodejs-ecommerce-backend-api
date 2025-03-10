'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _SECONDS = 5000
//count Connect
const countConnect = () => {
    const numConnection  = mongoose.connections.length
    console.log(`Number of connections::${numConnection}`)
}

//check over load
const checkOverload = () => {
    setInterval( ()=>{
        const numConnection  = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss;
        // Example maximum number of connection bases on number of cores
        const maxConnections = numCores * 5
        // console.log(`Memory usage::${memoryUsage / 1024 / 1024} MB`)

        if(numConnection > maxConnections){
            console.log(`Connections overload detected`)
            //notidy.send(...)
        }
    }, _SECONDS) // Monitor every 5 sesonds
}

module.exports = {
    countConnect,
    checkOverload
}
