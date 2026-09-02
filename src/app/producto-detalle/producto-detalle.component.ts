import { Component,OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ProductosService } from '../services/productos-services';
import { Cuota, Producto } from '../productos-listar/Producto';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoApiService } from '../carrito/carrito-api-service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';


@Component({
  selector: 'app-producto-detalle',
  standalone: false,
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.scss'
})
export class ProductoDetalleComponent implements OnInit {

  producto!: Producto;
  imagenes: string[] = [];
  imagenSeleccionada = '';
  cantidad = 1;

  constructor(
    private productosDataService: ProductosService,
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService,
    private carritoApiService: CarritoApiService,
    private notificaciones: NotificacionesService)
  {}

  ngOnInit(): void {

    

  this.route.paramMap.subscribe(params => {

    const slug = params.get('slug');

    if (!slug) {

      this.router.navigate(['/productos']);
      return;

    }

    this.productosDataService
      .obtenerProducto(slug)
      .subscribe(producto => {

        this.producto = producto;
        this.cantidad = 1;

        this.imagenes = [];

        const cantidadImagenes = this.producto.cantidad_imagenes ?? 2;

        for (let i = 0; i < cantidadImagenes; i++) {

          this.imagenes.push(
            `assets/img/${this.producto.imagen_url}-${i}.jpg`
          );

        }

        this.imagenSeleccionada = this.imagenes[0];

      });

  });

  }

  tieneContenido(valor: unknown): boolean {
    return typeof valor === 'string' && valor.trim().length > 0;
  }

  get tieneInformacionAdicional(): boolean {
    return this.tieneContenido(this.producto?.beneficios) ||
      this.tieneContenido(this.producto?.tipo_piel) ||
      this.tieneContenido(this.producto?.modo_uso);
  }

  get cuotaPrincipal(): Cuota | null {
    const cuotas = this.producto?.precio?.cuotas ?? [];
    return cuotas[2] ?? cuotas[cuotas.length - 1] ?? null;
  }

  disminuirCantidad(): void {
    this.cantidad = Math.max(1, this.cantidad - 1);
  }

  aumentarCantidad(): void {
    if (this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  corregirCantidad(): void {
    const cantidadIngresada = Number(this.cantidad);
    this.cantidad = Math.min(
      Math.max(Number.isFinite(cantidadIngresada) ? Math.floor(cantidadIngresada) : 1, 1),
      Math.max(this.producto.stock, 1)
    );
  }

  agregarAlCarrito(): void {
    this.corregirCantidad();

    const cantidadEnCarrito = this.carritoService.obtenerCantidad(this.producto.id);
    const disponible = this.producto.stock - cantidadEnCarrito;

    if (disponible <= 0) {
      this.notificaciones.mostrar(
        `Solo hay ${this.producto.stock} unidades disponibles.`,
        'advertencia'
      );
      return;
    }

    const cantidadAAgregar = Math.min(this.cantidad, disponible);
    this.carritoService.agregarProducto(this.producto.id, cantidadAAgregar);
    this.carritoApiService.obtenerCarrito().subscribe({ error: error => console.error(error) });

    this.notificaciones.mostrar(
      cantidadAAgregar === 1 ? 'Producto agregado al carrito.' : `${cantidadAAgregar} productos agregados al carrito.`,
      'exito'
    );

    if (cantidadAAgregar < this.cantidad) {
      this.notificaciones.mostrar(
        `Se agregaron las ${cantidadAAgregar} unidades disponibles.`,
        'advertencia'
      );
    }
  }
}
