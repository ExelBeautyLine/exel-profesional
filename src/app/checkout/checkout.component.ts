import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { RespuestaCheckout } from './checkout-response.model';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { PedidoService } from './pedido.service';
import { CarritoService } from '../carrito/carrito.service';
import { Router } from '@angular/router';

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
        private fb: FormBuilder,
        private pedidoService: PedidoService,
        private carritoService: CarritoService,
        private router: Router
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

    continuar(): void {

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            return;

        }

        const body = {

            items: this.carritoService.obtenerItems(),

            cliente: {

                nombre: this.form.value.nombre,

                apellido: this.form.value.apellido,

                email: this.form.value.email,

                telefono: this.form.value.telefono

            },

            direccion:

                this.form.value.entrega === 'envio'

                    ? {

                        provincia: this.form.value.provincia,

                        localidad: this.form.value.localidad,

                        codigoPostal: this.form.value.codigoPostal,

                        calle: this.form.value.calle,

                        numero: this.form.value.numero,

                        piso: this.form.value.piso,

                        departamento: this.form.value.departamento,

                        observaciones: this.form.value.observaciones

                    }

                    : null,



            entrega: this.form.value.entrega,

            pago: this.form.value.pago

        };

        this.pedidoService
            .crearPedido(body)
            .subscribe({

                next: (respuesta) => {

                    console.log("Pedido creado:", respuesta);

                    this.carritoService.vaciar();

                    if (respuesta.pago === "transferencia") {

                        window.open(
                            respuesta.whatsapp,
                            "_blank"
                        );

                        this.router.navigate([
                            '/gracias'
                        ]);

                    } else {

                        console.log("Ir a Mercado Pago");

                    }

                },

                error: (error) => {

                    console.error(error);

                }

            });

    }

}