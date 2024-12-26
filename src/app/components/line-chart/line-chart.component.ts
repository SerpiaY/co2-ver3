import * as d3 from 'd3';
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DataServiceService } from '../../services/data-service.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule],
})
export class LineChartComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private dataService: DataServiceService) {
    Chart.register(...registerables);
  }
  chart!: Chart;
  metric: string = 'Emissions_per_capita_by_country'; // Default metric
  countries: string[] = [];
  selectedCountries: string[] = [];
  continents: string[] = [];
  selectedContinents: (keyof typeof this.dataService.continentMapping)[] = [];
  year: number | undefined;
  searchQuery: string = '';
  availableYears: number[] = [];

  ngOnInit(): void {
    this.continents = Object.keys(this.dataService.continentMapping);
    if (!this.dataService.dataInitialized) {
      this.dataService.initializeData().then(() => {
        this.loadCountries();
        this.loadYears();
        this.initializeChart();
      });
    } else {
      this.loadCountries();
      this.loadYears();
      this.initializeChart();
    }
  }

  ngAfterViewInit(): void {
    if (this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadCountries(): void {
    this.countries = this.dataService.getAvailableCountries();
  }

  loadYears(): void {
    const data = this.dataService.getCountryEmissions();
    this.availableYears = Array.from(new Set(data.map((d) => d.Year))).sort();
  }

  initializeChart(): void {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}`,
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart(): void {
    if (!this.chart) return;

    const selectedData = this.getFilteredData();
    const labels = Array.from(new Set(selectedData.map((d) => d.Year))).sort();
    const datasets = this.generateDatasets(selectedData);

    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  getFilteredData(): any[] {
    let data = this.dataService.getCountryEmissions();

    if (this.selectedCountries.length > 0) {
      data = data.filter((d) => this.selectedCountries.includes(d.Country));
    }

    if (this.selectedContinents.length > 0) {
      const continentCountries = this.selectedContinents.flatMap(
        (continent) => this.dataService.continentMapping[continent as keyof typeof this.dataService.continentMapping]
      );
      data = data.filter((d) => continentCountries.includes(d.Country));
    }

    if (this.year !== undefined) {
      data = data.filter((d) => d.Year === this.year);
    }

    if (this.searchQuery) {
      data = data.filter((d) => d.Country.includes(this.searchQuery));
    }

    return data;
  }

  generateDatasets(data: any[]): any[] {
    const grouped = d3.group(data, (d) => d.Country);
    return Array.from(grouped, ([country, records]) => ({
      label: country,
      data: records.map((d) => d[this.metric]),
      borderColor: this.getRandomColor(),
      fill: false,
    }));
  }

  getRandomColor(): string {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, 1)`;
  }

  onMetricChange(): void {
    this.updateChart();
  }

  onYearChange(): void {
    this.updateChart();
  }

  onSearchChange(): void {
    this.updateChart();
  }

  onCountrySelectionChange(): void {
    this.updateChart();
  }

  onContinentSelectionChange(): void {
    this.updateChart();
  }
}
