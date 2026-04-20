const fs = require('fs');

const json = JSON.parse(fs.readFileSync('/tmp/figma-response.json', 'utf-8'));

const summary = {
  name: json.name,
  lastModified: json.lastModified,
  version: json.version,
  thumbnailUrl: json.thumbnailUrl || null,
  pages: []
};

if (json.document && json.document.children) {
  summary.pages = json.document.children.map(page => ({
    id: page.id,
    name: page.name,
    type: page.type,
    childrenCount: page.children ? page.children.length : 0
  }));
}

// Extract styles
summary.styles = {
  colors: Object.keys(json.styles || {}).filter(k => json.styles[k].styleType === 'FILL').length,
  text: Object.keys(json.styles || {}).filter(k => json.styles[k].styleType === 'TEXT').length,
  effects: Object.keys(json.styles || {}).filter(k => json.styles[k].styleType === 'EFFECT').length
};

console.log(JSON.stringify(summary, null, 2));
