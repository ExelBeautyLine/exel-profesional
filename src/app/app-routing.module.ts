import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListaComponent } from './productos-listar/productos-listar.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { CarritoComponent } from './carrito/carrito.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { GraciasComponent } from './gracias/gracias.component';

const routes: Routes = [
    {
      path: '',
      redirectTo: 'productos',
      pathMatch: 'full'
    },
    {
      path: 'productos',
      component: ProductosListaComponent
    },
    {
    path: 'productos/subcategoria/:slug',
    component: ProductosListaComponent
    },
    {
    path: 'productos/:slug',
    component: ProductoDetalleComponent
    },
    {
    path: 'carrito',
    component: CarritoComponent
    },
    {
    path: 'checkout',

    component: CheckoutComponent
    },
    {
    path: "gracias",
    component: GraciasComponent
    }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
