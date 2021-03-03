module Translations exposing (..)

{-| This file was automatically generated with elm-i18n-gen.
For more in information visit:

<https://github.com/ChristophP/elm-i18n-module-generator>

-}


type Lang
    = De
    | En


{-| Pass a language code that will return a Lang-type, if it exists.
Otherwise `Nothing` is returned.
-}
getLnFromCode : String -> Maybe Lang
getLnFromCode code =
    case String.toLower code of 
        "de" ->
            Just De

        "en" ->
            Just En

        _ ->
            Nothing


{-| Return the lowerCase language code for the given Lang.
-}
getCodeFromLn : Lang -> String
getCodeFromLn lang =
    case lang of 
        De ->
            "de"

        En ->
            "en"


hello : Lang -> String
hello lang =
    case lang of 
        De ->
            "Hallo"

        _ ->
            "Hello"


gooddaySalute : Lang -> String -> String -> String
gooddaySalute lang str0 str1 =
    case lang of 
        De ->
            "Guten Tag " ++ str0 ++ " " ++ str1 ++ ""

        _ ->
            "Good Day " ++ str0 ++ " " ++ str1 ++ ""


tigersRoar : Lang -> String
tigersRoar lang =
    case lang of 
        De ->
            "Brüll!"

        _ ->
            "Roar!"

