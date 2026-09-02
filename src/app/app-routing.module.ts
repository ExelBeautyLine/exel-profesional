import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListaComponent } from './productos-listar/productos-listar.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { CarritoComponent } from './carrito/carrito.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { GraciasComponent } from './gracias/gracias.component';
import { LoginComponent } from './admin/login/login.component';
import { PanelComponent } from './admin/panel/panel.component';
import { adminGuard } from './admin/admin.guard';
import { PromocionesComponent } from './admin/promociones/promociones.component';
import { InicioComponent } from './inicio/inicio.component';
import { InformacionComponent } from './informacion/informacion.component';

const routes: Routes = [
    {
      path: '',
      component: InicioComponent
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
    path: 'productos/categoria/:slug',
    component: ProductosListaComponent
    },
    {
    path: 'productos/:slug',
    component: ProductoDetalleComponent
    },
    {
    path: 'informacion/:seccion',
    component: InformacionComponent
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
    },
    {
    path: 'admin/login',
    component: LoginComponent
   },
   {
    path: 'admin',
    component: PanelComponent,
    canActivate: [adminGuard]
   },
   {
    path: 'admin/promociones',
    component: PromocionesComponent
   }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
