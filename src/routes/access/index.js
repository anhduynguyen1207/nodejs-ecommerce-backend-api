'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authentication, authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//handler error

//signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))

//authentication//
router.use(authenticationV2)
/////////////////
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))


module.exports = router