'use strict'

const AccessService = require("../services/access.service")

const {CREATED, OK, SuccessResponse } = require('../core/sucess.response')

class AccessController {
    handlerRefreshToken = async (req, res, next)=> {
        // new SuccessResponse({
        //     message: 'Get token success!',
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken )
        // }).send(res)

        //v2
        new SuccessResponse({
            message: 'Get token success!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
    }

    login = async (req, res, next)=> {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }
    signUp = async (req, res, next)=> {
        //  return res.status(201).json(await AccessService.signUp(req.body))
        new CREATED({
            message: 'Registerted OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }
    logout = async (req, res, next)=> {
        new SuccessResponse({
            message: 'Logout success!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }
}

module.exports = new AccessController()