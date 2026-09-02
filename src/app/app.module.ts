import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import {ProductosListaComponent} from "./productos-listar/productos-listar.component";
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';
import { CarritoComponent } from './carrito/carrito.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './admin/login/login.component';
import { PanelComponent } from './admin/panel/panel.component';
import { PromocionesComponent } from './admin/promociones/promociones.component';
import { InicioComponent } from './inicio/inicio.component';

registerLocaleData(localeEsAr);



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProductosListaComponent,
    ProductoDetalleComponent,
    CarritoComponent,
    CheckoutComponent,
    LoginComponent,
    PanelComponent,
    PromocionesComponent,
    InicioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FooterComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es-AR'
    },
    // El backend de `fetch` funciona tanto en el navegador como durante el
    // renderizado del servidor (la Edge Function de Netlify).
    provideHttpClient(withFetch(), withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
