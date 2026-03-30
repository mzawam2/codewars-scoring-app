import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { TeamDetailComponent } from './admin/team-detail.component';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'scoreboard', component: AppComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'admin/team/:teamIndex', component: TeamDetailComponent },
      { path: '', redirectTo: '/scoreboard', pathMatch: 'full' }
    ]
  }
];
