'use strict'

const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.xxx.js")

const {CREATED, OK, SuccessResponse } = require('../core/sucess.response')

class ProductController {
    createProduct = async (req, res, next)=> {
        // Ver 1
        // new SuccessResponse({
        //     message: 'Create new Product success',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)

        //Ver 2
        new SuccessResponse({
            message: 'Create new Product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)

    } 
    // update Product
    updateProduct = async (req, res, next)=> {
        new SuccessResponse({
            message: 'Update Product success',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    publishProductByShop = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Publish Product success',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Publish Product success',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }



    //QUERY //
    /**
     * @desc Get all Drafts for Shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON} res 
     * @param {*} next 
     */
    getAllDraftsForShop = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductServiceV2.findAllDaftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get List Search Product success',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res)
    }
    getListSearchProduct = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get List Search Product success',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get All Product success',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }
    findDetailsProduct = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get Product details success',
            metadata: await ProductServiceV2.findDetailsProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
    
    // END QUERY // 
}

module.exports = new ProductController()