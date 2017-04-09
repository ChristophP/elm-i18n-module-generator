const fs = require('fs-extra');
const path = require('path');

const R = require('ramda');

const trDir = path.join(__dirname, '../Translations');

const files = fs.readdirSync(path.join(__dirname, '../locale'))
const getLangFromFile = R.pipe(R.split('.'), R.slice(1, 2), R.head);
const languages = R.map(getLangFromFile)(files);
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const tags = R.pipe(R.map(R.pipe(capitalize, R.concat('  | '))), R.join('\n'));
const unionType =
`type Lang = \n${tags(languages)}`;

const lnCase = ln => `      "${ln}" -> ${capitalize(ln)}`;
const getLnFromCode =
`getLnFromCode: String -> Lang
getLnFromCode code =
   case code of \n${R.pipe(R.map(lnCase), R.join('\n'))(languages)}`;

// create Translation Dir
// add a locale Dir for each language
fs.ensureDirSync(trDir);

const getFileContent =
  filename => fs.readJsonSync(path.join(__dirname, '../locale/', filename), 'utf8');

const writeFileContent = filename => content => {
  const generateTrElmModule = (snippets) => {
    return `
module Translations

${unionType}

${getLnFromCode}

${R.join('\n\n', content)}`
  };
  fs.writeFileSync(path.join(trDir + '.elm'), generateTrElmModule(content), 'utf8')
};

const trCase = tr => `      ${capitalize(tr)} -> `;
const generateElmFunctions = ([index, value]) => {
  return `${index}: Lang -> String
${index} lang =
  case lang of \n${R.pipe(R.map(trCase), R.concat(R.__, value), R.join('\n'))}
`;
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

