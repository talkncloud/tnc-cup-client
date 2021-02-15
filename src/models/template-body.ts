import { Currency } from "./currency";

export interface TemplateBody {
  file: any[];
  calcs: any[];
  currency: Currency;
  budget: number;
  region: string;
}