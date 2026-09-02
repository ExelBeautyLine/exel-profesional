import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ProductoAdmin {
  id: number;
  codigo: string;
  nombre: string;
  precio_base: number;
  stock: number;
  destacado: boolean;
  activo: boolean;
  imagen_url: string | null;
  categoria_id: number | null;
  categoria_nombre: string | null;
  subcategoria_id: number | null;
  subcategoria_nombre: string | null;
}

interface CategoriaFiltro {
  id: number;
  nombre: string;
}

interface SubcategoriaFiltro extends CategoriaFiltro {
  categoria_id: number;
}

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent implements OnInit {

  productos: ProductoAdmin[] = [];

  categoriaFiltro: number | null = null;
  subcategoriaFiltro: number | null = null;
  busquedaProducto = '';

  cargando = false;
  error = '';

  productoEditando: ProductoAdmin | null = null;

  nuevoPrecio = 0;
  nuevoStock = 0;
  nuevoDestacado = false;
  nuevoActivo = true;

  guardando = false;
  mensaje = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<ProductoAdmin[]>(
      '/.netlify/functions/admin-productos',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (productos) => {

        this.productos = productos;
        this.actualizarFiltrosDisponibles();
        this.cargando = false;

      },

      error: (error) => {

        console.error(
          'Error cargando productos:',
          error
        );

        this.error =
          'No se pudieron cargar los productos';

        this.cargando = false;

      }

    });

  }

  get categorias(): CategoriaFiltro[] {

    const categorias = new Map<number, CategoriaFiltro>();

    this.productos.forEach(producto => {
      if (producto.categoria_id !== null && producto.categoria_nombre) {
        categorias.set(producto.categoria_id, {
          id: producto.categoria_id,
          nombre: producto.categoria_nombre
        });
      }
    });

    return Array.from(categorias.values())
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

  }

  get subcategorias(): SubcategoriaFiltro[] {

    const subcategorias = new Map<number, SubcategoriaFiltro>();

    this.productos.forEach(producto => {
      if (
        producto.subcategoria_id !== null &&
        producto.subcategoria_nombre &&
        producto.categoria_id !== null
      ) {
        subcategorias.set(producto.subcategoria_id, {
          id: producto.subcategoria_id,
          nombre: producto.subcategoria_nombre,
          categoria_id: producto.categoria_id
        });
      }
    });

    return Array.from(subcategorias.values())
      .filter(subcategoria =>
        this.categoriaFiltro === null ||
        subcategoria.categoria_id === this.categoriaFiltro
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

  }

  get productosFiltrados(): ProductoAdmin[] {

    const busqueda = this.busquedaProducto.trim().toLowerCase();

    return this.productos.filter(producto => {
      const coincideCategoria =
        this.categoriaFiltro === null ||
        producto.categoria_id === this.categoriaFiltro;

      const coincideSubcategoria =
        this.subcategoriaFiltro === null ||
        producto.subcategoria_id === this.subcategoriaFiltro;

      const coincideBusqueda =
        !busqueda ||
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.codigo.toLowerCase().includes(busqueda);

      return coincideCategoria && coincideSubcategoria && coincideBusqueda;
    });

  }

  seleccionarCategoria(): void {

    if (!this.subcategorias.some(
      subcategoria => subcategoria.id === this.subcategoriaFiltro
    )) {
      this.subcategoriaFiltro = null;
    }

  }

  limpiarFiltros(): void {

    this.categoriaFiltro = null;
    this.subcategoriaFiltro = null;
    this.busquedaProducto = '';

  }

  private actualizarFiltrosDisponibles(): void {

    if (!this.categorias.some(
      categoria => categoria.id === this.categoriaFiltro
    )) {
      this.categoriaFiltro = null;
    }

    this.seleccionarCategoria();

  }

  editarProducto(producto: ProductoAdmin): void {

    console.log('Editando:', producto);

    this.productoEditando = producto;

    this.nuevoPrecio =
      Number(producto.precio_base);

    this.nuevoStock =
      Number(producto.stock);

    this.nuevoDestacado =
      producto.destacado;

    this.nuevoActivo =
      producto.activo;

    this.mensaje = '';
    this.error = '';

  }

  cancelarEdicion(): void {

    if (this.guardando) {
      return;
    }

    this.productoEditando = null;

    this.nuevoPrecio = 0;
    this.nuevoStock = 0;
    this.nuevoDestacado = false;
    this.nuevoActivo = true;

  }

  guardarPrecio(): void {
  this.guardarProducto();

}


  guardarProducto(): void {

    if (!this.productoEditando) {
      return;
    }

    if (
      !Number.isFinite(this.nuevoPrecio) ||
      this.nuevoPrecio < 0
    ) {

      this.error =
        'Ingresá un precio válido';

      return;

    }

    if (
      !Number.isInteger(this.nuevoStock) ||
      this.nuevoStock < 0
    ) {

      this.error =
        'Ingresá un stock válido';

      return;

    }

    this.guardando = true;

    this.error = '';
    this.mensaje = '';

    this.http.put(
      '/.netlify/functions/admin-actualizar-precio',
      {
        productoId:
          this.productoEditando.id,

        precioBase:
          this.nuevoPrecio,

        stock:
          this.nuevoStock,

        destacado:
          this.nuevoDestacado,

        activo:
          this.nuevoActivo
      },
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta: any) => {

        console.log(
          'Producto actualizado:',
          respuesta
        );

        this.guardando = false;

        this.productoEditando = null;

        this.nuevoPrecio = 0;
        this.nuevoStock = 0;
        this.nuevoDestacado = false;
        this.nuevoActivo = true;

        this.mensaje =
          'Producto actualizado correctamente';

        this.cargarProductos();

      },

      error: (error) => {

        console.error(
          'Error actualizando producto:',
          error
        );

        this.guardando = false;

        this.error =
          error.error?.error ||
          'No se pudo actualizar el producto';

      }

    });

  }

}
