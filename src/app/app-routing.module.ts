import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuplementosSuplementoComponent } from './suplementos-suplemento/suplementos-suplemento.component';
import { SuplementosAboutComponent } from './suplementos-about/suplementos-about.component';
import { ListarSuplementoComponent } from './listar-suplemento/listar-suplemento.component';

const routes: Routes = [
    {
      path:'',
      redirectTo:'suplementos',
      pathMatch: 'full'
    },
    {
      path: 'suplementos',
      component: SuplementosSuplementoComponent
    },

    {
      path: 'about',
      component: SuplementosAboutComponent
    },
    
    {
      path: 'suplementos/:id',
      component: ListarSuplementoComponent
    }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
