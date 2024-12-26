import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DataServiceService } from '../../services/data-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class BarChartComponent implements OnInit, OnDestroy {
  selectedYear: number = 2023; // Default year
  selectedMetric: string = 'Emissions_by_country'; // Default metric
  chart: any; // Chart.js instance
  analysisDescription: string = ''; // Analysis description
  selectedContinent: string = 'All'; // Default selection
  continents: string[] = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

  public continentMapping = {
      Africa: [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
        'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Djibouti',
        'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia',
        'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 
        'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 
        'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 
        'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 
        'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
      ],
      Asia: [
        'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei',
        'Cambodia', 'China', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel',
        'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia',
        'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan',
        'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka',
        'Syria', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkmenistan', 'United Arab Emirates',
        'Uzbekistan', 'Vietnam', 'Yemen',
      ],
      Europe: [
        'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium',
        'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
        'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland',
        'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
        'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
        'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia',
        'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom',
      ],
      NorthAmerica: [
        'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 
        'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 
        'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis',
        'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States',
      ],
      SouthAmerica: [
        'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 
        'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
      ],
      Oceania: [
        'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 
        'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 
        'Tuvalu', 'Vanuatu',
      ],
    };
  continentChart: any;

  constructor(private dataService: DataServiceService) {
    Chart.register(...registerables);
  }

  async ngOnInit(): Promise<void> {
    await this.dataService.initializeData(); // Ensure data is loaded
    this.updateChart(); // Render initial chart
  }

  async updateChart(): Promise<void> {
    // Fetch the data for the selected year
    const data = this.dataService.getCountryEmissions(undefined, this.selectedYear);
    console.log('Data for selected year:', this.selectedYear, data);

    // Filter countries by selected continent if it's not "All"
    const filteredData = data
      .filter((d) => d[this.selectedMetric] !== null && d[this.selectedMetric] !== undefined)
      .filter((d) =>
        this.selectedContinent === 'All' || 
        this.continentMapping[this.selectedContinent as keyof typeof this.continentMapping]?.includes(d.Country)
      );

    // If no data exists, show a message and destroy the chart
    if (filteredData.length === 0) {
      this.analysisDescription = `No data available for ${this.selectedContinent} in the year ${this.selectedYear}.`;
      if (this.chart) this.chart.destroy();
      return;
    }

    // Prepare labels and values for the chart
    const labels = filteredData.map((d) => d.Country);
    const values = filteredData.map((d) => parseFloat(d[this.selectedMetric]) || 0);

    // Clear existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Create the bar chart
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // Country names as labels on the y-axis
        datasets: [
          {
            label: `CO₂ Emissions (${this.getMetricLabel(this.selectedMetric)})`,
            data: values, // Emission values
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true, // Allow chart to grow based on the container
        indexAxis: 'y', // Switch the axes to make the bar chart horizontal
        plugins: {
          legend: {
            display: true, // Display legend for clarity
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) =>
                `${tooltipItem.raw} ${this.getMetricUnit(this.selectedMetric)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 18, // Larger font for better readability
              },
            },
            title: {
              display: true,
              text: `CO₂ Emissions (${this.getMetricUnit(this.selectedMetric)})`,
            },
          },
          y: {
            ticks: {
              font: {
                size: 16, // Larger font for y-axis labels (country names)
              },
            },
          },
        },
      },
    });

    // Generate analysis description
    this.generateAnalysis(values, labels);
  }

  private getMetricLabel(metric: string): string {
    switch (metric) {
      case 'Emissions_per_capita_by_country':
        return 'Emissions Per Capita';
      case 'Emissions_by_country':
        return 'Total Emissions';
      case 'Emissions_per_gdp_by_country':
        return 'Emissions Per GDP';
      default:
        return '';
    }
  }

  private getMetricUnit(metric: string): string {
    switch (metric) {
      case 'Emissions_per_capita_by_country':
        return 'tons per capita';
      case 'Emissions_by_country':
        return 'tons';
      case 'Emissions_per_gdp_by_country':
        return 'tons per GDP unit';
      default:
        return '';
    }
  }

  private generateAnalysis(values: number[], labels: string[]): void {
    if (!values.length) {
      this.analysisDescription = 'No data available for the selected year.';
      return;
    }

    const maxIndex = values.indexOf(Math.max(...values));
    const minIndex = values.indexOf(Math.min(...values));
    const totalEmissions = values.reduce((sum, v) => sum + v, 0);

    this.analysisDescription = `
      In ${this.selectedYear}, the country with the highest CO₂ emissions is ${labels[maxIndex]}
      with ${values[maxIndex]} ${this.getMetricUnit(this.selectedMetric)}.
      The country with the lowest emissions is ${labels[minIndex]} with ${
      values[minIndex]
    } ${this.getMetricUnit(this.selectedMetric)}.
      The total emissions for ${this.selectedContinent} are ${totalEmissions} ${this.getMetricUnit(
      this.selectedMetric
    )}.
    `;
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async renderContinentComparisonChart(): Promise<void> {
    const continentTotals = this.dataService.getContinentEmissions(this.selectedYear);
    const labels = Object.keys(continentTotals);
    const values = Object.values(continentTotals);
  
    const ctx = document.getElementById('continentChart') as HTMLCanvasElement;
    if (this.continentChart) this.continentChart.destroy(); // Destroy old chart if exists
  
    this.continentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total CO₂ Emissions by Continent',
            data: values,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        indexAxis: 'x', // Vertical bars
      },
    });
  }
  
}
