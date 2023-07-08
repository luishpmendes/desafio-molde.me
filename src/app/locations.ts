import { Location } from './location';

export interface Locations {
  data: Location[];
  limit: number;
  page: number;
  pages: number;
  total: number;
}
