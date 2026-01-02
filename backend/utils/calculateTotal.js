exports.calculateCartTotals = (cartItems) => {
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach(item =>{
        const product = item.product;
        const qty = item.quantity;

        const itemTotal = product.price*qty;
        subtotal +=itemTotal;

        if(product.offer){
        if(product.offer.discountPercent){
            discount += (itemTotal * product.offer.discountPercent) / 100;
        }

        if(product.offer.flatDiscount){
            discount += product.offer.flatDiscount * qty;
        }
    }

    });

    const totalAmount = subtotal - discount;

    // Delivery charges

    const deliveryCharge = totalAmount < 500 ? 55 : 0;
    const grandTotal = totalAmount + deliveryCharge;

    return {
        subtotal,
        discount,
        totalAmount,
        deliveryCharge,
        grandTotal
    };
};