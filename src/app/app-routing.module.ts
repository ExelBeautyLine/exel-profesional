import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListaComponent } from './productos-listar/productos-listar.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';

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
    }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
