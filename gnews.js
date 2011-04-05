var gnewsColors = {
  "h":"#6B90DA",
  "w":"#FFC300",
  "n":"#3C3CA4",
  "b":"#007300",
  "t":"#CC0000",
  "p":"#27559B",
  "e":"#8A60B3",
  "s":"#FF6600",
  "m":"#438988",
  "ir":"#00A65E",
  "po":"#BC1748",
}

var gnewsEditions = {
    "us" : {
        ned : "us",
        name : "United States",
        more : "More sources",
        topics : [
            {label: "Top Stories", value: "h"},
            {label: "World", value: "w"},
            {label: "U.S.", value: "n"},
            {label: "Business", value: "b"},            
            {label: "Science/Technology", value: "t"},
            {label: "Politics", value: "p"},
            {label: "Entertainment", value: "e"},
            {label: "Sports", value: "s"},
            {label: "Health", value: "m"},
            {label: "Spotlight", value: "ir"},
            {label: "Most Popular", value: "po"}
        ]
    },
    "uk" : {
        ned : "uk",
        name : "United Kingdom",
        more : "More sources",
        topics : [
            {label: "Top Stories", value: "h"},
            {label: "World", value: "w"},
            {label: "U.K.", value: "n"},
            {label: "Business", value: "b"},
            {label: "Science/Technology", value: "t"},
            {label: "Politics", value: "p"},
            {label: "Entertainment", value: "e"},
            {label: "Sports", value: "s"},
            {label: "Health", value: "m"},
            {label: "Spotlight", value: "ir"},
            {label: "Most Popular", value: "po"}
        ]
    },
    "de" : {
        ned : "de",
        name : "Deutschland",
        more : "Mehr Quellen",
        topics : [
            {label: "Schlagzeilen", value: "h"},
            {label: "International", value: "w"},
            {label: "Deutschland", value: "n"},
            {label: "Wirtschaft", value: "b"},            
            {label: "Wissen/Technik", value: "t"},
            {label: "Politik", value: "p"},
            {label: "Unterhaltung", value: "e"},
            {label: "Sport", value: "s"},
            {label: "Gesundheit", value: "m"},
            {label: "Panorama", value: "ir"},
            {label: "Meistgeklickt", value: "po"},
        ]
    },
    "fr" : {
        ned : "fr",
        name : "France",
        more : "Plus de sources",
        topics : [
            {label: "À la une", value: "h"},
            {label: "International", value: "w"},
            {label: "France", value: "n"},
            {label: "Économie", value: "b"},
            {label: "Science/Tech  ", value: "t"},
            {label: "Politique", value: "p"},
            {label: "Divertissements", value: "e"},
            {label: "Sports", value: "s"},
            {label: "Santé", value: "m"},
            {label: "À lire", value: "ir"},
            {label: "Articles les plus lus", value: "po"},
        ]
    },
    "es" : {
        ned : "es",
        name : "España",
        more : "Más fuentes",
        topics : [
            {label: "Noticias destacadas", value: "h"},
            {label: "International", value: "w"},
            {label: "España", value: "n"},
            {label: "Economía", value: "b"},
            {label: "Ciencia y Tecnología", value: "t"},
            {label: "Política", value: "p"},
            {label: "Espectáculos", value: "e"},
            {label: "Deportes", value: "s"},
            {label: "Salud", value: "m"},
            {label: "Destacados", value: "ir"},
            {label: "Más popular", value: "po"},
        ]
    },
    "it" : {
        ned : "it",
        name : "Italia",
        more : "Altre fonti",
        topics : [
            {label: "Prima pagina", value: "h"},
            {label: "Esteri", value: "w"},
            {label: "Italia", value: "n"},
            {label: "Economia", value: "b"},
            {label: "Scienza e tecnologia", value: "t"},
            {label: "Politica", value: "p"},
            {label: "Spettacoli", value: "e"},
            {label: "Sport", value: "s"},
            {label: "Salute", value: "m"},
            {label: "In evidenza", value: "ir"},
            {label: "Più letti", value: "po"},
        ]
    }
}

function getEditionList() {
    var result = [];
    for(e in gnewsEditions) {
       result.push({title: gnewsEditions[e].name, ned: gnewsEditions[e].ned});
    }
    return result;
[
           {title:'United States', ned:'us'},
           {title:'United Kingdom', ned:'uk'},
           {title:'Germany', ned:'de'},
           {title:'France', ned:'fr'},
           {title:'Spain', ned:'es'},
           {title:'Italy', ned:'it'},
           {title:'Russia', ned:'ru'},
           {title:'Australia', ned:'au'}
        ]
        
}

function getEditionTopics(edition) {
   return gnewsEditions[edition].topics;
}

function getTopicColor(topic) {
   return gnewsColors[topic];
}

function getTopicLabel(edition, topic) {
  for(t in gnewsEditions[edition].topics) {
     if(gnewsEditions[edition].topics[t].value == topic) {
         return gnewsEditions[edition].topics[t].label;
     }
  }
  return 'News';  
}