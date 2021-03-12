#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const { argv } = require("yargs");
const R = require("ramda");

const [
  localeDir = path.join(__dirname, "../locale"),
  trFile = path.join(__dirname, "../Translations.elm"),
] = argv._;

const defaultLang = argv.d || argv.default;

if (argv.h || argv.help) {
  console.log("elm-i18n-gen\n");
  console.log("usage: elm-i18n-gen -d EN locale\n");
  console.log("-h --help         print this help");
  console.log("-d --default      define a default language");
  process.exit(0);
}

const files = fs.readdirSync(localeDir);
const getLangFromFile = R.pipe(R.split("."), R.slice(1, 2), R.head);
const languagesFromFile = R.map(getLangFromFile)(files);
const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const languages =
  typeof defaultLang === "string"
    ? [
        ...languagesFromFile.filter((e) => e !== defaultLang.toLowerCase()),
        defaultLang.toLowerCase(),
      ]
    : languagesFromFile;

const tags = R.pipe(
  R.addIndex(R.map)((tag, index) => {
    const concatVal = index !== 0 ? "    | " : "    = ";
    return R.pipe(capitalize, R.concat(concatVal))(tag);
  }),
  R.join("\n")
);
const unionType = `type Lang
${tags(languages)}
`;

const lnCase = (ln) => `        "${ln}" ->
            Just ${capitalize(ln)}
`;
const getLnFromCode = `{-| Pass a language code that will return a Lang-type, if it exists.
Otherwise \`Nothing\` is returned.
-}
getLnFromCode : String -> Maybe Lang
getLnFromCode code =
    case String.toLower code of \n${R.pipe(
      R.map(lnCase),
      R.join("\n")
    )(languages)}
        _ ->
            Nothing
`;

const codeCase = (ln) => `        ${capitalize(ln)} ->
            "${ln}"
`;
const getCodeFromLn = `{-| Return the lowerCase language code for the given Lang.
-}
getCodeFromLn : Lang -> String
getCodeFromLn lang =
    case lang of \n${R.pipe(R.map(codeCase), R.join("\n"))(languages)}
`;

const getFileContent = (filename) =>
  fs.readJsonSync(path.join(localeDir, filename), "utf8");

const writeFileContent = (content) => {
  const generateTrElmModule = (snippets) =>
    `module Translations exposing (..)

{-| This file was automatically generated with elm-i18n-gen.
For more in information visit:

<https://github.com/ChristophP/elm-i18n-module-generator>

-}


${unionType}

${getLnFromCode}

${getCodeFromLn}
${R.join("\n", snippets)}`;

  fs.writeFileSync(trFile, generateTrElmModule(content), "utf8");
};

const trCase = ({ ln, value }) =>
  `        ${capitalize(ln)} ->
            "${value}"
`;

const generateElmFunctions = (translations, key) => {
  const placeholderRegex = /\{\{.*?\}\}/;
  const placeholderRegexGlobal = /\{\{.*?\}\}/g;
  const [{ value: firstTr }] = translations;
  const matches = firstTr.match(placeholderRegexGlobal) || [];
  const signatureStrings = R.pipe(R.repeat("String"), R.join(" -> "));
  const args = R.pipe(
    R.addIndex(R.map)((match, index) => `str${index} `),
    R.join("")
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
    R.map(
      R.pipe(
        (translation) =>
          R.merge(translation, {
            value: replacePlaceholdersWrapper(translation.value),
          }),
        trCase
      )
    ),
    R.join("\n")
  );

  return `${key} : Lang -> ${signatureStrings(matches.length + 1)}
${key} lang ${args(matches)}=
    case lang of \n${strings(translations)}
`;
};

const processFileContent = R.curry((ln, trObject) => {
  ln = ln === defaultLang ? "_" : ln;
  const restructureData = (value, prefix, initialValue) =>
    R.pipe(
      R.keys,
      R.reduce((acc, key) => {
        const subValue = value[key];
        const prefixedKey = prefix + (prefix ? capitalize(key) : key);
        if (R.is(Object, subValue)) {
          return restructureData(subValue, prefixedKey, acc);
        }
        return R.merge(acc, {
          [prefixedKey]: { ln, key: prefixedKey, value: subValue },
        });
      }, initialValue)
    )(value);
  return restructureData(trObject, "", {});
  // return R.mapObjIndexed((value, key) => ({ ln, key, value }))(trObject);
});

const createFileContentPairs = R.chain((filename) =>
  R.pipe(
    getFileContent,
    processFileContent(getLangFromFile(filename)),
    R.values
  )(filename)
);

const sortBy = (p, array) =>
  array.slice(0).sort((a, b) => {
    if (a[p] === "_") {
      return 1;
    }
    if (b[p] === "_") {
      return -1;
    }

    return a[p] > b[p] ? 1 : a[p] < b[p] ? -1 : 0;
  });

const fileContentMap = R.pipe(
  createFileContentPairs,
  R.groupBy(R.prop("key")),
  R.map((list) => sortBy("ln", list))
)(files);

const createSnippets = R.pipe(R.mapObjIndexed(generateElmFunctions), R.values);

writeFileContent(createSnippets(fileContentMap));
process.exit(0);
