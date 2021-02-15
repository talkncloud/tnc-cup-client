import { CLOUDFORMATION_SCHEMA } from 'cloudformation-js-yaml-schema';
import yaml from 'js-yaml';
import fs from 'fs';
import { Currency } from '../models/currency';
import { TemplateBody } from '../models/template-body';

const parseYamlFromPath = (path: string) => {
  // console.log(`Parse yaml from path: ${path}`);
  try {
    const content = yaml.load(fs.readFileSync(path).toString(), { schema: CLOUDFORMATION_SCHEMA });
    return content;
  } catch (e) {
    console.error(`yamlParser ${e}`);
    return e;
  }
}

const constructTemplateBodyApi = (orgBody: any[], calcs: string, isCalcConfig: boolean, currency: Currency, budget: number, region: string) => {
  const a: TemplateBody[] = [];
  const body: TemplateBody = {
    file: orgBody,
    calcs: isCalcConfig ? JSON.parse(calcs) : [],
    currency,
    budget,
    region
  };
  a.push(body);
  console.log(`template body: ${JSON.stringify(a, null, 2)}`);

  return JSON.stringify(a);

}

export { parseYamlFromPath, constructTemplateBodyApi }