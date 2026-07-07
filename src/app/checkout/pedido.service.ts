import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {

    constructor(
        private http: HttpClient
    ) {}

    crearPedido(body: any): Observable<any> {

        return this.http.post(

            '/.netlify/functions/pedidos',

            body

        );

    }

}