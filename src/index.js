#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const argv = require('yargs').argv;
const R = require('ramda');

const [
  localeDir = path.join(__dirname, '../locale'),
  trFile = path.join(__dirname, '../Translations.elm'),
] = argv._;

const files = fs.readdirSync(localeDir)
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
   case code of \n${R.pipe(R.map(lnCase), R.join('\n'))(languages)}
      _ -> En`;

const getFileContent =
  filename => fs.readJsonSync(path.join(localeDir, filename), 'utf8');

const writeFileContent = content => {
  const generateTrElmModule = (snippets) =>
    `module Translations exposing (..)

${unionType}

${getLnFromCode}

${R.join('\n\n', snippets)}`;

  fs.writeFileSync(trFile, generateTrElmModule(content), 'utf8')
};

const trCase = ({ ln, value }) => `      ${capitalize(ln)} -> "${value}"`;

const generateElmFunctions = (translations, key) => {
  const placeholderRegex = /\{\{.*?\}\}/;
  const placeholderRegexGlobal = /\{\{.*?\}\}/g;
  const [{ value: firstTr }] = translations;
  const matches = firstTr.match(placeholderRegexGlobal) || [];
  const signatureStrings = R.pipe(R.repeat('String'), R.join(' -> '));
  const args = R.pipe(
    R.addIndex(R.map)((match, index) => ('str' + index)),
    R.join(' ')
  );
  const replacePlaceholdersWrapper = (str) => replacePlaceholders(str, 0);
  const replacePlaceholders = (str, level) => {
    if (R.test(placeholderRegex, str)) {
      const newStr = R.replace(placeholderRegex, `" ++ str${level} ++ "`, str);
      return replacePlaceholders(newStr, level + 1);
    }
    return str;
  };
  const strings = R.pipe(
    R.map(R.pipe((translation) => (
      R.merge(translation, {
        value: replacePlaceholdersWrapper(translation.value)
      })
    ), trCase)),
    R.join('\n')
  );
  return `${key}: Lang -> ${signatureStrings(matches.length + 1)}
${key} lang ${args(matches)} =
  case lang of \n${strings(translations)}`;
};

const processFileContent = R.curry((ln, trObject) => {
  const restructureData = (value, prefix, initialValue) => R.pipe(
    R.keys,
    R.reduce((acc, key) => {
      const subValue = value[key];
      const prefixedKey = prefix + (prefix ? capitalize(key) : key);
      if (R.is(Object, subValue)) {
        return restructureData(subValue, prefixedKey, acc);
      }
      return R.merge(acc, { [prefixedKey]: { ln, key: prefixedKey, value: subValue } });
    }, initialValue)
  )(value);
  return restructureData(trObject, '', {});
  //return R.mapObjIndexed((value, key) => ({ ln, key, value }))(trObject);
});

const createFileContentPairs = R.chain(
  filename => R.pipe(
    getFileContent,
    processFileContent(getLangFromFile(filename)),
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
