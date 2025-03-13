'use strict'

const HEADER = {
    API_KEY : 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const JWT = require('jsonwebtoken')
const asyncHandler = require('../helper/asyncHandler.js')
const { AuthFailureError, NotFoundError } = require('../core/error.response.js')
const { findByUserId } = require('../services/keyToken.service.js')

const createTokenPair = async (payload, publicKey, privateKey)=>{
    try {
        //accessToken
        const accessToken = await JWT.sign(payload, publicKey,{
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey,{
            expiresIn: '7 days'
        })
        JWT.verify(accessToken, publicKey,(err, decode)=>{
            if(err){
                console.log(`error verify::`, err)
            }else{
                console.log(`decode verify:`, decode)
            }
        })
        return {accessToken, refreshToken}
    } catch (error) {
        
    }
}

const authentication = asyncHandler ( async(req, res, next) =>{
    /*
        1. Check userId missing?
        2. get accessToken
        3. VerifyToken
        4. Check user in dbs?
        5. Check keyStore with this userId?
        6. Ok all => return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')
    
    //2.
    const keyStore = await findByUserId(userId)
    console.log(`keyStore::`,keyStore)
    if(!keyStore) throw new NotFoundError('Not found keyStore')
      
    //3.
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')
       
    //4.
    try {
        console.log(`accessToken::`,accessToken)
        console.log(`keyStore.publicKey::`,keyStore.publicKey)

        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid Userid')
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
       
        throw error
    }
})


const authenticationV2 = asyncHandler ( async(req, res, next) =>{
    /*
        1. Check userId missing?
        2. get accessToken
        3. VerifyToken
        4. Check user in dbs?
        5. Check keyStore with this userId?
        6. Ok all => return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')
    
    //2.
    const keyStore = await findByUserId(userId)
    console.log(`keyStore::`,keyStore)
    if(!keyStore) throw new NotFoundError('Not found keyStore')
      
    //3.
    if(req.headers[HEADER.REFRESHTOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)            
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid Userid')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
           
            throw error
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')
       
    //4.
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid Userid')
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
       
        throw error
    }
})

const verifyJWT = async (token, keSecret)=>{
    return await JWT.verify(token, keSecret)
}
module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}