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