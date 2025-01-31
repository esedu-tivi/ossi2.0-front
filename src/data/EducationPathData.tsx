export const mandatoryModules = [
  {
    id: 1,
    title: "Tieto- ja viestintätekniikan perusosaaminen",
    points: 25,
    completed: true,
    parts: [
      { id: 101, 
        title: "Tieto- ja viestintätekniikan työtehtävissä toimiminen", 
        points: 10, 
        completed: true,
        osaamiset: [
          "Opiskelija toimii tieto- ja viestintätekniikan työtehtävissä"
        ]
      },
      { id: 102, 
        title: "Tiedonhaku ja ongelmien ratkaiseminen", 
        points: 10, 
        completed: true ,
        osaamiset: [
          "Opiskelija tekee tiedonhakua ja ratkaisee tieto- ja viestintätekniikan ongelmia"
        ]
      },
      { id: 103, 
        title: "Tietoteknisen ympäristön käyttö", 
        points: 5, 
        completed: true,
        osaamiset: [
          "Opiskelija käyttää tietoteknistä ympäristöä"
        ]
      },
    ],
  },
  {
    id: 2,
    title: "Ohjelmointi",
    points: 45,
    completed: true,
    parts: [
      { id: 104, 
        title: "Ohjelmistokehitysympäristön käyttö", 
        points: 10, 
        completed: true,
        osaamiset: [
          "Opiskelija käyttää ohjelmistokehitysympäristöä"
        ]
      },
      { id: 105, title: "Ohjelmointityö", 
        points: 15, 
        completed: true,
        osaamiset: [
          "Opiskelija ohjelmoi"
        ]
      },
      { id: 106, 
        title: "Ohjelmistokehitystiimin jäsenenä toimiminen", 
        points: 20, 
        completed: true,
        osaamiset: [
          "Opiskelija toimii ohjelmistokehitystiimin jäsenenä"
        ]
      },
    ],
  },
  {
    id: 3,
    title: "Ohjelmistokehittäjänä toimiminen",
    points: 45,
    completed: false,
    parts: [
      { id: 107, 
        title: "Asiakkaan kanssa kommunikointi", 
        points: 5, 
        completed: true,
        osaamiset: [
          "Opiskelija kommunikoi asiakkaan kanssa"
        ]
      },
      { id: 108, 
        title: "Ohjelmiston toteutuksen suunnittelu", 
        points: 15, 
        completed: true,
        osaamiset: [
          "Opiskelija suunnittelee ohjelmiston toteutuksen"
        ]
      },
      { id: 109, 
        title: "Ohjelmiston toimintalogiikan ja tietovarastoyhteyksien kehittäminen", 
        points: 20, 
        completed: false,
        osaamiset: [
          "Opiskelija kehittää ohjelmiston toimintalogiikkaa ja tietovarastoyhteyksiä"
        ]
      },
      { id: 110, 
        title: "Ohjelman versionti ja julkaiseminen", 
        points: 5, 
        completed: false,
        osaamiset: [
          "Opiskelija versioi ja julkaisee ohjelman"
        ]
      },
    ],
  },
];

export const choiceModules = [
  {
    id: 5,
    title: "Tietoverkkolaitteiden asennus",
    points: 10,
    completed: true,
    parts: [
      { id: 501, 
        title: "Pilvipalveluiden perusteet", 
        points: 5, 
        completed: true,
        osaamiset: [
          "Opiskelija valmistautuu tietoverkkolaitteiden asennuksiin",
          "Opiskelija asentaa tietoverkkolaitteita"
        ]
      },
      { id: 502, 
        title: "DevOps käytännössä", 
        points: 5, 
        completed: true,
        osaamiset: [
          "Opiskelija viimeistelee ja dokumentoi tietoverkkolaitteiden asennukset"
        ]
      },
    ],
  },
  {
    id: 6,
    title: "Kyberturvallisuuden ylläpitäminen",
    points: 10,
    completed: false,
    parts: [
      { id: 601, 
        title: "Perustietoturva", 
        points: 5, 
        completed: false, 
        osaamiset: [
          "Opiskelija käyttää kyberuhkien hallinta- ja suojautumiskeinoja"
        ]
      },
      { id: 602, 
        title: "Edistynyt tietoturva", 
        points: 5, 
        completed: false, 
        osaamiset: [
          "Opiskelija hallitsee kyberturvariskejä",
          "Opiskelija edistää kyberturvallisuusratkaisuja"
        ]
      },
    ],
  },
];

export const optionalModulesList = [
  {
    id: 7,
    title: "Elektroniikka-asennukset",
    points: 15,
    completed: false,
    parts: [
      { id: 701, 
        title: "Elektroniikka-asennusten perusteet", 
        points: 5, 
        completed: false,
        osaamiset: [
          "Elektroniikka-asennustyön laadun varmistaminen ja dokumentointi"
        ]
      },
      { id: 702, 
        title: "Elektroniikka-asennukset käytännössä", 
        points: 5, 
        completed: false,
        osaamiset: [
          "Elektroniikka-asennuksiin valmistautuminen",
          "Elektroniikka-asennusten tekeminen"
        ] 
      },
    ],
  },
  {
    id: 9,
    title: "Ilmastovastuullinen toiminta",
    points: 10,
    completed: false,
    parts: [
      { id: 801, 
        title: "Hiilijalanjäljen laskeminen", 
        points: 5, 
        completed: false,
        osaamiset: [
          "Ilmastonmuutoksen lähtökohtien selvittäminen",
          "Ilmastonmuutoksen vaikutusten ja ratkaisujen esittäminen"
        ]
      },
      { id: 802, 
        title: "Ilmastopäästöjen vähentäminen", 
        points: 5, 
        completed: false,
        osaamiset: [
          "Ilmastovastuullisen toiminnan vahvistaminen"
        ]
      },
    ],
  },
];