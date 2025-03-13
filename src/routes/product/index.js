'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller.js')
const asyncHandler = require('../../helper/asyncHandler.js')
const { authenticationV2 } = require('../../auth/authUtils.js')
const router = express.Router()

//handler error
//api không cần authen bởi vì sẽ có user không cần đăng nhập cũng có thể xem được sản phẩm
router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findDetailsProduct))


//authentication//
router.use(authenticationV2)
/////////////////
router.post('', asyncHandler(productController.createProduct))
router.patch('/:productId', asyncHandler(productController.updateProduct))

router.post('/publish/:id', asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop))

//QUERY//
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/publish/all', asyncHandler(productController.getAllPublishForShop))


module.exports = router