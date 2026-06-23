import { Component, OnInit } from '@angular/core';
import { Suplemento } from './Suplemento';
import { SuplementosCartService } from '../suplementos-cart.service';
import { SuplementoDataService } from '../suplemento-data.service';

@Component({
  selector: 'app-suplementos-lista',
  standalone: false,
  templateUrl: './suplementos-lista.component.html',
  styleUrl: './suplementos-lista.component.scss'
})
export class SuplementosListaComponent implements OnInit{

    suplementos: Suplemento[] = [];

    constructor(
      private cart: SuplementosCartService,
      private suplementosDataService: SuplementoDataService){
    }
    
    ngOnInit() : void{
      this.suplementosDataService.getAll()
      .subscribe( suplementos => this.suplementos = suplementos)
    }
    

    addToCart(suplemento: Suplemento): void {
    
      this.cart.addToCart(suplemento)
      
      suplemento.stock -= suplemento.quantity;
      
      suplemento.quantity= 0;
    
    }
}
