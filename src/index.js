const fs = require('fs-extra');
const path = require('path');

const R = require('ramda');

const trFile = path.join(__dirname, '../Translations.elm');

const files = fs.readdirSync(path.join(__dirname, '../locale'))
const getLangFromFile = R.pipe(R.split('.'), R.slice(1, 2), R.head);
const languages = R.map(getLangFromFile)(files);
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const tags = R.pipe(
  R.addIndex(R.map)(
    (tag, index) => {
      const concatVal = index !== 0 ? '  |  ' : '  =  ';
      return R.pipe(capitalize, R.concat(concatVal))(tag);
    }),
  R.join('\n')
);
const unionType =
`type Lang\n${tags(languages)}`;

const lnCase = ln => `      "${ln}" -> ${capitalize(ln)}`;
const getLnFromCode =
`getLnFromCode: String -> Lang
getLnFromCode code =
   case code of \n${R.pipe(R.map(lnCase), R.join('\n'))(languages)}`;

const getFileContent =
  filename => fs.readJsonSync(path.join(__dirname, '../locale/', filename), 'utf8');

const writeFileContent = content => {
  const generateTrElmModule = (snippets) =>
    `module Translations exposing (..)

${unionType}

${getLnFromCode}

${R.join('\n\n', snippets)}`;

  fs.writeFileSync(trFile, generateTrElmModule(content), 'utf8')
};

const trCase = ({ ln, value }) => `      ${capitalize(ln)} -> "${value}"`;
const generateElmFunctions = (translations, key) =>
  `${key}: Lang -> String
${key} lang =
  case lang of \n${R.pipe(R.map(trCase), R.join('\n'))(translations)}`;

const processFileContent = filename => {
  const lang = getLangFromFile(filename);
}

const createFileContentPairs = R.chain(
  filename => R.pipe(
    getFileContent,
    R.mapObjIndexed((value, key) => ({ ln: getLangFromFile(filename), key, value })),
    R.values
  )(filename)
);

const fileContentMap = R.pipe(
  createFileContentPairs,
  R.groupBy(R.prop('key'))
)(files);

const createSnippets = R.pipe(
  R.mapObjIndexed(generateElmFunctions),
  R.values
);

writeFileContent(createSnippets(fileContentMap));
process.exit(0)
