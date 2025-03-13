'use strict'

const shopModel = require("../models/shop.model")
const bycypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require('../utils')
const {BadRequestError,ConflictRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { type } = require("os")
const { format } = require("path")
const { findByEmail } = require("./shop.service.js")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    /*
        1 check token use?
    */
    static handlerRefreshToken =  async ( refreshToken ) =>{
        //check xem token nay da duoc su dung chua 
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // neu co
        if(foundToken){
            // decode xem ai dang su dung
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({userId, email})
            //xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happen!! Pls relogin')
        }
        //No
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken) throw new AuthFailureError('Shop not registed 1')
        
        //verifyToken
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('[2]---',{userId, email})
        //check Userid
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registed 2')
        
        // create 1 cap moi
        const tokens = await createTokenPair({userId, email},holderToken.publicKey,holderToken.privateKey)

        //update token
        await holderToken.updateOne({
            $set:{
                refreshToken: tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed: refreshToken //đã được sử dụng để lấy token mới rồi
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static handlerRefreshTokenV2 =  async ({ keyStore, user, refreshToken} ) =>{
        const {userId , email} = user;
        //kiểm tra refreshtoken này đã sử dụng chưa
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happen!! Pls relogin')
        }
        //kiểm tra refreshtoken trong db và người dùng đưa vào
        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registed')

        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registed 2')
        
        // create 1 cap moi
        const tokens = await createTokenPair({userId, email},keyStore.publicKey,keyStore.privateKey)

        //update token
        await keyStore.updateOne({
            $set:{
                refreshToken: tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed: refreshToken //đã được sử dụng để lấy token mới rồi
            }
        })

        return {
            user ,
            tokens
        }
    }

    static logout =  async ( keyStore ) =>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log('delKey::',{delKey})
        return delKey
    }

    /*
        1 check email in dbs
        2 match password
        3. create AccessToken vs RefreshTOken and save
        4. Generate token
        5. Get data return login
    */
    static login =  async ({ email, password, refreshToken = null}) =>{
        //1.
        const foundShop = await findByEmail({email})
        if(!foundShop)  throw new BadRequestError('Shop not registered!')
        //2.
        const match = bycypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')
        //3.
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        //4.
        const { _id: userId} = foundShop
        const tokens = await createTokenPair({userId, email},publicKey,privateKey)
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, 
            publicKey,
            userId
        })
        return{
            shop: getInfoData({fileds:['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }

    static signUp = async ({ name, email, password}) =>{
        try {
            //step1: check email exist
            const holderShop = await shopModel.findOne({ email}).lean()
            if(holderShop){
                throw new BadRequestError('Error: Shop already registered!')
            }
            const passwordHash = await bycypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles:[RoleShop.SHOP]
            })
            if(newShop){
                // created privateKey , publicKey
                // Cách triển khai dùng thuật toán bất đối xứng để mã hoá và gen ra 2 key  cao cấp phức tạp
                // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa',{
                //     modulusLength: 4096,
                //     publicKeyEncoding:{
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding:{
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })

                //Cách 2 đơn giản dễ hiểu hơn 
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({ privateKey, publicKey})
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })
                if(!keyStore){

                    throw new BadRequestError('Error: keyStore error!')
                }
                // const publicKeyObject = crypto.createPublicKey(publicKeyString)

                //create token pair
                const tokens = await createTokenPair({userId:newShop._id, email},publicKey,privateKey)
                console.log(`Created Token Success::`, tokens) 
                return{
                    code:201,
                    metadata:{
                        shop: getInfoData({fileds:['_id', 'name', 'email'], object: newShop}),
                        tokens
                    } 
                }
            }
            return{
                code:200,
                metadata: null
            }

        } catch (error) {
            return{
                code:'333',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService