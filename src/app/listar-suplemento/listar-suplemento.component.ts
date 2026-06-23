import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuplementoDataService } from '../suplemento-data.service';
import { Suplemento } from '../suplementos-lista/Suplemento';
import { CommonModule } from '@angular/common';
import { SuplementosCartService } from '../suplementos-cart.service';


@Component({
    selector: 'app-listar-suplemento',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './listar-suplemento.component.html',
    styleUrls: ['./listar-suplemento.component.scss']
})
export class ListarSuplementoComponent implements OnInit {

    suplemento!: Suplemento;

    constructor(
        private route: ActivatedRoute,
        private suplementoDataService: SuplementoDataService,
        private cart: SuplementosCartService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const idNumber = Number(id); // 👈 convertir

            this.suplementoDataService.getOne(idNumber).subscribe(data => {
                this.suplemento = data!;
                this.suplemento.quantity = 0; 
            });
        }
    }
    upQuantity(): void {
    if (this.suplemento.quantity < this.suplemento.stock) {
      this.suplemento.quantity++;
    }
  }

  downQuantity(): void {
    if (this.suplemento.quantity > 1) {
      this.suplemento.quantity--;
    }
  }

  addToCart(): void {
    if (this.suplemento.stock > 0) {
      this.cart.addToCart(this.suplemento);
      this.suplemento.stock -= this.suplemento.quantity;
      this.suplemento.quantity = 1;
    }
  }
}