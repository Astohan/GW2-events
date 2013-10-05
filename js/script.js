var app = angular.module('gw2App', ['ngResource']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/world/:worldId', { controller: 'gw2Ctrl' })
});

app.controller('gw2Ctrl', function($scope, $http, $resource, $location, $route, $routeParams, $timeout) {
  $http.defaults.useXDomain = true;
  // So CORS works event without OPTIONS requests supported by API server
  delete $http.defaults.headers.common['X-Requested-With'];

  $scope.$on("$routeChangeSuccess", function($currentRoute, $previousRoute) {
    $scope.worldId = $routeParams.worldId;
  });

  Worlds = $resource('https://api.guildwars2.com/v1/world_names.json?lang=fr');
  Matches = $resource('https://api.guildwars2.com/v1/wvw/matches.json');
  MatchDetails = $resource('https://api.guildwars2.com/v1/wvw/match_details.json');
  Events = $resource('https://api.guildwars2.com/v1/events.json');

  var timer;
  $scope.interval = 15000;

  $scope.worlds = Worlds.query();
  $scope.redWorld = {};
  $scope.blueWorld = {};
  $scope.greenWorld = {};
  
  $scope.watchedEvents = [
    { id: "0464CB9E-1848-4AAA-BA31-4779A959DD71", name: "Griffe de Jormag", level: "80", locate: "Détroit des Gorges Glacées", area: "Bassin de Trembleterre" },
    { id: "568A30CF-8512-462F-9D67-647D69BEFAED", name: "Tequatl le Sans-Soleil", level: "65", locate: "Marais de Lumillule", area: "Côte Effilochée" },
    { id: "03BF176A-D59F-49CA-A311-39FC6F533F2F", name: "Le Destructeur", level: "50", locate: "Steppes de la Strie Flamboyante", area: "Basses Terres Calcinées" },
    { id: "31CEBA08-E44D-472F-81B0-7143D73797F5", name: "Béhémoth des Ombres", level: "15", locate: "Vallée de la Reine", area: "Marais d'Anathema"},
    { id: "33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4", name: "Elémentaire de Feu", level: "15", locate: "Province de Metrica", area: "Réacteur de Thaumanova"},
    { id: "C5972F64-B894-45B4-BC31-2DEEA6B7C033", name: "Grande Guivre", level: "15", locate: "Forêt de Caledon", area: "Marais de Wychmire"},
	{ id: "E6872A86-E434-4FC1-B803-89921FF0F6D6", name: "Modniir Ulgoth", level: "43", locate: "Hinterlands Harathis", area: "Gorge des Modniirs"},
	{ id: "F7D9D427-5E54-4F12-977A-9809B23FBA99", name: "Shaman de Svanir", level: "10", locate: "Contreforts du Voyageur", area: "Rivière Froidfrill"},
	{ id: "C876757A-EF3E-4FBE-A484-07FF790D9B05", name: "Mégadestructeur", level: "66", locate: "Mont Maelstrom", area: "Bile de Maelstrom"},
	{ id: "295E8D3B-8823-4960-A627-23E07575ED96", name: "Shaman de Feu", level: "60", locate: "Marais de Fer", area: "Terrebrûle"},
	{ id: "95CA969B-0CC6-4604-B166-DBCCE125864F", name: "Kommissar Draguerre", level: "50", locate: "Falaises de Hantedraguerre", area: "Failles de la Tribulation"},
	{ id: "242BD241-E360-48F1-A8D9-57180E146789", name: "Taidha Covington", level: "50", locate: "Côte de la Marée Sanglante", area: "Ile de la Mouette Rieuse"},
	{ id: "3070F2C0-46DD-498F-BBF6-695439B90CC5", name: "Reine Dévoreuse", level: "59", locate: "Marais de Fer", area: "Infestation"},
	{ id: "A0796EC5-191D-4389-9C09-E48829D1FDB2", name: "Oeil de Zhaitan", level: "75", locate: "Détroit de la Dévastation", area: "Catacombes de Zho'qafa"},
	{ id: "02DECBE6-A0BA-47CC-9256-A6D59881D92A", name: "Magicien Revenant", level: "80", locate: "Rivage Maudit", area: "Le Narthex"},
	{ id: "99254BA6-F5AE-4B07-91F1-61A9E7C51A51", name: "Grenth", level: "80", locate: "Rivage Maudit", area: "Cathédrale du Silence"},
	{ id: "A5B5C2AF-22B1-4619-884D-F231A0EE0877", name: "Melandru", level: "80", locate: "Rivage Maudit", area: "Cathédrale de Verdance"},
	{ id: "2555EFCB-2927-4589-AB61-1957D9CC70C8", name: "Balthazar", level: "75", locate: "Détroit de la Dévastation", area: "Cathédrale de la Glorieuse Victoire"},
	{ id: "6A6FD312-E75C-4ABF-8EA1-7AE31E469ABA", name: "Dwayna", level: "79", locate: "Saut de Malchor", area: "Cathédrale des Zéphyrs"},
	{ id: "0372874E-59B7-4A8F-B535-2CF57B8E67E4", name: "Lyssa", level: "78", locate: "Saut de Malchor", area: "Cathédrale de la Lueur Eternelle"},
	{ id: "B4E6588F-232C-4F68-9D58-8803D67E564D", name: "Chef Oursefol", level: "34", locate: "Champs de Ruine", area: "Gorge du Chasseur"},
	{ id: "E1CC6E63-EFFE-4986-A321-95C89EA58C07", name: "Reine Karka", level: "80", locate: "Crique de Sud-Soleil", area: "Sources de verre-océan"},
	{ id: "F479B4CF-2E11-457A-B279-90822511B53B", name: "Reine Karka", level: "80", locate: "Crique de Sud-Soleil", area: "Sources de verre-océan"},
	{ id: "5282B66A-126F-4DA4-8E9D-0D9802227B6D", name: "Reine Karka", level: "80", locate: "Crique de Sud-Soleil", area: "Sources de verre-océan"},
	{ id: "4CF7AA6E-4D84-48A6-A3D1-A91B94CCAD56", name: "Reine Karka", level: "80", locate: "Crique de Sud-Soleil", area: "Sources de verre-océan"},
    { id: "9AA133DC-F630-4A0E-BB5D-EE34A2B306C2", name: "Golem Marque II", level: "68", locate: "Mont Maelstrom", area: "Plaines de Whitland"}
  ]

  $scope.watchedPreEvents = [
	{ id: "36E81760-7D92-458E-AA22-7CDE94112B8F", name: "Mégadestructeur", pre: ": Défendre les Asuras"},
	{ id: "8E064416-64B5-4749-B9E2-31971AB41783", name: "Destructeur",pre: "1/2: Escorter l'escouade de sentinelles"},
	{ id: "580A44EE-BAED-429A-B8BE-907A18E36189", name: "Destructeur",pre: "2/2: Récupérez les morceaux de l'arme de siège"},
	{ id: "9FE13C55-8325-4A73-8C06-FD1E37836393", name: "Kommissar Draguerre",pre: "1/2: Aider l'ingénieur Radley à retourner à la Citadelle de granite"},
	{ id: "07536BE1-9796-4D40-A203-29B4FE270E64", name: "Kommissar Draguerre",pre: "2/2: Briser le siège des Draguerres au Refuge du mantelet"},
	{ id: "BFD87D5B-6419-4637-AFC5-35357932AD2C", name: "Griffe de Jormag",pre: ": Détruire le dernier cristal du dragon"},
	{ id: "CFBC4A8C-2917-478A-9063-1A8B43CC8C38", name: "Béhémoth des Ombres",pre: "1/2: Détruire les portails de Boisecœur"},
	{ id: "36330140-7A61-4708-99EB-010B10420E39", name: "Béhémoth des Ombres",pre: "2/2: Détruire les portails du marais"},
	{ id: "D5F31E0B-E0E3-42E3-87EC-337B3037F437", name: "Shaman de Svanir",pre: "1/3: Protéger Brogun l'érudit"},
	{ id: "27BD834D-BB77-4436-9138-143D8646EC36", name: "Shaman de Svanir",pre: "2/3: Détruire le Totem du dragon"},
	{ id: "374FC8CB-7AB7-4381-AC71-14BFB30D3019", name: "Shaman de Svanir",pre: "3/3: Détruire les portails corrompus"},
	{ id: "6B897FF9-4BA8-4EBD-9CEC-7DCFDA5361D8", name: "Elémentaire de Feu",pre: "1/3: Détruire les matériaux chaotiques"},
	{ id: "5E4E9CD9-DD7C-49DB-8392-C99E1EF4E7DF", name: "Elémentaire de Feu",pre: "2/3: Escorter le golem P.U.R.E. 5000"},
	{ id: "2C833C11-5CD5-4D96-A4CE-A74C04C9A278", name: "Elémentaire de Feu",pre: "3/3: Protéger le golem P.U.R.E. 5000"},
	{ id: "D9F1CF48-B1CB-49F5-BFAF-4CEC5E68C9CF", name: "Chef Oursefol",pre: "1/2: Assaut contre le Kraal d'Oursefol"},
	{ id: "4B478454-8CD2-4B44-808C-A35918FA86AA", name: "Chef Oursefol",pre: "2/2: Détruire le Kraal d'Oursefol"},
	{ id: "B6B7EE2A-AD6E-451B-9FE5-D5B0AD125BB2", name: "Taidha Covington",pre: "1/3: Eliminer les canons de la tour défensive nord"},
	{ id: "189E7ABE-1413-4F47-858E-4612D40BF711", name: "Taidha Covington",pre: "2/3: Prendre la tour défensive sud"},
	{ id: "0E0801AF-28CF-4FF7-8064-BB2F4A816D23", name: "Taidha Covington",pre: "3/3: Protéger le gallion et l'aider à détruire la porte"},
	{ id: "613A7660-8F3A-4897-8FAC-8747C12E42F8", name: "Grande Guivre",pre: "1/3: Protéger Gamarien"},
	{ id: "1DCFE4AA-A2BD-44AC-8655-BBD508C505D1", name: "Grande Guivre",pre: "2/3: Tuer le ver corrompu géant"},
	{ id: "61BA7299-6213-4569-948B-864100F35E16", name: "Grande Guivre",pre: "3/3: Détruire les avatars de la corruption"},
	{ id: "DDC0A526-A239-4791-8984-E7396525B648", name: "Modniir Ulgoth",pre: "1/3: Lancer l'assaut sur Kingsgate"},
	{ id: "A3101CDC-A4A0-4726-85C0-147EF8463A50", name: "Modniir Ulgoth",pre: "2/3: Tuer le conseil de guerre centaure"},
	{ id: "DA465AE1-4D89-4972-AD66-A9BE3C5A1823", name: "Modniir Ulgoth",pre: "3/3: Empêcher les envahisseurs modniirs de reprendre Kingsgate"},
	{ id: "669342AC-AEA2-44EE-A5A3-9BB6063A3FA7", name: "Reine Dévoreuse",pre: "1/2: Libérer les sentinelles des cristaux stigmatisés"},
	{ id: "F3B43068-9E16-4E7D-879F-B7914A6E5597", name: "Reine Dévoreuse",pre: "2/2: Détruire les nids de dévoreur stigmatisés"},
	{ id: "A0E5E563-2701-4D4E-8163-A89FEA02EC38", name: "Oeil de Zhaitan",pre: "1/3: Détruire le canon anti-aérien revenant"},
	{ id: "6FA8BE3F-9F6C-4790-BFBC-380B26FDB06C", name: "Oeil de Zhaitan",pre: "2/3: Escorter le maître de guerre Leddron"},
	{ id: "42884028-C274-4DFA-A493-E750B8E1B353", name: "Oeil de Zhaitan",pre: "3/3: Défendre les membres de l'équipe du Pacte"},
	{ id: "E87A021D-4E7C-4A50-BEDB-6F5A54C90A9A", name: "Magicien Revenant",pre: "1/2: Aider le Pacte à conquérir la Promenade des dieux"},
	{ id: "B1B94EFD-4F67-4716-97C2-880CD16F1297", name: "Magicien Revenant",pre: "2/2: Aider le Pacte à capturer le hall de la Promenade des dieux"},
	{ id: "F531683F-FC09-467F-9661-6741E8382E24", name: "Dwayna",pre: "1/3: Escorter l'Historien Vermoth à l'Autel des tempêtes"},
	{ id: "7EF31D63-DB2A-4FEB-A6C6-478F382BFBCB", name: "Dwayna",pre: "2/3: Vaincre la prêtresse revenante de Dwayna"},
	{ id: "526732A0-E7F2-4E7E-84C9-7CDED1962000", name: "Dwayna",pre: "3/3: Conduire Malchor à l'Autel des tempêtes"},
	{ id: "D0ECDACE-41F8-46BD-BB17-8762EF29868C", name: "Balthazar",pre: "1/2: Aider le Pacte à atteindre l'Autel de la trahison"},
	{ id: "7B7D6D27-67A0-44EF-85EA-7460FFA621A1", name: "Balthazar",pre: "2/2: S'emparer de l'Autel de la trahison"},
	{ id: "C8139970-BE46-419B-B026-485A14002D44", name: "Grenth",pre: "1/2: Aider le gardien Jonez Morteruey à atteindre la Cathédrale du silence"},
	{ id: "E16113B1-CE68-45BB-9C24-91523A663BCB", name: "Grenth",pre: "2/2: Eliminer le prêtre revenant champion de Grenth"},
	{ id: "351F7480-2B1C-4846-B03B-ED1B8556F3D7", name: "Melandru",pre: "1/2: Escorter les forces du Pacte jusqu'au Temple de Melandru"},
	{ id: "7E24F244-52AF-49D8-A1D7-8A1EE18265E0", name: "Melandru",pre: "2/2: Tuez le prêtre de Melandru revenant"},
	{ id: "3ED4FEB4-A976-4597-94E8-8BFD9053522F", name: "Golem Marque II",pre: ": Désactiver les conteneurs toxiques"}
  ]
  
    $scope.watchedChampions = [
    { id: "024E2290-790F-4F0C-B5FC-2D59DF263068", name: "Shaman de la Légion", level: "05", locate: "Plaines d'Ashford", area: "Camp fortifié de Facula" },
	{ id: "BCE805EB-0602-4E76-B6ED-6A427531DB94", name: "Champion de Badazar", level: "07", locate: "Plaines d'Ashford", area: "Gorge d'Agnos" },
    { id: "7175145A-3997-4DB0-A751-4F5E7CFE338C", name: "Effigie Charr", level: "08", locate: "Plaines d'Ashford", area: "Triomphe du Charr" },
    { id: "DE3E60D1-9628-4522-B5EB-2200F2B54CD4", name: "Grazden le Protecteur", level: "10", locate: "Plaines d'Ashford", area: "Lac Adoréa" },
    { id: "B4EBE5D6-17A0-4FFF-8959-BABB19D18E4A", name: "Ivor Vérifrappe", level: "10", locate: "Plaines d'Ashford", area: "Domaine de l'ancien Duc"},
    { id: "DD366291-4801-4FC2-A33A-010CC339838F", name: "Armsman Pitney", level: "10", locate: "Plaines d'Ashford", area: "Domaine de l'ancien Duc"},
    { id: "357F4F6F-586F-4DA9-B969-9A798D55A36F", name: "Farrah Cappo", level: "10", locate: "Plaines d'Ashford", area: "Domaine de l'ancien Duc"},
	{ id: "0EEABCEC-36BE-44DE-8AED-9DE111F8EBF9", name: "Horace", level: "10", locate: "Plaines d'Ashford", area: "Domaine de l'ancien Duc"},
	{ id: "723A755C-EFAC-48D8-9084-0BB9D228FF60", name: "Maître de siège Lormar", level: "13", locate: "Plaines d'Ashford", area: "Ruines de la Cité d'Ascalon"},
	{ id: "25BAA79B-9BDC-48A4-A85E-56AE626ACC4E", name: "Ogre de Rochepierre", level: "15", locate: "Plaines d'Ashford", area: "Forêt de Cadem"},
	{ id: "B03041CB-C0D9-4A5C-8FDA-85C653E0AF13", name: "Géant de Nageling", level: "18", locate: "Plateau de Diessa", area: "Ville de Nageling"},
    { id: "DC7C36C0-3D64-4121-A3D1-D224476CC753", name: "Instigateur séparatiste", level: "22", locate: "Plateau de Diessa", area: "Le Mur fendu"},
	{ id: "20EE4894-10F1-4783-B956-D13F74DC000C", name: "Guivre des Plaines", level: "16", locate: "Plateau de Diessa", area: "Plaines d'Halrunting"},
	{ id: "6BD7C8B0-2605-4819-9AE6-EF2849098090", name: "Rhendak le Fou", level: "28", locate: "Plateau de Diessa", area: "Tombes du Temple de la Flamme"},
	{ id: "12E65567-30DC-4C63-B0FF-7664807478F9", name: "Chef séparatiste", level: "30", locate: "Champs de Ruine", area: "Couronne du guerrier"},
	{ id: "C758556E-A14C-461D-B113-1061E9A2077E", name: "Chef Otyugh", level: "34", locate: "Champs de Ruine", area: "Goulet de Wildlin"},
    { id: "22526D7D-2EAC-4912-93BD-7C4DF7346499", name: "Guêpes géantes", level: "35", locate: "Champs de Ruine", area: "Couronne du guerrier"},
	{ id: "83C5F860-A7B3-4007-9A46-32C06737F796", name: "Dévoreur stigmatisé géant", level: "36", locate: "Champs de Ruine", area: "Bois du tireur d'élite"},
	{ id: "12E64767-C02B-440A-9F51-D394B81E27C8", name: "Elémentaire de terre stigmatisé", level: "40", locate: "Champs de Ruine", area: "Domaine des dragons putrides"},
	{ id: "429D9DB9-2DE9-4AC8-992E-49D8D010663C", name: "Guivre géante", level: "50", locate: "Steppes de la strie flamboyante", area: "Terra Combusta"},
	{ id: "9377A332-2897-4D3A-98FD-6FF61972F853", name: "Victurus", level: "58", locate: "Marais de Fer", area: "Bois des larmes de cristal"},
	{ id: "190CCFAD-81AD-4907-BD45-1BF77545412C", name: "Seigneur arachnide", level: "63", locate: "Montée de Flambecoeur", area: "Contrées sauvages de l'Apostat"},
	{ id: "57DF4E00-30F0-4049-AB28-60D13701E727", name: "Reine araignée", level: "67", locate: "Montée de Flambecoeur", area: "Canyons torrides"},
	{ id: "87695E71-9D9A-496C-BBFA-FA6E62F16B39", name: "Elémentaire de lave", level: "70", locate: "Montée de Flambecoeur", area: "Le Feu de Bael"},
	{ id: "BC997F15-4C05-4D95-A14F-9B7C4CF41B4E", name: "Lieutenant bandit", level: "05", locate: "Vallée de la Reine", area: "Cavernes Hante-brigands"},
	{ id: "04084490-0117-4D56-8D67-C4FFFE933C0C", name: "Coeur de Chêne", level: "10", locate: "Vallée de la Reine", area: "Crête de Phinney"},
	{ id: "3C3915FB-E2E4-4794-A700-E3B5FCFE0404", name: "Reine des guêpes", level: "09", locate: "Vallée de la Reine", area: "Forêt de la Reine"},
	{ id: "69D031A8-7AD2-4419-B564-48457841A57C", name: "Sanglier Géant", level: "10", locate: "Vallée de la Reine", area: "Forêt de la Reine"},
	{ id: "D17D47E9-0A87-4189-B02A-54E23AA91A82", name: "Troll des Cavernes", level: "11", locate: "Vallée de la Reine", area: "Forêt de la Reine"},
	{ id: "D20268C3-301F-4DD5-930D-2417B356EE05", name: "Harpie destructrice", level: "21", locate: "Collines de Kesse", area: "Zone d'exécution de l'Empire"},
	{ id: "A4D88FE1-92E9-4EBF-80EE-7C572AF33096", name: "Sorcière sanglante", level: "23", locate: "Collines de Kesse", area: "Lac de Viathan"},
	{ id: "C45CDDE1-2058-4D83-A0DF-94A9580B1F70", name: "Contremaître bandit", level: "24", locate: "Collines de Kesse", area: "Côte de Viath"},
	{ id: "C896D455-7096-4EDC-8C2C-5416F7341EF7", name: "Seigneur harathi", level: "25", locate: "Collines de Kesse", area: "Colline de Festimère"},
	{ id: "41F5FA4E-D96E-48B4-A6F4-9A979EA27BAB", name: "Pillard draguerre", level: "27", locate: "Champs de Gendarran", area: "Front de Flèchefroide"},
	{ id: "C7C3342E-88B3-4325-A5B9-E3D44C778835", name: "Kol Cognecrâne", level: "42", locate: "Hinterlands Harathis", area: "Ourobore caché"},
	{ id: "C640BADC-0E9F-4069-9E0B-7AC041236948", name: "Seigneur Modniir", level: "37", locate: "Hinterlands Harathis", area: "Roche du tonnerre"},
	{ id: "875A1032-1B75-4C29-88C4-4182221BDC02", name: "Requin des profondeurs", level: "46", locate: "Côte de la marée sanglante", area: "Détroit des lamentations"},
	{ id: "48D779DF-4C31-4F19-9343-6CF42144463C", name: "Limon sanglant", level: "52", locate: "Côte de la marée sanglante", area: "Tête de taupe"},
	{ id: "B39ECC67-13DD-4E0B-A7E1-22824F4EB4B4", name: "Abomination orrienne", level: "55", locate: "Côte de la marée sanglante", area: "Castavall inondé"},
	{ id: "07D38E34-5D77-429F-BE80-503EFAE889CB", name: "Monstruosité revenante", level: "05", locate: "Forêt de Caledon", area: "Spirale de Morgan"},
	{ id: "3ACCC78D-C2DE-4F3A-B76A-36942B4F9A23", name: "Sorcière krait transformée", level: "10", locate: "Forêt de Caledon", area: "Baie de Ventry"},
	{ id: "D1E6AE39-B1A8-4DBC-A1CF-9D58A881D18C", name: "Neoss krait", level: "13", locate: "Forêt de Caledon", area: "Baie de Quetzal"},
	{ id: "EF0DFFE2-E111-40B1-B8B1-01BF4EE3E484", name: "Troll de jungle", level: "15", locate: "Forêt de Caledon", area: "Marais de Wychmire"},
	{ id: "2DA2D20A-D1BD-494F-80C3-E2B4B1885F85", name: "Limon géant", level: "08", locate: "Province de Metrica", area: "Contrées sauvages d'Akk"},
	{ id: "4DE53AF3-40A6-4D9F-8F2F-21A1C374C0D9", name: "Golem défaillant", level: "08", locate: "Terres sauvages de Brisban", area: "Vallée de Venlin"},
	{ id: "A228A168-7BC8-473C-9AF3-E436A9281BD9", name: "Sinistre Triade", level: "23", locate: "Terres sauvages de Brisban", area: "Terre du Vandale"},
	{ id: "F0A97C36-3A3F-4334-935D-02389DF98629", name: "Prêtresse enragée", level: "25", locate: "Terres sauvages de Brisban", area: "Cascade de Gotala"},
	{ id: "BF746B54-7FF5-4617-8B6B-E3DA6CEF8410", name: "Démagogue", level: "26", locate: "Terres sauvages de Brisban", area: "Vestiges d'Aurora"},
	{ id: "B3B901E3-6EEE-4102-8009-2D5EDE790A68", name: "Requin revenant", level: "56", locate: "Marais de Lumillule", area: "Goulet de l'Océan"},
	{ id: "A2BB0245-2624-41DC-A79E-4D9D7B35CA11", name: "Colosse revenant", level: "63", locate: "Marais de Lumillule", area: "Pénitence d'Aleem"},
	{ id: "FF038047-C283-461E-ABF1-0B37B036B7B1", name: "Troll massif", level: "63", locate: "Marais de Lumillule", area: "Marécage de Tonnetroll"},
	{ id: "598CF3BD-0DF4-4FC7-97EA-AB4515497F5E", name: "Vadrouilleur skelk", level: "64", locate: "Mont Maelstrom", area: "Replatdesuie"},
	{ id: "8C438EAB-A80C-442A-B1B9-126D4718D7F0", name: "Peluche", level: "68", locate: "Mont Maelstrom", area: "Fonds benthiques de Kelp"},
	{ id: "DE252A2B-E6FC-443E-8730-D7D932248E28", name: "Meneuse de côterie", level: "68", locate: "Mont Maelstrom", area: "Fonds benthiques de Kelp"},
	{ id: "ED8ADFBF-6D6A-4B98-BD49-741D39A04871", name: "Commandant de la Bobine de réactance", level: "70", locate: "Mont Maelstrom", area: "Bobine de réactance infinie"},
	{ id: "B1D8F9D8-623B-4D47-91A6-9288E417C0A2", name: "Maître-Loup corrompu", level: "08", locate: "Contreforts du voyageur", area: "Steppes glacées"},
	{ id: "3E00E6FC-636E-4E23-B330-0B69B4367BD2", name: "Chef corrompu de Svanir", level: "15", locate: "Contreforts du voyageur", area: "Dome de Svanir"},
	{ id: "7792C374-0D45-4124-ABCB-FC5743FA2445", name: "Goliath couvegivre", level: "16", locate: "Congères d'Antreneige", area: "Vallée de Tromigar"},
	{ id: "9E0B3498-554D-4257-BA4D-91A10D617E59", name: "Kodan corrompu", level: "17", locate: "Congères d'Antreneige", area: "Montée du Dragon"},
	{ id: "D1AD390A-274F-4F3C-A79A-F49C1399B5B4", name: "Chef Modniir", level: "25", locate: "Congères d'Antreneige", area: "Hauteurs de Sabotnoir"},
	{ id: "EC0F246B-E2BF-48EC-A26B-E4030854C970", name: "Seigneur Ignius l'Eternel", level: "38", locate: "Passage de Lornar", area: "Passage du Gibier"},
	{ id: "09F07202-CCC7-4909-A139-B82BC4312DF8", name: "Ancienne créature", level: "31", locate: "Passage de Lornar", area: "Chutes de la Porte de Givre"},
	{ id: "DCF5831A-5F7A-4D75-8247-306AB5F77C8C", name: "Commandant à vapeur", level: "38", locate: "Passage de Lornar", area: "Lac de la Complainte"},
	{ id: "6C08ED32-6FCA-45A0-BBE8-49B93E1D11B3", name: "Abomination Jotun", level: "45", locate: "Falaises de Hantedraguerre", area: "Chemin des esprits de Theign"},
	{ id: "05B8E566-04B4-4C25-91DE-FCDFB0AE8D84", name: "Champion écorcheur", level: "56", locate: "Chutes de la Canopée", area: "Rapides de Gyre"},
	{ id: "EDF63CAD-4C83-4666-9469-B630F2C3149B", name: "Sorcière krait", level: "60", locate: "Chutes de la Canopée", area: "Lac Nonmoa"},	
	{ id: "C183FBDE-2F05-43C0-A7AE-BB77C60DCB27", name: "Mégalodon revenant", level: "72", locate: "Détroit de la Dévastation", area: "Baie de Terzetto"},
	{ id: "75119394-CA93-4E6A-8882-3DB27AA9B691", name: "Archimage revenant", level: "74", locate: "Détroit de la Dévastation", area: "Plage de l'Elysée"},
	{ id: "D35D7F3B-0A9B-41C6-BD87-7D7A0953F789", name: "Géant revenant", level: "75", locate: "Détroit de la Dévastation", area: "Cathédrale de la glorieuse victoire"},
	{ id: "4A53494F-DB9C-4BE9-8060-32DF0D3B4452", name: "Dresseur hylek mort-vivant", level: "78", locate: "Saut de Malchor", area: "Baie du Miroir"},
	{ id: "E54D171F-65A2-4E8C-9E7F-0F8C2B23588C", name: "Chevalier revenant", level: "79", locate: "Saut de Malchor", area: "Plaines de Karst"},
	{ id: "8C3B05E6-E9E7-4DD5-AD31-CDC52C54204F", name: "Géant revenant", level: "78", locate: "Saut de Malchor", area: "Arche corrompue"},
	{ id: "E1E44587-D51C-43BE-A34D-7615C8EE0E84", name: "Adorateur de Dwayna", level: "79", locate: "Saut de Malchor", area: "Plaines de Karst"},
	{ id: "091F215C-74AD-476E-A8E0-8478D0EA142A", name: "Roi limon", level: "80", locate: "Rivage Maudit", area: "Débris du pleutre"},
	{ id: "9217F918-4770-4597-818D-286F2DEBE923", name: "Mégalodon revenant", level: "80", locate: "Rivage Maudit", area: "Mer de Mausolus"},
	{ id: "4CEA2663-1280-4F2A-82AB-4157734CBC40", name: "Capitaine barbe-putride", level: "80", locate: "Rivage Maudit", area: "Reliques de Desmina"},
	{ id: "3B4F83B4-41A1-4A5E-97A6-1247C00D20E1", name: "Champion des gladiateurs", level: "80", locate: "Rivage Maudit", area: "Champs d'or"},
	{ id: "2BC86A2C-3EB9-4A33-BE34-83E525E57A1A", name: "Abomination revenante", level: "80", locate: "Rivage Maudit", area: "Champs d'or / Passage de la poursuite"},
	{ id: "2B328A6F-7F7F-45D8-8F87-43EC045E1B6F", name: "Génitrice revenante", level: "80", locate: "Rivage Maudit", area: "Rivage de Gladiver"},
	{ id: "B95E94CE-E9B4-4351-AD59-4B18F7D7A5EA", name: "Sentinelle revenante", level: "80", locate: "Rivage Maudit", area: "Ile de Gladiver"},
	{ id: "23FEF923-907E-47D9-A62E-3BB1F96E248A", name: "Roi revenant", level: "80", locate: "Rivage Maudit", area: "Azabe Qabar"},
	{ id: "A0544306-1353-449A-815F-5FA11CE59EE3", name: "Quaggan couvegrivre", level: "74", locate: "Détroit des Gorges glacées", area: "Ascencion du Rétif"}
  ]
  
  var eventNotificationsEnabled = false;
  var championNotificationsEnabled = false;
  var eventsToNotify = [];

  var fetch = function() {
    Matches.get({}, function(data) {
      // Loop through the matches to find in wich one the selected world is participating
      for (var i = 0; i < data.wvw_matches.length; i++) {
        m = data.wvw_matches[i];
        if (m.red_world_id == $scope.worldId || m.blue_world_id == $scope.worldId || m.green_world_id == $scope.worldId) {
          // Found!
          $scope.matchId = m.wvw_match_id;

          // Moar details pliz
          MatchDetails.get({ match_id: $scope.matchId }, function(data) {
            $scope.matchDetails = data;
            $scope.redWorld.score = data.scores[0];
            $scope.blueWorld.score = data.scores[1];
            $scope.greenWorld.score = data.scores[2];
          });
          
          // Retrieve the name of the three worlds in this match
          for (var j = 0; j < $scope.worlds.length; j++) {
            w = $scope.worlds[j];
            if (m.red_world_id == w.id)   { $scope.redWorld.name = w.name; }
            if (m.blue_world_id == w.id)  { $scope.blueWorld.name = w.name; }
            if (m.green_world_id == w.id) { $scope.greenWorld.name = w.name; }
          }

          break;
        }
      }
    });

    // Get the new states for the watched events
    Events.get({ world_id: $scope.worldId }, function(data) {
      events = data.events;
      for (var i = 0; i < $scope.watchedEvents.length; i++){
        we = $scope.watchedEvents[i];
        we.state = "Inactive";
        for (var j = 0; j < events.length; j++) {
          e = events[j];
          if (e && e.event_id == we.id) {
            we.state = e.state;
            break;
          }
        }
      }
	  for (var i = 0; i < $scope.watchedPreEvents.length; i++){
        we = $scope.watchedPreEvents[i];
        we.state = "Inactive";
        for (var j = 0; j < events.length; j++) {
          e = events[j];
          if (e && e.event_id == we.id) {
            we.state = e.state;
            break;
          }
        }
      }
	  for (var i = 0; i < $scope.watchedChampions.length; i++){
        we = $scope.watchedChampions[i];
        we.state = "Inactive";
        for (var j = 0; j < events.length; j++) {
          e = events[j];
          if (e && e.event_id == we.id) {
            we.state = e.state;
            break;
          }
        }
      }
    });
  }
 
 // When a world is selected...
  $scope.$watch('worldId', function() {
    if (typeof $scope.worldId != 'undefined') {
      fetch();
      // Update the uri so the page for the selected world can be refreshed and bookmarked
      $location.path('/world/' + $scope.worldId);
    }
  });

  // Set the selected refresh time interval
  $scope.$watch('interval', setTimer);

  $scope.$watch('watchedEvents', function(newVal, oldVal) {
    for (var i = 0; i < oldVal.length; i++) {
      if (oldVal[i].state != 'Active' && newVal[i].state == 'Active') {
        notifyEvent(newVal[i]);
	  }
	  if (oldVal[i].state != 'Success' && newVal[i].state == 'Success') {
        notifyEventSuccess(newVal[i]);
      }
    }
  }, true);
  
  $scope.$watch('watchedPreEvents', function(newVal, oldVal) {
    for (var i = 0; i < oldVal.length; i++) {
      if (oldVal[i].state != 'Active' && newVal[i].state == 'Active') {
        notifyPreEvent(newVal[i]);
      }
	  if (oldVal[i].state != 'Fail' && newVal[i].state == 'Fail') {
        notifyPreEventFail(newVal[i]);
      }
    }
  }, true);

    $scope.$watch('watchedChampions', function(newVal, oldVal) {
    for (var i = 0; i < oldVal.length; i++) {
      if (oldVal[i].state != 'Active' && newVal[i].state == 'Active') {
        notifyChampion(newVal[i]);
	  }
	  if (oldVal[i].state != 'Success' && newVal[i].state == 'Success') {
        notifyChampionSuccess(newVal[i]);
      }
    }
  }, true);
  
  var setTimer = function() {
    $timeout.cancel(timer);
    if ($scope.interval != "0") {
      timer = $timeout(function() {
        fetch();
        setTimer();
      }, $scope.interval);
    }
  }

  $scope.desktopNotificationsCapable = function() {
    return (window.webkitNotifications) ? true : false;
  }

  $scope.toggleEventNotifications = function() {
    if (eventNotificationsEnabled == false || (window.webkitNotifications && webkitNotifications.checkPermission() != 0)) {
      webkitNotifications.requestPermission(function() { eventNotificationsEnabled = true; $scope.$apply(); });
    } else {
      eventNotificationsEnabled = false;
    }
  }

   $scope.toggleChampionNotifications = function() {
    if (championNotificationsEnabled == false || (window.webkitNotifications && webkitNotifications.checkPermission() != 0)) {
      webkitNotifications.requestPermission(function() { championNotificationsEnabled = true; $scope.$apply(); });
    } else {
      championNotificationsEnabled = false;
    }
  } 
  
  $scope.isEventNotificationsEnabled = function() {
    return eventNotificationsEnabled && window.webkitNotifications && webkitNotifications.checkPermission() == 0;
  }
  
    $scope.isChampionNotificationsEnabled = function() {
    return championNotificationsEnabled && window.webkitNotifications && webkitNotifications.checkPermission() == 0;
  }

  var notifyEvent = function(e) {
    if ($scope.isEventNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	  titre = time + ' ' + e.name + ' en cours !';
      text = 'Niveau ' + e.level + ' → ' + e.locate + ' [' + e.area +']';
      webkitNotifications.createNotification('images/boss.png', titre, text).show();
    }
  }

   var notifyEventSuccess = function(e) {
    if ($scope.isEventNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	   titre = time + ' ' + e.name + ' vaincu(e) !';
       text = e.name + ' est en cours d\'autopsie !';
      webkitNotifications.createNotification('images/success.png', titre, text).show();
    }
  }
  
  var notifyPreEvent = function(e) {
    if ($scope.isEventNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	  titre = time + ' ' + e.name + ' à venir !';
      text = 'Pré-event ' + e.pre;
      webkitNotifications.createNotification('images/pre-event.png', titre, text).show();
    }
  }

  var notifyPreEventFail = function(e) {
    if ($scope.isEventNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	   titre = time + ' ' + e.name + ' retardé(e) !';
      text = 'ECHEC du pre-event ' + e.pre;
      webkitNotifications.createNotification('images/fail.png', titre, text).show();
    }
  }
  
    var notifyChampion = function(e) {
    if ($scope.isChampionNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	  titre = time + ' ' + e.name + ' en cours !';
      text = 'Niveau ' + e.level + ' → ' + e.locate + ' [' + e.area +']';
      webkitNotifications.createNotification('images/champion.png', titre, text).show();
    }
  }
  
     var notifyChampionSuccess = function(e) {
    if ($scope.isChampionNotificationsEnabled()) {
	  time = moment().format('HH:mm:ss');
	   titre = time + ' ' + e.name + ' vaincu(e) !';
       text = e.name + ' n\'a pas eu le temps d\'écrire son testament !';
      webkitNotifications.createNotification('images/success.png', titre, text).show();
    }
  } 
  
  $scope.refresh = function() {
    fetch();
    setTimer(); // Reset the timer;
  }
});