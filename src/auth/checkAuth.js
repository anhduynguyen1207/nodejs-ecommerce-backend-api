'use strict'

const { findById } = require("../services/apikey.service")

const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) =>{
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if(!key){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        //check objKey
        const objKey = await findById(key)
        if(!objKey){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        req.objKey = objKey
        return next()
    } catch (error) {
        
    }
}
const permission = (permissions) =>{
    return (req, res, next) => {
        if(!req.objKey.permissions){
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }
        console.log('permission::', req.objKey.permissions)
        const validPermissions = req.objKey.permissions.includes(permissions)
        if(!validPermissions){
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }
        return next()
    }
}



module.exports = {
    apiKey,
    permission
}