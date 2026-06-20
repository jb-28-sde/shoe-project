export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
    sizes: number[];
}

export interface CartItem {
    id: string; // unique cart item id (product id + size)
    productId: string;
    product: Product;
    size: number;
    quantity: number;
}

export interface Review {
    id: string;
    productId: string;
    userId?: string;
    userName?: string;
    rating: number;
    text: string;
    createdAt?: any;
}

export type ViewState = 
  | { name: 'home', category?: string }
  | { name: 'product', productId: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'admin' }
  | { name: 'orders' }
  | { name: 'wishlist' };
