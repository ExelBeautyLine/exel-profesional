import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../productos-listar/Producto';



@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Producto[]>(
      '/.netlify/functions/listar'
    );
  }

  listarPorSubcategoria(slug: string) {

  return this.http.get<Producto[]>(
    '/.netlify/functions/listar-productos-subcategorias?slug=' + slug
  );

}

}
  
 


