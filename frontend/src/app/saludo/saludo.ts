import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api-service';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-saludo',
  imports: [MatCardModule], // 👈 importante
  templateUrl: './saludo.html',
  styleUrls: ['./saludo.scss']
})
export class Saludo implements OnInit {

  saludo: string='';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getSaludo().subscribe({
      next: (res) => {
        this.saludo = res.mensaje;
      },
      error: (err) => {
        console.error('Error al obtener saludo:', err);
      }
    });
  }

}
