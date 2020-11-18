import yaml from 'js-yaml';
import fs from 'fs';

const parseYamlFromPath = (path: string) => {
  console.log(`Parse yaml from path: ${path}`);
  try {
      const content = yaml.load(fs.readFileSync(path).toString());
      return content;    
  } catch(e) {
      console.error(`yamlParser ${e}`);
      return e;
  }
}

export { parseYamlFromPath }
