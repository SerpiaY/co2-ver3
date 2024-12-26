import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './services/data-service.service';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { BarChartComponent } from "./components/bar-chart/bar-chart.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ChoroplethMapComponent } from './components/choropleth-map/choropleth-map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [LineChartComponent, BarChartComponent, FormsModule, CommonModule, MatSidenavModule, RouterModule, ChoroplethMapComponent]
})
export class AppComponent implements OnInit {
  showFiller = false;
  title = 'CO₂ Emissions Visualization';

  constructor(private dataService: DataServiceService) {}

  async ngOnInit() {
    // Initialize data on app startup
    await this.dataService.initializeData();
  }
}
