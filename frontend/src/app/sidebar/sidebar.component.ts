import { Component, EventEmitter, Input, Output, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() isMobile = false;
  @Output() closeSidebar = new EventEmitter<void>();

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/' },
    { icon: 'cloud', label: 'Clima', route: '/weather' },
    { icon: 'info', label: 'Acerca de', route: '/about' }
  ];

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    // Habilitar transiciones después del primer render para evitar FOUC
    setTimeout(() => {
      const sidebarElement = this.elementRef.nativeElement.querySelector('.sidebar');
      if (sidebarElement) {
        sidebarElement.classList.add('transitions-enabled');
      }
    }, 0);
  }

  onCloseSidebar() {
    this.closeSidebar.emit();
  }
}