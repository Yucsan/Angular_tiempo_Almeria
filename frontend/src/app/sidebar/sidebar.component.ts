import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isMobile = false;
  @Output() closeSidebar = new EventEmitter<void>();

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/' },
    { icon: 'cloud', label: 'Clima', route: '/weather' },
    { icon: 'info', label: 'Acerca de', route: '/about' }
  ];

  onCloseSidebar() {
    this.closeSidebar.emit();
  }
}