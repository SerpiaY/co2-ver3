import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  rawData: any;
  getEmissionsData() {
    throw new Error('Method not implemented.');
  }
  private countryEmissionsData: any[] = [];
  private sectorEmissionsData: any[] = [];
  public dataInitialized: boolean = false;

  constructor(private papa: Papa, private http: HttpClient) {}

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
      'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Réunion',
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

  // Load CSV Data
  private loadCSVData(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      fetch(filePath)
        .then((response) => response.text())
        .then((csvData) => {
          this.papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              // Convert values to numeric where needed
              const parsedData = result.data.map((row: any) => {
                row.Year = parseInt(row.Year.replace(/[^\d]/g, ''), 10) || null; // Clean non-numeric characters
                row.Emissions_per_capita_by_country =
                  parseFloat(row.Emissions_per_capita_by_country?.replace(/[^\d.-]/g, '')) || null;
                row.Emissions_by_country =
                  parseFloat(row.Emissions_by_country?.replace(/[^\d.-]/g, '')) || null;
                row.Emissions_per_gdp_by_country =
                  parseFloat(row.Emissions_per_gdp_by_country?.replace(/[^\d.-]/g, '')) || null;
                row.CO2_emissions =
                  parseFloat(row.CO2_emissions?.replace(/[^\d.-]/g, '')) || null;
                row.Country = row.Country?.trim(); // Clean up extra spaces
                return row;
              });
              resolve(parsedData);
            },
            error: (error) => reject(error),
          });
        })
        .catch((error) => reject(error));
    });
  }

  // Initialize Data
  async initializeData(): Promise<void> {
    try {
      this.countryEmissionsData = await this.loadCSVData('/final_CO2.csv');
      this.sectorEmissionsData = await this.loadCSVData('/sector-co2.csv');
      this.dataInitialized = true;
  
      console.log('Country Emissions Data:', this.countryEmissionsData); // Debug log
      console.log('Sector Emissions Data:', this.sectorEmissionsData); // Debug log
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Get Emissions Data for a Country and Year
  getCountryEmissions(country?: string, year?: number): any[] {
    if (!this.dataInitialized) {
      console.warn('Country emissions data is not loaded yet.');
      return [];
    }

    console.log('Year:', year, 'Country:', country); // Debug input values
    console.log('Full Data:', this.countryEmissionsData); // Debug loaded data

    const filteredData = this.countryEmissionsData.filter(
      (item) =>
        (!country || item.Country === country) &&
        (year === undefined || +item.Year === year) &&
        !isNaN(+item.Year) // Ensure Year is numeric
    );

    console.log('Filtered Data:', filteredData); // Debug filtered results
    return filteredData;
  }

  // Get Sector Emissions Data
  getSectorEmissions(country?: string, sector?: string, year?: number): any[] {
    if (!this.dataInitialized) {
      console.warn('Sector emissions data is not loaded yet.');
      return [];
    }

    return this.sectorEmissionsData.filter(
      (item) =>
        item.Country === country &&
        item.Sector === sector &&
        +item.Year === year &&
        !isNaN(+item.Year) // Ensure Year is numeric
    );
  }

  // Get Unique List of Available Countries
  getAvailableCountries(): string[] {
    const uniqueCountries = new Set(
      this.countryEmissionsData.map((item: any) => item.Country)
    );
    return Array.from(uniqueCountries);
  }

  // Test Data Retrieval (for debugging purposes)
  testDataRetrieval(): void {
    const testYear = 2023; // Replace with a valid year from your dataset
    const testCountry = 'Afghanistan'; // Replace with a valid country from your dataset

    const testData = this.getCountryEmissions(testCountry, testYear);
    console.log(`Test Data for Country: ${testCountry}, Year: ${testYear}`, testData);

    if (testData.length === 0) {
      console.warn(`No data found for ${testCountry} in ${testYear}`);
    } else {
      console.log('Data Found:', testData);
    }
  }

  testSectorData(): void {
    if (!this.dataInitialized) {
      console.warn('Data is not initialized yet.');
      return;
    }
    console.log('All Sector Emissions Data:', this.sectorEmissionsData); // Logs full sector data
  
    const testCountry = 'United States'; // Replace with a valid country from your dataset
    const testYear = 2023; // Replace with a valid year from your dataset
    const testSector = 'Agriculture'; // Replace with a valid sector from your dataset
  
    const filteredData = this.getSectorEmissions(testCountry, testSector, testYear);
    console.log(`Sector Data for ${testCountry}, Sector: ${testSector}, Year: ${testYear}`, filteredData);
  
    if (filteredData.length === 0) {
      console.warn(`No sector data found for ${testCountry} in sector: ${testSector}, year: ${testYear}`);
    } else {
      console.log('Filtered Sector Data:', filteredData);
    }
  }
  

  getContinentEmissions(year: number): { [key: string]: number } {
    const data = this.getCountryEmissions(undefined, year);
    const continentTotals: { [key: string]: number } = {};

  
    for (const continent in this.continentMapping) {
      const countries = this.continentMapping[continent as keyof typeof this.continentMapping];
      const total = data
        .filter((d) => countries.includes(d.Country))
        .reduce((sum, d) => sum + (d.Emissions_by_country || 0), 0);
      continentTotals[continent] = total;
    }
  
    return continentTotals;
  }

  getSectorEmissionsForCountry(country: string, year: number): { sector: string; emissions: number }[] {
    if (!this.dataInitialized) {
      console.warn('Sector emissions data is not loaded yet.');
      return [];
    }
  
    const filteredData = this.sectorEmissionsData
      .filter(item => item.Country === country && +item.Year === year)
      .map(item => ({
        sector: item.Sector,
        emissions: item.CO2_emissions || 0,
      }));
  
    return filteredData;
  }
  public getAvailableYears(): number[] {
    if (!this.dataInitialized) {
      console.warn('Data is not initialized yet.');
      return [];
    }
  
    return Array.from(
      new Set(this.sectorEmissionsData.map((item) => +item.Year))
    ).sort((a, b) => a - b); // Sort the years in ascending order
  }
  
  
  getAvailableRegions(): string[] {
    return Object.keys(this.continentMapping);
  }
  
  getMapData(): Observable<any> {
    return this.http.get('/MapTopology.json');
  }

  getCO2Data(): Observable<any> {
    return this.http.get('/final_CO2.csv', { responseType: 'text' });
  }

  parseCSV(data: string): any[] {
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    return rows.slice(1).map((row) => {
      const values = row.split(',');
      return headers.reduce((obj: { [key: string]: any }, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  }
  
}
