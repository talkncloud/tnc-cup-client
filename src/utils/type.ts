import { Service } from "../models/service-content";

export function isService(obj: any): obj is Service {
  return typeof obj.description === 'string' && typeof obj.price === 'number'
}