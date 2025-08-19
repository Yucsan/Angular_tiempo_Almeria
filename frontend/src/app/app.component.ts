import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherComponent } from './weather/weather';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherComponent, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'weather-app';
  
  isMobile = false;
  sidebarOpen = false;
  private breakpointSubscription?: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    // Detectar cambios de viewport
    this.breakpointSubscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe(result => {
        this.isMobile = result.matches;
        // En desktop, sidebar abierto por defecto; en mobile, cerrado
        this.sidebarOpen = !this.isMobile;
      });
  }

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}
