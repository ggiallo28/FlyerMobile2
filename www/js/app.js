// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // if (window.cordova && window.cordova.plugins.Keyboard) {
      // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      // cordova.plugins.Keyboard.disableScroll(true);

    // }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

})

.config(function($stateProvider, $urlRouterProvider) {  
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.markets', {
	 cache: false,
      url: '/markets',
      views: {
        'menuContent': {
          templateUrl: 'templates/markets.html',
          controller: 'MarketCtrl'
        }
      }
    })
	.state('app.flyers', {
	  url: '/flyers',
      views: {
        'menuContent': {
          templateUrl: 'templates/flyers.html',
          controller: 'FlyerCtrl'
        }
      }
    })
	.state('app.products', {
      url: '/products/:criteria',
      views: {
        'menuContent': {
          templateUrl: 'templates/products.html',
          controller: 'ProductsCtrl'
        }
      }
    })
	.state('app.starredMarkets', {
	  cache: false, /* Disabilito il caching in modo tale che il codice in un certo controller viene eseguito ogni volta al cambio di view */
      url: '/starredMarkets',
      views: {
        'menuContent': {
          templateUrl: 'templates/markets.html',
          controller: 'StarredMarketsCrtl'
        }
      }
    })
	.state('app.starredFlyers', {
	  cache: false,
      url: '/starredFlyers',
      views: {
        'menuContent': {
          templateUrl: 'templates/flyers.html',
          controller: 'StarredFlyersCrtl'
        }
      }
    })
	.state('app.starredProducts', {
	cache: false,
      url: '/starredProducts',
      views: {
        'menuContent': {
          templateUrl: 'templates/products.html',
          controller: 'StarredProductsCrtl'
        }
      }
    })
	.state('app.pdf', {
      url: '/pdf',
      views: {
        'menuContent': {
          templateUrl: 'templates/pdf.html',
          controller: 'PDFCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/single',
    views: {
      'menuContent': {
        templateUrl: 'templates/product.html',
        controller: 'ItemCtrl'
      }
    }
  })
  .state('app.start', {
      url: '/start',
      templateUrl: 'templates/start.html'
  });
	// if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/start');
});