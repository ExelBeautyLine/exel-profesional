import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosListaComponent } from './productos-listar/productos-listar.component';

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


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
