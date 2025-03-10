'use strict'

const shopModel = require("../models/shop.model")
const bycypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require('../utils')
const { type } = require("os")
const { format } = require("path")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({ name, email, password}) =>{
        try {
            //step1: check email exist
            const holderShop = await shopModel.findOne({ email}).lean()
            if(holderShop){
                return{
                    code:'111',
                    message: 'Shop already registered!'
                }
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
                    return{
                        code:'222',
                        message: 'keyStore error'
                    }
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