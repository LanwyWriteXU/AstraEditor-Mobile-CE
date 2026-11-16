const fs = require('fs');
const path = require('path');

const root = 'packages/scratch-gui/src';
const files = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
};
walk(root);

const resolveImport = (from, spec) => {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
};

const graph = new Map();
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const deps = [];
  const re = /(?:import[\s\S]*?from\s*|import\s*|require\()\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source))) {
    const resolved = resolveImport(file, m[1]);
    if (resolved) deps.push(resolved);
  }
  graph.set(file, deps);
}

const state = new Map();
const stack = [];
const cycles = [];

const dfs = (node) => {
  state.set(node, 'visiting');
  stack.push(node);
  for (const dep of graph.get(node) || []) {
    if (!graph.has(dep)) continue;
    if (state.get(dep) === 'visiting') {
      const idx = stack.indexOf(dep);
      cycles.push(stack.slice(idx).concat(dep));
    } else if (!state.has(dep)) {
      dfs(dep);
    }
  }
  stack.pop();
  state.set(node, 'done');
};

for (const file of graph.keys()) {
  if (!state.has(file)) dfs(file);
}

console.log('cycles:', cycles.length);
for (const cycle of cycles.slice(0, 12)) {
  console.log('---');
  console.log(cycle.map((f) => f.replace(root + path.sep, '')).join(' -> '));
}
