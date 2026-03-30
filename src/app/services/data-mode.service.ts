import { Injectable } from '@angular/core';
import { isMockDataEnabled } from '../config/mock-data.config';

@Injectable({
  providedIn: 'root'
})
export class DataModeService {
  private useMockData: boolean = isMockDataEnabled();

  isMockMode(): boolean {
    return this.useMockData;
  }

}
