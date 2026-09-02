import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../services/menu-service';
import { CarritoService} from '../carrito/carrito.service';


@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})


export class NavbarComponent implements OnInit {


  menu: any[] = [];

  constructor(private navbarService: NavbarService, private carritoService: CarritoService) {}

  ngOnInit(): void {

    this.navbarService.getMenu().subscribe(menu => {
      this.menu = menu;
      console.log(menu);
    });

  }

  menuOpen = false;

  alternarMenu(): void {
    this.menuOpen = !this.menuOpen;

    if (!this.menuOpen) {
      this.cerrarSubmenus();
    }
  }

  alternarCategoria(categoria: any): void {
    categoria.open = !categoria.open;
  }

  cerrarMenu(): void {
    this.menuOpen = false;
    this.cerrarSubmenus();
  }

  private cerrarSubmenus(): void {
    this.menu.forEach((categoria) => categoria.open = false);
  }

  get cantidadCarrito(): number {

    return this.carritoService.cantidadItems();

  }

}
