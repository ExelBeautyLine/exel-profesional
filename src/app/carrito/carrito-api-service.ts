import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { CarritoService } from './carrito.service';
import { RespuestaCarrito } from './carrito-response.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoApiService {

  constructor(
    private http: HttpClient,

    private carritoService: CarritoService

  ) { }


  obtenerCarrito(): Observable<RespuestaCarrito> {
     
    const items = this.carritoService.obtenerItems();
   
    return this.http.post<RespuestaCarrito>(

      '/.netlify/functions/calcular-carrito',

      items

    );
  
  }

  

} 

