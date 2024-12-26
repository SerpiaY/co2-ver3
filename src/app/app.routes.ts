import { Routes } from '@angular/router';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { ChoroplethMapComponent } from './components/choropleth-map/choropleth-map.component';
import { WelcomeComponent } from './welcome/welcome.component';
export const routes: Routes = [
    {
        title: 'Line Chart',
        path: 'line-chart',
        component: LineChartComponent,
    },
    {
        title: 'Bar Chart',
        path: 'bar-chart',
        component: BarChartComponent,
    },
    {
        title: 'Choropleth Chart',
        path: 'map-chart',
        component: ChoroplethMapComponent,
    },
    {
        title: 'Home Page',
        path: 'welcome',
        component: WelcomeComponent,
    },
];
