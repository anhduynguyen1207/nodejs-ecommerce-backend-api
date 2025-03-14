'use strict'

const { BadRequestError } = require("../core/error.response.js")
const orderModel = require("../models/order.model.js")
const { findCartById } = require("../models/repositories/cart.repo.js")
const { checkProductByServer } = require("../models/repositories/product.repo.js")
const { getDiscountAmount } = require("./discount.service.js")
const { acquireLock, releaseLock } = require("./redis.service.js")


class CheckoutService {
    // login and without login
    /*
        {
            cardId,
            userId,
            shop_order_ids[
                {
                    shopId,
                    shop_discounts:[]
                    item_products:[
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shop_discounts:[
                        {
                            "shopId"
                            "discountId",
                            "codeId:"
                        }
                    ]
                    item_products:[
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
    static async checkoutReview({
        cardId, userId, shop_order_ids
    }){

        //check cartId ton tai khong
        const foundCart = await findCartById(cardId)
        if(!foundCart) throw new BadRequestError('Cart does not exist!')

        const checkout_order ={
            totalPrice: 0, // Tong tien hang
            feeShop:0, //phi van chuyen
            totalDiscount:0, // tong tien discount giam gia
            totalCheckout:0 // tong thanh toan
        }, shop_order_ids_new = []

        //tinh tong tien bill
        for (let i =0; i< shop_order_ids.length; i++){
            const{shopId, shop_discounts=[], item_products=[]}= shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductServer::`,checkProductServer)
            if(!checkProductServer[0]) throw new BadRequestError('order wrong!!')

            const checkoutPrice = checkProductServer.reduce((acc, product)=>{
                return acc + (product.quantity * product.price)
            },0)

            //tong tien truoc khi xu ly
            checkout_order.totalPrice =+ checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,  //tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // neu shop_discounts ton tai > 0, check xem co hop le hay khong
            if(shop_discounts.length >0){
                //gia su chi co mot discount
                const {totalPrice=0, discount =0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount

                //neu tien giam gia lon hon 0 thì ta sẽ tính
                if(discount > 0){
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }
            //tổng thanh toán cuối cùng
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        // nếu có thể sẽ lưu vào tbl tạm ****
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    //order 
    static async orderByUser({
        shop_order_ids,
        cardId,
        userId,
        user_address = {},
        user_payment={}
    }){
        const {shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            cardId,
            userId,
            shop_order_ids,
        })

        //check lai 1 lan nữa xem vượt tồn kho hay không ( dùng thuật toán flatmap) nôm na làm phẳng dữ liệu đưa vào hết 1 array để dễ dàng tính toán
        //get new array Products
        const products = shop_order_ids_new.flatMap(order=> order.item_products)
        console.log(`[1]::`, products)
        const acquireProduct= []
        for(let i=0; i< products.length; i++){
            const {productId, quantity} = products[i];
            const keyLock = await acquireLock(productId, quantity,cardId)
            acquireProduct.push(keyLock ? true: false)
            if(keyLock){
                await releaseLock(keyLock)
            }
        }
        // check if có 1 sản phẩm hết hàng trong kho
        if(acquireProduct.includes(false)) throw new BadRequestError('Một số sản phẩm đã được cập nhật, vui lòng quay lại giỏ hàng...')
        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // trường hợp: nếu insert thành công thì remove product có trong cart
        if(newOrder){
            // remove product in my cart
        }
        return newOrder
    }
    /* 
        1. Query Order [User]
    */
    static async getOrdersByUser(){

    }

    /* 
        2. Query Order Using Id [User]
    */
    static async getOneOrderByUser(){
    
    }

    /* 
        3. Cancel Order [User]
    */
    static async cancelOrderByUser(){

    }

    /* 
        4. Update Order Status Order [Shpp | Amin]   ***quan trọng****
    */
    static async updateOrderStatusByShop(){
        
    }
}


module.exports = CheckoutService