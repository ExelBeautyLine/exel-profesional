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

  get cantidadCarrito(): number {

    return this.carritoService.cantidadItems();

  }

}