import { Component } from '@angular/core';
import { SuplementosCartService } from '../suplementos-cart.service';
import { Suplemento } from '../suplementos-lista/Suplemento';
import { Observable } from 'rxjs'
import { CommonModule, CurrencyPipe } from '@angular/common';;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent {
  cartList$: Observable<Suplemento[]>;
  isOpen = false;

  constructor(public cart: SuplementosCartService) {
    this.cartList$ = this.cart.cartList.asObservable();
  }

  toggleCart(): void {
    this.isOpen = !this.isOpen;
  }

  closeCart(): void {
    this.isOpen = false;
  }

  removeItem(id: number): void {
    this.cart.removeFromCart(id);
  }

  getTotalItems(): number {
    return this.cart.getTotalItems();
  }

  getTotalPrice(): number {
    return this.cart.getTotalPrice();
  }
}
