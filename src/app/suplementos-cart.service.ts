import { Injectable } from '@angular/core';
import { Suplemento } from './suplementos-lista/Suplemento';
import { BehaviorSubject } from 'rxjs';


/* 
 * Maneja la logica del carrito 
 * 
 * */

@Injectable({
  providedIn: 'root'
})
export class SuplementosCartService {
  private _cartList: Suplemento[] = [];
  cartList: BehaviorSubject<Suplemento[]> = new BehaviorSubject<Suplemento[]>([]);

  constructor() {}

  addToCart(suplemento: Suplemento): void {
    const item = this._cartList.find(p => p.id === suplemento.id);

    if (!item) {
      this._cartList.push({ ...suplemento });
    } else {
      item.quantity += suplemento.quantity;
    }

    this.cartList.next([...this._cartList]);
  }

  removeFromCart(id: number): void {
    this._cartList = this._cartList.filter(item => item.id !== id);
    this.cartList.next([...this._cartList]);
  }

  clearCart(): void {
    this._cartList = [];
    this.cartList.next([]);
  }

  getTotalItems(): number {
    return this._cartList.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this._cartList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}