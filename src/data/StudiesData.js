const StudiesData = [
    {
        id: 1,
        name: 'Tieto- ja viestintätekniikan perustehtävät',
        subtopics: [
            {
                id: 2,
                name: 'TVP0 - Orientaatio',
                tasks: [],
            },
            {
                id: 3,
                name: 'TVP1 - Tietoteknisen ympäristön käyttö',
                tasks: [
                    { id: 4, name: '#646 OneDrive kansiorakenne TiVi', done: true },
                    { id: 5, name: '#581 Tietokoneen rakenteeseen tutustuminen TiVi', done: true },
                    { id: 6, name: '#648 Tietokoneen rakenneosat TiVi', done: true },
                    { id: 7, name: '#597 Windowsin versio ja tuoteavain TiVi', done: true },
                    { id: 8, name: '#673 VPN FortiClient', done: true },
                    { id: 9, name: '#755 Virtuaalityöaseman asennus (Hyper-V) TiVi', done: true },
                    { id: 10, name: '#583 Windowsin peruskäyttö TiVi', done: true },
                    { id: 11, name: '#582 Työaseman perusasennus (tehdään labrassa - vapaaehtoinen) TiVi', done: true },
                ],
            },
            {
                id: 12,
                name: 'TVP2 - Sovellusohjelmien peruskäyttö ja SOME- markkinointi',
                tasks: [
                    { id: 13, name: '#630 Sovellusohjelmien peruskäyttö', done: true },
                    { id: 14, name: '#561 SOME - markkinoinnin tehostajana (Google Digital Garage) TiVi', done: true },
                    { id: 15, name: '#483 SOME - tehokas käyttö TiVi', done: false },
                ],
            },
            {
                id: 16,
                name: 'TVP3- Verkkoperusteet',
                tasks: [
                    { id: 17, name: '#588 Cisco Packet Tracer asennus ja peruskäyttö TiVi', done: false },
                    { id: 18, name: '#589 Verkko - Kotiverkon tiedot ja konfigurointi Ciscon Packet Tracerilla TiVi', done: false },
                    { id: 19, name: '#605 Verkko - Kotiverkon tiedot ja konfigurointi käytännössä (labra - ei koske verkossa opiskelevia) TiVi', done: false },
                    { id: 20, name: '#647 Tietoturvan perusteet TiVi', done: false },
                    { id: 21, name: '#697 Kotiverkon yhteyden muodostuminen', done: false },
                    {
                        id: 22,
                        name: '#790 TVP3 - Käyttöjärjestelmän asennus ja kotiverkon konfigurointi (labra - ei koske verkossa opiskelevia) TiVi',
                        done: false,
                    },
                    { id: 23, name: '#594 Omat kotisivut (HTML + CSS) TiVi', done: false },
                    { id: 24, name: '#698 IP- osoitteet - Cisco Packet Tracer - harjoitus', done: false },
                    { id: 25, name: '#699 IP- osoitteet - Cisco Packet Tracer - palvelimet ja DHCP - harjoitus', done: false },
                ],
            },
            {
                id: 26,
                name: 'TVP4– Asiakaspalvelu',
                tasks: [
                    { id: 27, name: '#527 Asiakaspalvelu - Oman alan yrityksiin tutustuminen', done: false },
                    { id: 28, name: '#511 Asiakaspalvelu- Asiakaspalautteen toteuttaminen', done: false },
                    { id: 29, name: '#532 Asiakaspalvelu - Tuotetietous', done: false },
                ],
            },
            {
                id: 30,
                name: 'TVP5 - TVP:n teknisen- ja asiakaspalveluosuuden - NÄYTTÖ',
                tasks: [{ id: 31, name: '#651 TVP Teknisen ja asiakaspalvelu osuuden NÄYTTÖ', done: false }],
            },
        ],
    },
];

export default StudiesData;
