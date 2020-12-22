import yaml from 'js-yaml';
import fs from 'fs';
import { Currency } from '../models/currency';
import { TemplateBody } from '../models/template-body';

const parseYamlFromPath = (path: string) => {
  console.log(`Parse yaml from path: ${path}`);
  try {
    const content = yaml.load(fs.readFileSync(path).toString());
    return content;
  } catch (e) {
    console.error(`yamlParser ${e}`);
    return e;
  }
}

const constructTemplateBodyApi = (orgBody: any[], currency: Currency, budget: number) => {
  const a: TemplateBody[] = [];
  const body: TemplateBody = {
    file: orgBody,
    currency,
    budget
  };
  a.push(body);
  return JSON.stringify(a);

}

export { parseYamlFromPath, constructTemplateBodyApi }