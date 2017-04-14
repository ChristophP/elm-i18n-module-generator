module Tests exposing (..)

import Test exposing (..)
import Expect
import Fuzz exposing (list, int, tuple, string)
import String
import Translations
    exposing
        ( Lang(..)
        , getLnFromCode
        , hello
        , gooddaySalute
        , tigersRoar
        )


all : Test
all =
    describe "Translations Test Suite"
        [ describe "getLnFromCode"
            [ test "returns German for \"de\"" <|
                \() ->
                    Expect.equal (getLnFromCode "de") De
            , test "returns English for \"en\"" <|
                \() ->
                    Expect.equal (getLnFromCode "en") En
            , fuzz string "returns English for a random string" <|
                \randomString ->
                    Expect.equal (getLnFromCode randomString) En
            ]
        , describe "hello"
            [ test "returns `Hallo` for German" <|
                \() ->
                    hello De |> Expect.equal "Hallo"
            , test "returns `Hello` for German" <|
                \() ->
                    hello De |> Expect.equal "Hallo"
            ]
        , describe "gooddaySalute"
            [ test "returns `Guten Tag <firstname> <last name>` for German" <|
                \() ->
                    gooddaySalute De "Tony" "Tiger"
                        |> Expect.equal "Guten Tag Tony Tiger"
            , test "returns `Good Day <firstname> <last name>` for English" <|
                \() ->
                    gooddaySalute En "Tony" "Tiger"
                        |> Expect.equal "Good Day Tony Tiger"
            ]
        , describe "tigersRoar"
            [ test "returns `Brüll!` for German" <|
                \() ->
                    tigersRoar De
                        |> Expect.equal "Brüll!"
            , test "returns `Roar!` for English" <|
                \() ->
                    tigersRoar En
                        |> Expect.equal "Roar!"
            ]
        ]
