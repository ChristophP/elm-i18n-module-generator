const fs = require('fs-extra');
const path = require('path');

const R = require('ramda');

const files = fs.readdirSync(path.join(__dirname, '../locale'))

const trDir = path.join(__dirname, '../Translations');

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

// create Translation Dir
// add a locale Dir for each language
fs.ensureDirSync(trDir);

const getFileContent =
  filename => fs.readJsonSync(path.join(__dirname, '../locale/', filename), 'utf8');

const writeFileContent = filename => content => {
  const lang = R.pipe(R.split('.'), R.slice(1, 2), R.head, capitalize)(filename);
  const generateTrElmModule = (snippets) => {
    return `
module Tranlations.${lang}

${R.join('\n\n', content)}`
  };
  fs.writeFileSync(path.join(trDir,lang + '.elm'), generateTrElmModule(content), 'utf8')
};

const generateElmFunctions = ([index, value]) => {
  return `${index}: String -> String
${index} = "${value}"`;
};

const processFileContent = R.pipe(R.toPairs, R.map(generateElmFunctions));

files.forEach(filename => {
  R.pipe(
    getFileContent,
    processFileContent,
    writeFileContent(filename)
  )(filename);
});

process.exit(0)


