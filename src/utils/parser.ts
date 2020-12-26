import { CLOUDFORMATION_SCHEMA } from 'cloudformation-js-yaml-schema';
import yaml from 'js-yaml';
import fs from 'fs';
import { Currency } from '../models/currency';
import { TemplateBody } from '../models/template-body';

const parseYamlFromPath = (path: string) => {
  console.log(`Parse yaml from path: ${path}`);
  try {
    const content = yaml.safeLoad(fs.readFileSync(path).toString(), { schema: CLOUDFORMATION_SCHEMA });
    return content;
  } catch (e) {
    console.error(`yamlParser ${e}`);
    return e;
  }
}

const constructTemplateBodyApi = (orgBody: any[], currency: Currency, budget: number, region: string) => {
  const a: TemplateBody[] = [];
  const body: TemplateBody = {
    file: orgBody,
    currency,
    budget,
    region
  };
  a.push(body);
  return JSON.stringify(a);

}

export { parseYamlFromPath, constructTemplateBodyApi }