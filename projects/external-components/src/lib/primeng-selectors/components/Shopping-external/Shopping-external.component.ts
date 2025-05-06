import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-shopping',
  template: `
    <!-- 
      Features:
      - Display a list of products
      - Add products to cart
      - View and update cart quantities
      - Remove items from cart
    -->
    <div class="shopping-container">
      <h2>Product List</h2>
      <ul class="product-list">
        <li *ngFor="let product of products">
          <span>{{product.name}} - ${{product.price}}</span>
          <button (click)="addToCart(product)">Add to Cart</button>
        </li>
      </ul>

      <h2>Shopping Cart</h2>
      <div *ngIf="cart.length === 0">Your cart is empty.</div>
      <ul class="cart-list" *ngIf="cart.length > 0">
        <li *ngFor="let item of cart">
          <span>{{item.name}} (x{{item.quantity}}) - ${{item.price * item.quantity}}</span>
          <button (click)="increaseQuantity(item)">+</button>
          <button (click)="decreaseQuantity(item)">-</button>
          <button (click)="removeFromCart(item)">Remove</button>
        </li>
      </ul>
      <div class="total" *ngIf="cart.length > 0">
        Total: ${{getTotal()}}
      </div>
    </div>
  `,
  styles: [`
    .shopping-container { max-width: 500px; margin: auto; font-family: Arial, sans-serif; }
    h2 { color: #1976d2; }
    ul { list-style-type: none; padding: 0; }
    .product-list li, .cart-list li { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    button { margin-left: 8px; }
    .total { margin-top: 16px; font-weight: bold; }
  `]
})
export class ShoppingComponent extends CommonExternalComponent {
  products: Product[] = [
    { id: 1, name: 'Apple', price: 1, quantity: 1 },
    { id: 2, name: 'Banana', price: 0.5, quantity: 1 },
    { id: 3, name: 'Orange', price: 0.8, quantity: 1 }
  ];
  cart: Product[] = [];

  addToCart(product: Product): void {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...product });
    }
  }

  increaseQuantity(item: Product): void {
    item.quantity++;
  }

  decreaseQuantity(item: Product): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: Product): void {
    this.cart = this.cart.filter(p => p.id !== item.id);
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}