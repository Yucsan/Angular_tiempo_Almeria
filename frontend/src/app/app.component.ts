import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherComponent } from './weather/weather';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']  // <-- Ojo: style**Urls** (con "s")
})
export class AppComponent {
  title = 'weather-app';
}
