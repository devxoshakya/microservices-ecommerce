import { StripeProductType } from "@repo/types";

// Mock product management - Store products in memory
const products = new Map<string, { name: string; price: number }>();

export const createStripeProduct = async (item: StripeProductType) => {
  try {
    // Store product in memory
    products.set(item.id, {
      name: item.name,
      price: item.price,
    });
    
    console.log(`Product created: ${item.id} - ${item.name}`);
    return { id: item.id, name: item.name, price: item.price };
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getStripeProductPrice = async (productId: number) => {
  try {
    const product = products.get(productId.toString());
    // Return price in cents (multiply by 100 for consistency with Stripe format)
    return product ? product.price * 100 : 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const deleteStripeProduct = async (productId: number) => {
  try {
    products.delete(productId.toString());
    console.log(`Product deleted: ${productId}`);
    return { id: productId, deleted: true };
  } catch (error) {
    console.log(error);
    return error;
  }
};
