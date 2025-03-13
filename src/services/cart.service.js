'use strict'
const { NotFoundError } = require("../core/error.response.js")
const cartModel = require("../models/cart.model.js")
const { getProductbyId } = require("../models/repositories/product.repo.js")

/** 
 * Key features: Cart Service
 *  1. Add product to cart[user]
 *  2. Reduce product quantity[user]
 *  3. Increase product quantity[user]
 *  4. Get list to Cart [user]
 *  5. Delete cart[user]
 *  6. Delete cart item[user]
*/

class CartService {

    /// START REPO CART //
    static async createUserCart({userId, product}){
        const query = {cart_userId:userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet:{
                cart_products:product
            }
        }, options = {upsert: true, new:true}
        return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
    }
    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product
        const query = {
            cart_userId:userId, 
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc:{
                'cart_products.$.quantity': quantity
            }
        }, options = {upsert: true, new:true}
        
        return await cartModel.findOneAndUpdate(query, updateSet, options)
    }
    /// END REPO CART //

    static async addToCart({userId, product={}}){
        //check cart tồn tại hay không
        const userCart = await cartModel.findOne({cart_userId: userId})
        if(!userCart){
            //create cart for User
            return await CartService.createUserCart({userId,product})
        }

        //nếu có giỏ hàng rồi những chưa có sản phẩm?
        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            console.log('userCart.cart_products!!',userCart.cart_products)
            return await userCart.save()
        }

        //giỏ hàng tồn tại và có sản phẩm này thì update quantity
        return await CartService.updateUserCartQuantity({userId,product})
    }

    // update cart
    /* 
        userId:
        shop_order_ids:[
            {
                shopId,
                item_products:[
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */
   static async addToCartV2({userId, shop_order_ids}){
        const { productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
        //check product exist
        const foundProduct = await getProductbyId(productId)
        if(!foundProduct) throw new NotFoundError('Product not exist')
        //compare shop
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError('Product do not belong to the shop')
        }

        if(quantity === 0){
            //deleted
        }
        return await CartService.updateUserCartQuantity({
            userId,
            product:{
                productId,
                quantity: quantity - old_quantity
            }
        })
   }

   static async deleteUserCart({ userId, productId}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull:{
                cart_products:{
                    productId
                }
            }
        }
        const deleteCart = await cartModel.updateOne(query, updateSet)
        return deleteCart
   }

   static async getListUserCart({userId}){
        return await cartModel.findOne({
            cart_userId: +userId
        }).lean()
   }
}

module.exports = CartService