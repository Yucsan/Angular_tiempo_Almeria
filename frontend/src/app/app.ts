import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Saludo } from './saludo/saludo';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Saludo],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
