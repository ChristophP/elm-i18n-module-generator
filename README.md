# ELm i18n Module Generator

This repo provides a script that can generate elm functions from JSON
translation files.

## Why is this necessary?

The company I work for stored all their translation files in JSON and also
depends on this format for collaboration with third party translation service.
So storing the translations in Elm directly was not an option for us. We still
didn't want to miss out on the Elm goodness. Thus, this i18n module generator
was born.

## How to use?

Clone this repo. Run the `index.js` Script in the `src` folder.

```node src/index.js```

This currently assumes that you have a `locale` folder in the current working
directory that contains all your JSON translation files like so:

```
locale
  |- mytranslation.en.json
  |- mytranslation.de.json
  ...
```

Imagine the translation files look liek this:
```
{
  "hello": "Hello",
  "gooddaySalute": "Good Day {name}"
}
```
in english and in german
```
{
  "hello": "Hallo",
  "gooddaySalute": "Guten Tag {name}"
}
```

This will generate a `Translations.elm` file with the follwing content.

```
module Translations

type Lang
  =  De
  |  En

getLnFromCode: String -> Lang
getLnFromCode code =
   case code of
      "de" -> De
      "en" -> En

hello: Lang -> String
hello lang =
  case lang of
      De -> "Hallo"
      En -> "Hello"

gooddaySalute: Lang -> String
gooddaySalute lang =
  case lang of
      De -> "Guten Tag {name}"
      En -> "Good Day {name}"
```

## Future Features

This is a list of TODOs that I plan to implement. Pull Requests are also
welcome. Just contact me if you want to contribute.

- Put this in an npm package with a bin script
- Use command line arguments to configure input folder, output file etc.
