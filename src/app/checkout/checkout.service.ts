import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CarritoService } from '../carrito/carrito.service';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {

    constructor(

        private http: HttpClient,

        private carritoService: CarritoService

    ) { }

    obtenerResumen(
        entrega: 'retiro' | 'envio'
    ): Observable<any> {

        return this.http.post<any>(
            '/.netlify/functions/checkout',
            {
                items: this.carritoService.obtenerItems(),
                entrega
            }
        );

    }

}