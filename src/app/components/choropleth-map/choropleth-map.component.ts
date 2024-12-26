import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { DataServiceService } from '../../services/data-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-choropleth-map',
  templateUrl: './choropleth-map.component.html',
  styleUrls: ['./choropleth-map.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ChoroplethMapComponent implements OnInit, AfterViewInit {

  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.dataService.initializeData().then(() => {
      this.availableYears = this.dataService.getAvailableYears();
      this.selectedYear = this.availableYears[0];
      this.updateMap();
    });
  }, 0);
  }
  map: L.Map | null = null;
  geojsonLayer: L.GeoJSON | null = null;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  selectedMetric: string = 'Emissions_by_country';
  metrics: string[] = [
    'Emissions_by_country',
    'Emissions_per_capita_by_country',
    'Emissions_per_gdp_by_country'
  ];
  legendControl: L.Control | null = null;

  osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

  constructor(private dataService: DataServiceService) {}

  

  ngOnInit(): void {
  }

  initMap(): void {
    this.map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      layers: [this.osmLayer],
    }).setView([37.8, -96], 4);
  }

  updateMap(): void {
    if (!this.map) return;

    if (this.geojsonLayer) this.map.removeLayer(this.geojsonLayer);
    if (this.legendControl) this.map.removeControl(this.legendControl);

    fetch('/countries.geojson')
      .then((res) => res.json())
      .then((geojsonData) => {
        const countryEmissions = this.dataService.getCountryEmissions(undefined, this.selectedYear);

        this.geojsonLayer = L.geoJSON(geojsonData, {
          style: (feature) => {
            const countryName = feature?.properties?.ADMIN?.toLowerCase().trim();
            const countryData = countryEmissions.find(
              (d) => d.Country.toLowerCase().trim() === countryName
            );
            const value = countryData?.[this.selectedMetric] || 0;
            return {
              fillColor: this.getColor(value),
              weight: 1,
              color: 'white',
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const countryName = feature.properties.ADMIN?.toLowerCase().trim();
            const countryData = countryEmissions.find(
              (d) => d.Country.toLowerCase().trim() === countryName
            );
            const value = countryData?.[this.selectedMetric] || 'N/A';
            layer.bindTooltip(`
              <strong>${feature.properties.ADMIN || 'Unknown'}</strong><br>
              ${this.selectedMetric}: ${value}
            `);
            layer.on({
              mouseover: this.highlightFeature,
              mouseout: this.resetHighlight.bind(this),
            });
          },
        }).addTo(this.map as L.Map);

        this.addLegend();
      });
  }

  private getColor(value: number): string {
    // Define separate color schemes for each metric
    if (this.selectedMetric === 'Emissions_by_country') {
      return value > 1000 ? '#800026' :
        value > 500 ? '#BD0026' :
        value > 200 ? '#E31A1C' :
        value > 100 ? '#FC4E2A' :
        value > 50 ? '#FD8D3C' :
        value > 20 ? '#FEB24C' :
        value > 10 ? '#FED976' : '#FFEDA0';
    }  if (this.selectedMetric === 'Emissions_per_capita_by_country') {
      return value > 50 ? '#005a32' :
        value > 20 ? '#238b45' :
        value > 10 ? '#41ab5d' :
        value > 5 ? '#74c476' :
        value > 1 ? '#a1d99b' :
        '#c7e9c0';
    } if (this.selectedMetric === 'Emissions_per_gdp_by_country') {
      return value > 1 ? '#084594' :
        value > 0.7 ? '#2171b5' :
        value > 0.3 ? '#4292c6' :
        value > 0.1 ? '#6baed6' :
        '#9ecae1';
    }
    return '#FFFFFF'; // Default color if no condition is met
  }

  private addLegend(): void {
    if (!this.map) return;
  
    if (this.legendControl) {
      this.map.removeControl(this.legendControl); // Remove any existing legend
    }
  
    this.legendControl = new L.Control({ position: 'bottomright' });
  
    this.legendControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend');
  
      // Define ranges and colors based on selected metric
      let ranges: string[] = [];
      let colors: string[] = [];
  
      if (this.selectedMetric === 'Emissions_by_country') {
        ranges = ['> 1000', '500 - 1000', '200 - 500', '100 - 200', '50 - 100', '20 - 50', '10 - 20', '< 10'];
        colors = ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C', '#FED976', '#FFEDA0'];
      } else if (this.selectedMetric === 'Emissions_per_capita_by_country') {
        ranges = ['> 50', '20 - 50', '10 - 20', '5 - 10', '1 - 5', '< 1'];
        colors = ['#005a32', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0'];
      } else if (this.selectedMetric === 'Emissions_per_gdp_by_country') {
        ranges = ['> 1', '0.7 - 1', '0.3 - 0.7', '0.1 - 0.3', '< 0.1'];
        colors = ['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1'];
      }
  
      // Construct legend content
      let legendHtml = `<div><strong>${this.selectedMetric}</strong></div>`;
      for (let i = 0; i < ranges.length; i++) {
        legendHtml += `
          <div>
            <i style="background:${colors[i]}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>
            ${ranges[i]}
          </div>`;
      }
  
      div.innerHTML = legendHtml;
      return div;
    };
  
    this.legendControl.addTo(this.map);
  }
  

  private highlightFeature(event: any): void {
    const layer = event.target;
    layer.setStyle({
      weight: 3,
      color: '#666',
      fillOpacity: 0.9,
    });
  }

  private resetHighlight(event: any): void {
    this.geojsonLayer?.resetStyle(event.target);
  }

  onMetricChange(event: any): void {
    this.selectedMetric = event.target.value;
    this.updateMap();
  }

  onYearChange(event: any): void {
    this.selectedYear = +event.target.value;
    this.updateMap();
  }
}
