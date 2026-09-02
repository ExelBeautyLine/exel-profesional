import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PromocionAdmin {
  id: number;
  nombre: string;
  descripcion: string | null;
  porcentaje_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  acumulable: boolean;
}

interface CategoriaAdmin {
  id: number;
  nombre: string;
  activo: boolean;
  cantidad_productos: number;
}

interface ProductoAdmin {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  stock: number;
  categoria_id: number;
  categoria_nombre: string;
}

@Component({
  selector: 'app-promociones',
  standalone: false,
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.scss'
})
export class PromocionesComponent implements OnInit {

  promociones: PromocionAdmin[] = [];

  categorias: CategoriaAdmin[] = [];
  productos: ProductoAdmin[] = [];

  categoriasSeleccionadas: number[] = [];
  productosSeleccionados: number[] = [];

  categoriaFiltro: number | null = null;
  busquedaProducto = '';

  cargando = false;
  error = '';
  errorFormulario = '';

  mostrarFormulario = false;
  modoEdicion = false;
  promocionEditando: PromocionAdmin | null = null;
  promocionEliminar: PromocionAdmin | null = null;
  eliminando = false;

  nombre = '';
  descripcion = '';
  porcentajeDescuento = 0;
  fechaInicio = '';
  fechaFin = '';
  activo = true;
  acumulable = true;

  guardando = false;
  mensaje = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarPromociones();
    this.cargarCategoriasProductos();
  }

  cargarPromociones(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<PromocionAdmin[]>(
      '/.netlify/functions/admin-promociones',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (promociones) => {
        this.promociones = promociones;
        this.cargando = false;
      },

      error: (error) => {

        console.error(
          'Error cargando promociones:',
          error
        );

        this.error =
          'No se pudieron cargar las promociones';

        this.cargando = false;

      }

    });

  }

  cargarCategoriasProductos(): void {

    this.http.get<{
      categorias: CategoriaAdmin[];
      productos: ProductoAdmin[];
    }>(
      '/.netlify/functions/admin-categorias-productos',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta) => {

        this.categorias = respuesta.categorias;
        this.productos = respuesta.productos;

      },

      error: (error) => {

        console.error(
          'Error cargando categorías y productos:',
          error
        );

        this.error =
          'No se pudieron cargar las categorías y productos';

      }

    });

  }

  abrirFormulario(): void {

    console.log('CLICK NUEVA PROMOCIÓN');

    this.limpiarFormulario();

    this.modoEdicion = false;
    this.promocionEditando = null;

    this.mostrarFormulario = true;

    this.error = '';
    this.errorFormulario = '';
    this.mensaje = '';

  }

  cerrarFormulario(): void {

    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;

    this.modoEdicion = false;
    this.promocionEditando = null;

    this.errorFormulario = '';

    this.limpiarFormulario();
  }

  limpiarFormulario(): void {

    this.nombre = '';
    this.descripcion = '';
    this.porcentajeDescuento = 0;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.activo = true;
    this.acumulable = true;

    this.categoriasSeleccionadas = [];
    this.productosSeleccionados = [];

    this.categoriaFiltro = null;
    this.busquedaProducto = '';
    this.errorFormulario

  }

  seleccionarCategoria(id: number): void {

    const posicion =
      this.categoriasSeleccionadas.indexOf(id);

    if (posicion === -1) {

      this.categoriasSeleccionadas.push(id);

    } else {

      this.categoriasSeleccionadas.splice(posicion, 1);

    }

  }

  seleccionarProducto(id: number): void {

    const posicion =
      this.productosSeleccionados.indexOf(id);

    if (posicion === -1) {

      this.productosSeleccionados.push(id);

    } else {

      this.productosSeleccionados.splice(posicion, 1);

    }

  }

  categoriaSeleccionada(id: number): boolean {

    return this.categoriasSeleccionadas.includes(id);

  }

  productoSeleccionado(id: number): boolean {

    return this.productosSeleccionados.includes(id);

  }

  seleccionarFiltroCategoria(
    id: number | null
  ): void {

    this.categoriaFiltro = id;

  }

  get productosFiltrados(): ProductoAdmin[] {

    let resultado = this.productos;

    if (this.categoriaFiltro !== null) {

      resultado = resultado.filter(
        producto =>
          producto.categoria_id === this.categoriaFiltro
      );

    }

    const texto =
      this.busquedaProducto
        .trim()
        .toLowerCase();

    if (texto) {

      resultado = resultado.filter(producto => {

        const nombre =
          producto.nombre.toLowerCase();

        const codigo =
          producto.codigo.toLowerCase();

        return (
          nombre.includes(texto) ||
          codigo.includes(texto)
        );

      });

    }

    return resultado;

  }

  get cantidadTotalProductos(): number {

    return this.productos.length;

  }

  get cantidadProductosFiltrados(): number {

    return this.productosFiltrados.length;

  }

  get cantidadProductosSeleccionados(): number {

    return this.productosSeleccionados.length;

  }

  get cantidadCategoriasSeleccionadas(): number {

    return this.categoriasSeleccionadas.length;

  }

  confirmarEliminar(promocion: PromocionAdmin): void {

    this.error = '';
    this.errorFormulario = '';

    this.promocionEliminar = promocion;

  }

  cancelarEliminar(): void {

    if (this.eliminando) {
      return;
    }

    this.promocionEliminar = null;

  }

  eliminarPromocion(): void {

    if (!this.promocionEliminar) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.eliminando = true;

    this.http.delete(
      '/.netlify/functions/admin-eliminar-promocion',
      {
        body: {
          id: this.promocionEliminar.id
        },
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta: any) => {

        console.log(
          'Promoción eliminada:',
          respuesta
        );

        this.eliminando = false;

        this.promocionEliminar = null;

        this.mensaje =
          'Promoción eliminada correctamente';

        this.cargarPromociones();

      },

      error: (error) => {

        console.error(
          'Error eliminando promoción:',
          error
        );

        this.eliminando = false;

        this.error =
          error.error?.error ||
          'No se pudo eliminar la promoción';

      }

    });

  }

  cargarRelacionesPromocion(
    promocionId: number
  ): void {

    this.http.get<{
      categorias: number[];
      productos: number[];
    }>(
      `/.netlify/functions/admin-promocion-relaciones?id=${promocionId}`,
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta) => {

        this.categoriasSeleccionadas =
          respuesta.categorias;

        this.productosSeleccionados =
          respuesta.productos;

      },

      error: (error) => {

        console.error(
          'Error cargando relaciones:',
          error
        );

        this.errorFormulario =
          'No se pudieron cargar los productos y categorías de la promoción';

      }

    });

  }

  editarPromocion(promocion: PromocionAdmin): void {

    console.log(
      'CLICK EDITAR:',
      promocion
    );

    this.modoEdicion = true;
    this.promocionEditando = promocion;

    this.error = '';
    this.errorFormulario = '';
    this.mensaje = '';

    this.nombre = promocion.nombre;
    this.descripcion = promocion.descripcion || '';

    this.porcentajeDescuento =
      Number(promocion.porcentaje_descuento);

    this.fechaInicio =
      promocion.fecha_inicio.substring(0, 10);

    this.fechaFin =
      promocion.fecha_fin.substring(0, 10);

    this.activo = promocion.activo;
    this.acumulable = promocion.acumulable;

    this.categoriasSeleccionadas = [];
    this.productosSeleccionados = [];

    this.categoriaFiltro = null;
    this.busquedaProducto = '';

    this.mostrarFormulario = true;

    this.cargarRelacionesPromocion(promocion.id);

  }

  guardarPromocion(): void {

    if (this.modoEdicion) {
      this.actualizarPromocion();
    } else {
      this.crearPromocion();
    }

  }

  actualizarPromocion(): void {

    if (!this.promocionEditando) {
      return;
    }

    this.errorFormulario = '';
    this.mensaje = '';

    const nombre = this.nombre.trim();
    const descripcion = this.descripcion.trim();

    if (!nombre) {

      this.errorFormulario =
        'El nombre es obligatorio';

      return;

    }

    if (
      !Number.isFinite(this.porcentajeDescuento) ||
      this.porcentajeDescuento < 0 ||
      this.porcentajeDescuento > 100
    ) {

      this.errorFormulario =
        'El descuento debe estar entre 0 y 100';

      return;

    }

    if (!this.fechaInicio || !this.fechaFin) {

      this.errorFormulario =
        'Las fechas son obligatorias';

      return;

    }

    if (this.fechaInicio > this.fechaFin) {

      this.errorFormulario =
        'La fecha de inicio no puede ser posterior a la fecha de fin';

      return;

    }

    if (
      this.categoriasSeleccionadas.length === 0 &&
      this.productosSeleccionados.length === 0
    ) {

      this.errorFormulario =
        'Seleccioná al menos una categoría o un producto';

      return;

    }

    this.guardando = true;

    this.http.put(
      '/.netlify/functions/admin-editar-promocion',
      {
        id: this.promocionEditando.id,

        nombre,
        descripcion: descripcion || null,

        porcentajeDescuento:
          this.porcentajeDescuento,

        fechaInicio:
          this.fechaInicio,

        fechaFin:
          this.fechaFin,

        activo:
          this.activo,

        acumulable:
          this.acumulable,

        categorias:
          this.categoriasSeleccionadas,

        productos:
          this.productosSeleccionados

      },
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta: any) => {

        console.log(
          'Promoción actualizada:',
          respuesta
        );

        this.guardando = false;

        this.mostrarFormulario = false;
        this.modoEdicion = false;
        this.promocionEditando = null;

        this.limpiarFormulario();

        this.mensaje =
          'Promoción actualizada correctamente';

        this.cargarPromociones();

      },

      error: (error) => {

        console.error(
          'Error actualizando promoción:',
          error
        );

        this.guardando = false;

        this.errorFormulario =
          error.error?.error ||
          'No se pudo actualizar la promoción';

      }

    });

  }

  crearPromocion(): void {

    this.errorFormulario = '';
    this.mensaje = '';

    const nombre = this.nombre.trim();
    const descripcion = this.descripcion.trim();

    if (!nombre) {

      this.errorFormulario =
        'El nombre es obligatorio';

      return;

    }

    if (
      !Number.isFinite(this.porcentajeDescuento) ||
      this.porcentajeDescuento < 0 ||
      this.porcentajeDescuento > 100
    ) {

      this.errorFormulario =
        'El descuento debe estar entre 0 y 100';

      return;

    }

    if (!this.fechaInicio || !this.fechaFin) {

      this.errorFormulario =
        'Las fechas son obligatorias';

      return;

    }

    if (this.fechaInicio > this.fechaFin) {

      this.errorFormulario =
        'La fecha de inicio no puede ser posterior a la fecha de fin';

      return;

    }

    if (
      this.categoriasSeleccionadas.length === 0 &&
      this.productosSeleccionados.length === 0
    ) {

      this.errorFormulario =
        'Seleccioná al menos una categoría o un producto';

      return;

    }

    this.guardando = true;

    this.http.post(
      '/.netlify/functions/admin-crear-promocion',
      {
        nombre,
        descripcion: descripcion || null,
        porcentajeDescuento: this.porcentajeDescuento,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        activo: this.activo,
        acumulable: this.acumulable,

        categorias: this.categoriasSeleccionadas,
        productos: this.productosSeleccionados

      },
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta: any) => {

        console.log(
          'Promoción creada:',
          respuesta
        );

        this.guardando = false;

        this.mostrarFormulario = false;


        this.limpiarFormulario();

        this.mensaje =
          'Promoción creada correctamente';

        this.cargarPromociones();

      },

      error: (error) => {

        console.error(
          'Error creando promoción:',
          error
        );

        this.guardando = false;

        this.errorFormulario =
          error.error?.error ||
          'No se pudo crear la promoción';

      }

    });

  }

}