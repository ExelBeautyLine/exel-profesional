import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { RespuestaCheckout } from './checkout-response.model';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';

@Component({

    selector: 'app-checkout',

    standalone: false,

    templateUrl: './checkout.component.html',

    styleUrl: './checkout.component.scss'

})
export class CheckoutComponent implements OnInit {

    resumen!: RespuestaCheckout;
    form!: FormGroup;
    entrega: 'retiro' | 'envio' = 'retiro';
    formaPago: 'transferencia' | 'tarjeta' = 'transferencia';

    constructor(
        private checkoutService: CheckoutService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {

        this.form = this.fb.group({

            nombre: [''],

            apellido: [''],

            email: [''],

            telefono: [''],

            entrega: ['retiro'],

            pago: ['transferencia'],

            provincia: [''],

            localidad: [''],

            codigoPostal: [''],

            calle: [''],

            numero: [''],

            piso: [''],

            departamento: [''],

            observaciones: ['']

        });

        this.form.get('entrega')?.valueChanges.subscribe(entrega => {

            this.entrega = entrega;

            this.cargarResumen();

        });
        this.form.get('pago')?.valueChanges.subscribe(pago => {

            this.formaPago = pago;

        });

        this.cargarResumen();

    }


    cargarResumen(): void {

        this.checkoutService
            .obtenerResumen(this.entrega)
            .subscribe({

                next: (respuesta: RespuestaCheckout) => {

                    this.resumen = respuesta;

                },

                error: (error) => {

                    console.error(error);

                }

            });

    }

}