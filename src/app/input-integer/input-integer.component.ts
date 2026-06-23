import { Component, Input, Output } from '@angular/core';
import { Suplemento } from '../suplementos-lista/Suplemento';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-integer',
  standalone: false,
  templateUrl: './input-integer.component.html',
  styleUrl: './input-integer.component.scss'
})

export class InputIntegerComponent {

  constructor() { }
  @Input()
  quantity!: number;
  @Input()
  max!:number

  @Output()
  quantityChange: EventEmitter<number> = new EventEmitter<number>();

  upQuantity(): void{
    if(this.quantity<this.max){
      
      this.quantity++;
      this.quantityChange.emit(this.quantity);
    
      }
  }

  downQuantity(): void{
    if(this.quantity > 0){

      this.quantity--;
      this.quantityChange.emit(this.quantity);

    }
  }

  onChangeQuantity(event : KeyboardEvent): void{
      console.log(event.key)
      event.preventDefault();
      this.quantityChange.emit(this.quantity );
  };

}
