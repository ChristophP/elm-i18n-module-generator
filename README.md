# Elm i18n Module Generator

This repo provides a script that can generate elm functions from JSON
translation files.

## Why is this necessary?

The company I work for stores all their translation files in JSON and also
depends on this format, for collaboration with a third party translation
service. So storing the translations in Elm directly was not an option for us.
We still didn't want to miss out on the Elm goodness. Thus, this i18n module
generator was born.

## How to use?

Warning: This module currently only supports super simple JSON translation files
that are only on level deep. I still need to implement something that
converts nested keys to camel case. Also it only supports placeholders in
translations that are surrounded by `{{ ... }}`. Translations without
placeholders will be transformed to a function with this signature.

`Lang -> String`

With Placeholders the signature will look more like this:
(for one placeholder):

`Lang -> String -> String`

### Generating the Translation elm module

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

Imagine the translation files look like this:
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
module Translations exposing (..)

type Lang
  =  De
  |  En

getLnFromCode: String -> Lang
getLnFromCode code =
   case code of
      "de" -> De
      "en" -> En

hello: Lang -> String
hello lang  =
  case lang of
      De -> "Hallo"
      En -> "Hello"

gooddaySalute: Lang -> String -> String -> String
gooddaySalute lang str0 str1 =
  case lang of
      De -> "Guten Tag " ++ str0 ++ " " ++ str1 ++ ""
      En -> "Good Day " ++ str0 ++ " " ++ str1 ++ ""
```

### Using the Translations module

Import the generated module in your elm code like this.

```import Translations```

Initialize your Model with a language, it is a union type generated from your
language files:

```
initialModel: Model
initialModel =
  { tigers: List Tiger
  , lang: Translations.En -- <---- add language type
  }
```

Then in your view function do this:
```
view: Model -> Html Msg
view model = div [] [text (Translations.hello model.lang)]
```

## Future Features

This is a list of TODOs that I plan to implement. Pull Requests are also
welcome. Just contact me if you want to contribute.

- camel case nested props
- Clean up
- Put this in an npm package with a bin script
- Use command line arguments to configure input folder, output file and
Placeholder separator
- Port the generating logic to elm in an elm worker and only use node for
file IO.
- Add tests
