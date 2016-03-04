//use func;
angular.module('starter.controllers', [])

.factory('Service', function($http){
	var items = [];
	var loginData = {};
	var chosedMarket = {};
	var chosedFlyer = {};
	var choosedProdut = {};
	var isLogged = false;
	var timerSleep = 200; /* dovrebbero essere ms però boh! */
	
	try {
		var starredObjects = JSON.parse(window.localStorage['starredObjects'] || '{}');
    } catch (e) {
        var starredObjects = {};
		window.localStorage['starredObjects'] = JSON.stringify(starredObjects);
    } 
	
	var i = 0;
    for(var key in starredObjects){
        i++;
    }
	if(i == 0){
		starredObjects.products = [];
		starredObjects.flyers = [];
		starredObjects.markets = [];
	}
	
	return {
		GetTimerSleep: function(){
			return timerSleep;
		},
		SetLoginData: function(data){
			loginData = data;
			loginData.BASE_URL = "http://"+loginData.ip+":"+loginData.port+"/"+loginData.username+"/"+loginData.password+"/";
			console.log('Saved Login Data', loginData); // DEBUG
		},
		GetLoginData: function(){
			return loginData;
		},
		DropLoginData: function(){
			loginData = {};
			loginData.BASE_URL = "";
		},
		SetChosedMarket: function(data){
			console.log("data", data);
			chosedMarket = data; 
		},
		GetChosedMarket: function(){
			return chosedMarket;
		},
		SetChosedFlyer: function(data){
			chosedFlyer = data;
		},
		GetChosedFlyer: function(){
			return chosedFlyer;
		},
		SetChosedProduct: function(data){
			chosedProdut = data;
		},
		GetChosedProduct: function(){
			return chosedProdut;
		},
		AddStarredObject: function(item){ /* Attenzione funziona solo in navigazione, devono essere selezionati in precedenza volantino e supermercato */
			starredObjects.products.push(item);
			var found = false;
			angular.forEach(starredObjects.flyers, function(flyer){
			if(item['ID_volantino'] == flyer['ID_volantino'])
				found = true;
			});
			if(!found) /*Se non è già presente, aggiungi all'array.*/
				starredObjects.flyers.push(chosedFlyer);
			found = false;
			angular.forEach(starredObjects.markets, function(market){
			if(item['ID_supermercato'] == market['ID_supermercato'])
				found = true;
			});
			if(!found)
				starredObjects.markets.push(chosedMarket);
			window.localStorage['starredObjects'] = JSON.stringify(starredObjects);
		},
		RemoveStarredObject: function(item){ /* Attenzione funziona solo in navigazione, devono essere selezionati in precedenza volantino e supermercato */
			var index = starredObjects.products.indexOf(item);
			var moreProducts = false; /* Se falsa non si sono altri prodotti per un certo volantino e può essere rimosso da starredObjects.flyers */
			var moreFlyers = false;   /* Se falsa non si sono altri volantini per un certo supermecato e può essere rimosso da starredObjects.markets */
			starredObjects.products.splice(index, 1); /*Rimozione item*/

			angular.forEach(starredObjects.products, function(product){
			if(product['ID_volantino'] == item['ID_volantino']){ /* Se ID_volantino dell'item che vogliamo rimuore è ANCORA presente nella collezione dei prodotti preferiti, 
																	allora vi sono altri prodotti preferiti per quel volantino, quindi 
																	non può essere rimosso dalla lista dei volantini che hanno prodotti preferiti */
				moreProducts = true;
			}});
			
			index = starredObjects.flyers.indexOf(chosedFlyer);
			if(!moreProducts)
				starredObjects.flyers.splice(index, 1);
			
			angular.forEach(starredObjects.flyers, function(flyers){
			if(flyers['ID_supermercato'] == item['ID_supermercato']){
				moreFlyers = true;
			}});
			
			index = starredObjects.markets.indexOf(chosedMarket);
			if(!moreFlyers)
				starredObjects.markets.splice(index, 1);
			
			window.localStorage['starredObjects'] = JSON.stringify(starredObjects);
		},
		GetStarredObjects: function(){
			return starredObjects;
		},
		DropStarredObjects: function(){
			starredObjects = {};
			window.localStorage['starredObjects'] = JSON.stringify(starredObjects);
		},
		GetItems: function(url){
			return $http.get(url).then(function(response){
				items = response.data.results;
				return items;
			});
		},
		GetPDF: function(url){ // TODO RIMUOVERE DOPPIA
			return $http.get(url).then(function(response){
				return response.data;
			});
		}
	}
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Service, $state, $http) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
//});

// Form data for the login modal
$scope.loginData = {};
$scope.registerData = {};
$scope.isLoginDataValid = false;

// Create the login modal that we will use later
$ionicModal.fromTemplateUrl('templates/start.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.modal = modal;
	$scope.showLogin();
	$scope.showModal();
});

// Triggered in the login modal to close it
$scope.closeModal = function(value) {
	$scope.isLoginDataValid = value;
	$scope.modal.hide();
};

/*Controllo se l'oggetto loginData è correttamente popolato*/
$scope.isDataGood = function (obj, lim) {
	var curr=0;
	if (obj) 
		for (var prop in obj) {
			if(prop.length!=0)
				curr++;
		}	
	if(curr != lim)
		return false;
	else
		return true;
};

// Open the login modal
$scope.showModal = function() {
    $scope.modal.show();
};

$scope.showLogin = function() {
	$scope.isRegister = false;
	$scope.operation = 'Login';
};

$scope.showRegister = function() {
	$scope.isRegister = true;
	$scope.operation = 'Register';
};

$scope.start = function(){
	Service.DropLoginData();
	$scope.showLogin();
	$scope.showModal();
}

// Perform the login action when the user submits the login form
$scope.doLogin = function() {
	Service.SetLoginData($scope.loginData);
	var loginData = Service.GetLoginData();
	if($scope.isDataGood(loginData, 5)){
		$http.get(loginData.BASE_URL).then(
		function successCallback(response){ /* Codice di errore 200-299 è considerato success e viene chiamata questa funzione */
			$scope.closeModal(true);
			$state.go('app.markets'); 
		},
		function errorCallback(response){
			alert('I tuoi dati d\'accesso sono incorretti');
		}
		);
	}else {
		alert('I tuoi dati d\'accesso sono incompleti!');
		Service.DropLoginData(); 
	}
}

$scope.doRegister = function() {
	if($scope.isDataGood($scope.registerData,5)){
		var dati = JSON.stringify({user:$scope.registerData.username,pass:$scope.registerData.password,email:$scope.registerData.email });
		var url = "http://"+$scope.registerData.ip +":"+$scope.registerData.port+"/SignUp/";
		console.log("URL", url, "DATI", dati);
		$http.post(url,dati).then(
		function successCallback(response){ /* Codice di errore 200-299 è considerato success e viene chiamata questa funzione */
			$scope.showLogin();
		},
		function errorCallback(response){
			alert('Errore!!');
			$scope.showRegister();
		});
	}else {
		alert('I tuoi dati d\'accesso sono incompleti!');
		$scope.showRegister();
	}
}
})

.controller('MarketCtrl',  function($scope, Service, $state, $http, $timeout) {
	$scope.loginData = Service.GetLoginData();
	$scope.NEXT_PAGE = 0; 
	$scope.items = [];
	
	Service.GetItems($scope.loginData.BASE_URL+"MarketList/"+$scope.NEXT_PAGE+"/").then(function(items){
		$scope.items = items;
		$scope.NEXT_PAGE++;
	});
	
	$scope.load = function(){
		console.log("chiamata a load");
		Service.GetItems($scope.loginData.BASE_URL+"MarketList/"+$scope.NEXT_PAGE+"/").then(function(items) {
			var len = $scope.items.lenght;
			angular.forEach(items, function(item){
				if($scope.items.indexOf(item) != -1){
					$scope.items = $scope.items.concat(item);	
				}
			});
			if($scope.items.lenght != len){
				$scope.NEXT_PAGE++;
				console.log("Page", $scope.NEXT_PAGE);
				$scope.currSleepTime = 0;
			}else{
				$scope.loadMore = $scope.sleep;
			}	
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
	
	/* ************************************/
	$scope.loadMore = $scope.load;
	$scope.currSleepTime = 0;
	$scope.sleepTime = Service.GetTimerSleep();
	/* ************************************/
	
	$scope.sleep = function(){
		console.log("chiamata a sleep");
		$timeout(1);
		$scope.currSleepTime++;	
		if($scope.currSleepTime > $scope.sleepTime){
			$scope.loadMore = $scope.load;
			$scope.currSleepTime = 0;
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}

	$scope.selectMarket = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_supermercato'] == parseInt(id, 10)){
				Service.SetChosedMarket(item);
				console.log("Selezionato Market", Service.GetChosedMarket());
			}
		});
		$state.go('app.flyers');
	}
})

.controller('FlyerCtrl',  function($scope, Service, $state, $http, $timeout) {
	$scope.loginData = Service.GetLoginData();
	$scope.Market = Service.GetChosedMarket();
	$scope.NEXT_PAGE = 0; 
	$scope.items = [];
	
	Service.GetItems($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/FlyerList/"+$scope.NEXT_PAGE+"/").then(function(items){
		$scope.items = items;
		$scope.NEXT_PAGE++;
	});
	
	$scope.load = function(){
		console.log("chiamata a load");
		Service.GetItems($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/FlyerList/"+$scope.NEXT_PAGE+"/").then(function(items) {
			var len = $scope.items.lenght;
			angular.forEach(items, function(item){
				if($scope.items.indexOf(item) != -1){
					$scope.items = $scope.items.concat(item);	
				}
			});
			if($scope.items.lenght != len){
				$scope.NEXT_PAGE++;
				console.log("Page", $scope.NEXT_PAGE);
				$scope.currSleepTime = 0;
			}else{
				$scope.loadMore = $scope.sleep;
			}	
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
	
	/* ************************************/
	$scope.loadMore = $scope.load;
	$scope.currSleepTime = 0;
	$scope.sleepTime = Service.GetTimerSleep();
	/* ************************************/
	
	$scope.sleep = function(){
		console.log("chiamata a sleep");
		$timeout(1);
		$scope.currSleepTime++;	
		if($scope.currSleepTime > $scope.sleepTime){
			$scope.loadMore = $scope.load;
			$scope.currSleepTime = 0;
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
		
	$scope.selectFlyer = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_volantino'] == parseInt(id, 10)){
				Service.SetChosedFlyer(item);
				console.log("Selezionato Flyer", Service.GetChosedFlyer());
			}
		});
		$state.go('app.products');
	}
	
	$scope.showPDF = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_volantino'] == parseInt(id, 10)){
				Service.SetChosedFlyer(item);
			}
		});
		$state.go('app.pdf');
	}
})

.controller('ProductsCtrl',  function($scope, Service, $state, $http, $location) {
	$scope.destination = '#/app/products/';
	$scope.loginData = Service.GetLoginData();
	$scope.Market = Service.GetChosedMarket();
	$scope.Flyer = Service.GetChosedFlyer();
	$scope.isSearchVisible = false;
	
	$scope.searchData = {};
	$scope.savedItems = [];
	
	$scope.NEXT_PAGE = 0; 
	$scope.items = [];
	console.log('LINK', $scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/"+$scope.Flyer['ID_volantino']+"/Products/"+$scope.NEXT_PAGE+"/");
	
	Service.GetItems($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/"+$scope.Flyer['ID_volantino']+"/Products/"+$scope.NEXT_PAGE+"/").then(function(items){
		angular.forEach(items, function(item){
		if($scope.isStarred(item))
			item.state = 'positive';
		else
			item.state = 'negative';
		});
		$scope.NEXT_PAGE++;
		$scope.items = items;
	});
	
	$scope.load = function(){
		console.log("chiamata a load");
		Service.GetItems($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/"+$scope.Flyer['ID_volantino']+"/Products/"+$scope.NEXT_PAGE+"/").then(function(items) {
			var len = $scope.items.lenght;
			angular.forEach(items, function(item){
				if($scope.items.indexOf(item) != -1){
					if($scope.isStarred(item))
						item.state = 'positive';
					else
						item.state = 'negative';
					$scope.items = $scope.items.concat(item);	
				}
			});
			if($scope.items.lenght != len){
				$scope.NEXT_PAGE++;
				console.log("Page", $scope.NEXT_PAGE);
				$scope.currSleepTime = 0;
			}else{
				$scope.loadMore = $scope.sleep;
			}	
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
	
	/* ************************************/
	$scope.loadMore = $scope.load;
	$scope.currSleepTime = 0;
	$scope.sleepTime = Service.GetTimerSleep();
	/* ************************************/
	
	$scope.sleep = function(){
		console.log("chiamata a sleep");
		$timeout(1);
		$scope.currSleepTime++;	
		if($scope.currSleepTime > $scope.sleepTime){
			$scope.loadMore = $scope.load;
			$scope.currSleepTime = 0;
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
	
	$scope.selectProduct = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_prodotto'] == parseInt(id, 10)){
				Service.SetChosedProduct(item);
				console.log("Selezionato Prodotto", Service.GetChosedProduct());
			}
		});
		$state.go('app.single');
	}
	
	$scope.starredManager = function(id){
		console.log('call to starredManager function', id);
		angular.forEach($scope.items, function(item){
			if(item['ID_prodotto'] == parseInt(id, 10)){
				if(!$scope.isStarred(item)){
					item.state = 'positive';
					Service.AddStarredObject(item);
					}else{
					item.state = 'negative';
					Service.RemoveStarredObject(item);
				}
			}
		});
	}
	
	$scope.isStarred = function(input){
		var bool = false;
		angular.forEach(Service.GetStarredObjects().products, function(item){
			if(item['ID_prodotto'] == input['ID_prodotto'])
				bool = true;
		});
		return bool;
	}
	
	$scope.changeSearchState = function(){
		if(!$scope.isSearchVisible){
			$scope.savedItems = $scope.items; /* salvo gli item */
			console.log("salvo gli items");
		}else{
			 $scope.items = $scope.savedItems;
			 console.log("ripristino gli items");
		}
		$scope.isSearchVisible = !$scope.isSearchVisible;
	}
	
	$scope.isntPrezzo = function(){
		console.log("Criterio",$location.search().criteria);
		return $location.search().criteria != 'Prezzo';
	}
	
	$scope.doSearch = function(){
		$scope.searchData.filter = $location.search().criteria;
		/* Il risultato della query va in $scope.items in modo da non modificare il template gli item sono stati salvati*/
		if($scope.searchData.filter == undefined)
			$scope.searchData.filter = 'Nome';
		
		var dati = JSON.stringify({type:"dati", filterby: $scope.searchData.filter, toSearch:$scope.searchData.textArea , minPrice:$scope.searchData.minPrice,maxPrice: $scope.searchData.maxPrice   });
		$scope.items = [];
		$http.post($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/"+$scope.Flyer['ID_volantino']+"/",dati).then(function(response){
			angular.forEach(response.data.results, function(item){
				if($scope.isStarred(item))
					item.state = 'positive';
				else
					item.state = 'negative';
			$scope.items = $scope.items.concat(item);	
			});
		});
	};
})

.controller('ItemCtrl',  function($scope, Service, $state, $http) {
	$scope.loginData = Service.GetLoginData();
	$scope.Market = Service.GetChosedMarket();
	$scope.Flyer = Service.GetChosedFlyer();
	$scope.Product = Service.GetChosedProduct();
	
	// DO SOME STUFF
})

.controller('StarredMarketsCrtl', function($scope, Service, $state) {
	$scope.isStarred = true;
	$scope.isEmpty = false;
	$scope.items = Service.GetStarredObjects().markets;
	
	if(Service.GetStarredObjects().flyers.length == 0){
		$scope.isEmpty = true;
	}
	
	$scope.selectMarket = function(id){
	angular.forEach($scope.items, function(item){
		if(item['ID_supermercato'] == parseInt(id, 10)){
			Service.SetChosedMarket(item);
		}
	});
	$state.go('app.starredFlyers');
	}
})

.controller('StarredFlyersCrtl', function($scope, $state, Service, $ionicHistory) {
	$scope.isStarred = true;
	var market = Service.GetChosedMarket();
	var flyers = Service.GetStarredObjects().flyers;

	$scope.items = [];

		var i = 0;
		angular.forEach(Service.GetStarredObjects().flyers, function(item){
			if(item['ID_supermercato'] == market['ID_supermercato']){
				i++;
			}
		});
		if(i == 0){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.starredMarkets');
	}
		
	
	angular.forEach(flyers, function(flyer){
		if(flyer['ID_supermercato'] == market['ID_supermercato']){
			console.log("scelto mark", market);
			console.log("scelto flyr", flyers);
			
			var splittedDate = flyer['Data_Fine'].split("-");
			var flyDate = new Date(parseInt(splittedDate[2],10),parseInt(splittedDate[1],10)-1,parseInt(splittedDate[0],10));
			if(flyDate.getTime() > Date.now()){
				$scope.items = $scope.items.concat(flyer);
				console.log("entro");
			}	
			else{
				console.log("cancello");
				Service.SetChosedFlyer(flyer);
				var i = 0;
				angular.forEach(Service.GetStarredObjects().products, function(product){
					if(product['ID_volantino']==flyer['ID_volantino']){
						Service.RemoveStarredObject(product);
						i++;
					}
				});
				//toastr.info("Ho cancellato "+i+" prodotti perché scaduti.","Informazione!");

			}
		}
	});
	
	$scope.selectFlyer = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_volantino'] == parseInt(id, 10)){
				Service.SetChosedFlyer(item);
			}
		});
		$state.go('app.starredProducts');
	}
	
	$scope.showPDF = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_volantino'] == parseInt(id, 10)){
				Service.SetChosedFlyer(item);
			}
		});
		$state.go('app.pdf');
	}
})

.controller('StarredProductsCrtl', function($scope, $state, Service, $location) {
	$scope.destination = '#/app/starredProducts';
	$scope.isStarred = true;
	var market = Service.GetChosedMarket();
	var flyer = Service.GetChosedFlyer();
	var products = Service.GetStarredObjects().products;
	$scope.items = [];
	
	$scope.searchData = {};
	$scope.savedItems = [];
	
	angular.forEach(products, function(product){
		if(product['ID_volantino'] == flyer['ID_volantino']){
			$scope.items = $scope.items.concat(product);
		}
	});
	
	$scope.selectProduct = function(id){
		angular.forEach($scope.items, function(item){
			if(item['ID_prodotto'] == parseInt(id, 10)){
				Service.SetChosedProduct(item);
			}
		});
		$state.go('app.single');
	}
	
	$scope.starredManager = function(id){
		console.log('call to starredManager function', id);
		angular.forEach($scope.items, function(item){
			if(item['ID_prodotto'] == parseInt(id, 10)){
					Service.RemoveStarredObject(item);
					var index = $scope.items.indexOf(item);
					$scope.items.splice(index, 1);
			}
		});
		console.log(Service.GetStarredObjects().products.length);
		
		var i = 0;
		angular.forEach(Service.GetStarredObjects().products, function(item){
			if(item['ID_volantino'] == flyer['ID_volantino']){
				i++;
			}
		});
		if(i == 0)
			$state.go('app.starredFlyers');
	}
	$scope.changeSearchState = function(){
		if(!$scope.isSearchVisible){
			$scope.savedItems = $scope.items; /* salvo gli item */
			console.log("salvo gli items");
		}else{
			 $scope.items = $scope.savedItems;
			 console.log("ripristino gli items");
		}
		$scope.isSearchVisible = !$scope.isSearchVisible;
	}
	
	$scope.isntPrezzo = function(){
		console.log("Criterio",$location.search().criteria);
		return $location.search().criteria != 'Prezzo';
	}
	
	$scope.doSearch = function(){
		$scope.items = [];
		$scope.searchData.filter = $location.search().criteria;
		/* Il risultato della query va in $scope.items in modo da non modificare il template gli item sono stati salvati*/
		$scope.searchData.textArea
		angular.forEach($scope.savedItems, function(item){
			switch($scope.searchData.filter){
				case 'Descrizione':{
					if(item['Descrizione'].indexOf($scope.searchData.textArea) > -1)
						$scope.items = $scope.items.concat(item);
					break;
				}
				case 'Prezzo':{
					if(parseInt(item['Prezzo'],10)>=$scope.searchData.minPrice && parseInt(item['Prezzo'],10)<=$scope.searchData.maxPrice)
						$scope.items = $scope.items.concat(item);
					break;
				}
				case 'Categoria':{
					if(item['Categoria'].indexOf($scope.searchData.textArea) > -1)
						$scope.items = $scope.items.concat(item);
					break;
				}
				case 'Nome': default:{
					if(item['Nome'].indexOf($scope.searchData.textArea) > -1)
						$scope.items = $scope.items.concat(item);
					break;
				}
			}
		});
	}
})

.controller('PDFCtrl',  function($scope, Service, $state, $http) {
	$scope.loginData = Service.GetLoginData();
	$scope.Market = Service.GetChosedMarket();
	$scope.flyer = Service.GetChosedFlyer();
	$scope.pdf = [];
	
	$http.get($scope.loginData.BASE_URL+""+$scope.Market['ID_supermercato']+"/"+$scope.flyer['ID_volantino']+"/Products/0/", {responseType: 'arraybuffer', headers: {'Accept':'application/pdf'}}).success(function (data) {
           var file = new Blob([data], {type: 'application/pdf'});
           var fileURL = URL.createObjectURL(file);
			$scope.pdf = fileURL;
    });
});