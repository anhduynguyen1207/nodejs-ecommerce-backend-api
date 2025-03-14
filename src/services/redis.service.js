'use strict'

const redis = require('redis')
const {promisify} = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo.js')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.pexpire).bind(redisClient)
const setnxAsnc = promisify(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId)=>{
    const key = `lock_v2024_${productId}`
    const retryTimes=10;
    const expireTime= 3000; //3 second tạm lock

    for(let i=0; i < retryTimes; i++){
        // tao mot key, thằng nào nắm giữ được vào thanh toán
        const result = await setnxAsnc(key, expireTime)
        console.log(`result::`, result)
        if(result ===1){
            //thao tác với inventory
            const isReversation = await reservationInventory({productId, quantity, cartId})
            if(isReversation.modifiedCount){
                await pexpire(key, expireTime)
                return key
            }
            return null;
        }else{
            await new Promise((resolve)=> setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async keyLock =>{
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}