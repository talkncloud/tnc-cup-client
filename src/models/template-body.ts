import { Currency } from "./currency";

export interface TemplateBody {
  file: any[];
  currency: Currency;
  budget: number;
  region: string;
}