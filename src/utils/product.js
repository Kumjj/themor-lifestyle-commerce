export function ownsProduct(user, product) {
  if (!user || !product) return false;
  if (product.sellerId) return product.sellerId === user.id;
  return Boolean(user.name && product.seller === user.name);
}

export function getProductReviews(product) {
  return Array.isArray(product?.reviews) ? product.reviews : [];
}

export function getReviewSummary(product) {
  const reviews = getProductReviews(product);
  if (reviews.length) {
    const rated = reviews.filter(review => Number(review.rating) >= 1 && Number(review.rating) <= 5);
    return { count: reviews.length, rating: rated.length ? rated.reduce((sum, review) => sum + Number(review.rating), 0) / rated.length : null };
  }
  const count = Math.max(0, Number(product?.reviewCount) || 0);
  return { count, rating: count > 0 ? product.rating : null };
}
