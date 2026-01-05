exports.calculateCartTotals = (cartItems) => {
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach(item =>{
        const qty = item.quantity;

        const price = item.priceAtAdd;

        const itemTotal = price * qty;
        subtotal += itemTotal;

        //offer only if products ppopulated
        if(item.product && item.product.offer){
            const offer = item.product.offer;

            if(offer.discountPercent){
                discount += (itemTotal * offer.discountPercent) /100;
            }
            if(offer.flatDiscount){
                discount += offer.flatDiscount * qty;
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