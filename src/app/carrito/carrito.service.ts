import { Injectable } from '@angular/core';
import { ItemCarrito } from './carrito.model';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private readonly STORAGE_KEY = 'carrito';

  private items: ItemCarrito[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    if (isPlatformBrowser(this.platformId)) {

      this.cargar();

    }

  }

  agregarProducto(productoId: number, cantidad: number): void {

    const item = this.items.find(
      item => item.productoId === productoId
    );

    if (item) {

      item.cantidad += cantidad;

    } else {

      this.items.push({
        productoId,
        cantidad
      });

    }

    this.guardar();

  }

  eliminarProducto(productoId: number): void {

    this.items = this.items.filter(
      item => item.productoId !== productoId
    );

    this.guardar();

  }

  actualizarCantidad(productoId: number, cantidad: number): void {

    const item = this.items.find(
      item => item.productoId === productoId
    );

    if (!item) {

      return;

    }

    item.cantidad = cantidad;

    if (item.cantidad <= 0) {

      this.eliminarProducto(productoId);

      return;

    }

    this.guardar();


  }

  obtenerItems(): ItemCarrito[] {

    return [...this.items];

  }

  vaciarCarrito(): void {

    this.items = [];

    this.guardar();

  }

  cantidadItems(): number {

    return this.items.reduce(

      (total, item) => total + item.cantidad,

      0

    );

  }

  existeProducto(productoId: number): boolean {

    return this.items.some(
      item => item.productoId === productoId
    );

  }

  private guardar(): void {

    if (!isPlatformBrowser(this.platformId)) {

      return;

    }

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.items)
    );

  }


  private cargar(): void {

    if (!isPlatformBrowser(this.platformId)) {

      return;

    }

    const carrito = localStorage.getItem(this.STORAGE_KEY);

    if (carrito) {

      this.items = JSON.parse(carrito);

    }
  }

  obtenerCantidad(productoId: number): number {

    const item = this.items.find(
      item => item.productoId === productoId
    );

    return item ? item.cantidad : 0;

  }



}