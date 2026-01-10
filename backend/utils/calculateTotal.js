exports.calculateCartTotals = (cartItems, coupon = null) => {
  let subtotal = 0;
  let discount = 0;

  cartItems.forEach(item => {
    const qty = item.quantity;
    const price = item.priceAtAdd;

    const itemTotal = price * qty;
    subtotal += itemTotal;

    // product offer
    if (item.product && item.product.offer) {
      const offer = item.product.offer;

      if (offer.discountPercent) {
        discount += (itemTotal * offer.discountPercent) / 100;
      }
      if (offer.flatDiscount) {
        discount += offer.flatDiscount * qty;
      }
    }
  });

  // coupon discount
  if (coupon) {
    if (coupon.discountPercent) {
      discount += (subtotal * coupon.discountPercent) / 100;
    }
    if (coupon.flatDiscount) {
      discount += coupon.flatDiscount;
    }
  }

  const totalAmount = Math.max(0, subtotal - discount);
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
