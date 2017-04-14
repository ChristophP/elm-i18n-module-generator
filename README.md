# Elm i18n Gen (JSON language file to Elm Functions Generator)

This repo provides a script that can generate elm functions from JSON
translation files.

## Why is this necessary?

The company I work for stores all their translation files in JSON and also
depends on this format, for collaboration with a third party translation
service. So storing the translations in Elm directly was not an option for us.
We still didn't want to miss out on the Elm goodness. Thus, this i18n module
generator was born.

## How to use?

Warning: This module currently only supports placeholders in
translations that are surrounded by `{{ ... }}`.

For every translation string one elm function will be generated.
Translations without placeholders will be transformed to a function with this
signature.

`Lang -> String`

With Placeholders the signature will look more like this:
(for one placeholder):

`Lang -> String -> String`

### Generating the Translation elm module

Install via npm.

```npm install -g elm-i18n-gen```

Then run it from the command line.

```elm-i18n-gen path/to/localeFolder path/to/output/Translations.elm```

This currently assumes that you have a single folder that contains all your
JSON translation files one the same level like so:

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
  "gooddaySalute": "Good Day {{name}} {{assi}}",
  "tigers": {
    "roar": "Roar!"
  }
}
```
in english and in german
```
{
  "hello": "Hallo",
  "gooddaySalute": "Guten Tag {{name}} {{assi}}",
  "tigers": {
    "roar": "Brüll!"
  }
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
      _ -> En

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

tigersRoar: Lang -> String
tigersRoar lang  =
  case lang of
      De -> "Brüll!"
      En -> "Roar!"
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

- Clean up
- Use command line arguments to configure different placeholder separator
(__xxx__, {{{xxx}}}, etc)
- Port the generating logic to elm in an elm worker and only use node for
file IO.

## Contributing

Run the tests with `npm test`. Submit a PR against the master branch or
contact me to discuss ideas.

## Credits

This project was inspired by
[IOSphere/elm-i18n](https://github.com/iosphere/elm-i18n), namely the idea of
representing translation strings as constants or functions. But it is adapted to
fit other needs. It differs in the fact that `elm-i18n-gen` generates a single
elm module from multiple JSON files vs `iosphere/elm-i18n`, which stores its
translations in elm directly and generates other formats from it.
