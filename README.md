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

!!! Disclaimer: This module is only really useful when I finish string
interpolation. Currently this generator only supports constant language strings.
Currently all translation functions have this signature.

`Lang -> String`

Placeholders will not work. They would need a signature like this
(for one placeholder):

`Lang -> String -> String`

I hope I can finish that within the next weeks.

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

- Extend for use with placeholders
- Put this in an npm package with a bin script
- Use command line arguments to configure input folder, output file and
Placeholder separator
- Port the generating logic to elm in an elm worker and only use node for
file IO.
- Add tests
