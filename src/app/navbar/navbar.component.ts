import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  busqueda = '';

  constructor(
    private navbarService: NavbarService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

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

  abrirCategoria(categoria: any): void {
    this.cerrarSubmenus();
    categoria.open = true;
    this.menuOpen = true;
  }

  identificadorCategoria(categoria: any): string | number {
    const slug = typeof categoria?.slug === 'string'
      ? categoria.slug.trim()
      : '';

    // Algunas categorías antiguas no tienen slug. El id evita formar /categoria/null.
    return slug || categoria.id;
  }

  cerrarMenu(): void {
    this.menuOpen = false;
    this.cerrarSubmenus();
  }

  buscarProductos(): void {
    const busqueda = this.busqueda.trim();

    this.router.navigate(['/productos'], {
      queryParams: busqueda ? { buscar: busqueda } : {}
    });

    this.cerrarMenu();
  }

  private cerrarSubmenus(): void {
    this.menu.forEach((categoria) => categoria.open = false);
  }

  get cantidadCarrito(): number {

    return this.carritoService.cantidadItems();

  }

}
