(function () {
    'use strict';



    angular.module('rpgsmith-dialogs', [
        'ui.bootstrap', 'dialogs.main'
    ]);

    angular.module('rpgsmith-services', [
        'ngStorage'
    ]);

    angular.module('rpgsmith-filters', [
        'rpgsmith-services'
    ]);

    angular.module('rpgsmith-directives', []);
    angular.module('rpgsmith-controllers', [
        'rpgsmith-directives',
        'rpgsmith-services'
    ]);
    angular.module('rpgsmith-templates', []);

    var app = angular.module('rpgsmith', [
        'dialogs.main', 'ngMessages',
        'angularSpectrumColorpicker',
        'ngAnimate', 'ngTouch', 'ngSanitize', 'ngStorage', 'ngImgCrop', 'ngFileUpload',
        'pageslide-directive',
        'rpgsmith-directives', 'rpgsmith-dialogs', 'rpgsmith-filters',
        'rpgsmith-controllers', 'rpgsmith-services', 'rpgsmith-templates',
        'toaster',
        'ui.router', 'ui.sortable', 'ui.tab.scroll', 'ui.select', 'ui.tinymce', 'colorpicker','ngStorage'
    ]);


    app.filter('trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        }
    }]);

    app.config(['uiSelectConfig', function (uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
        uiSelectConfig.searchEnabled = false;
        uiSelectConfig.skipFocusser = true;
    }]);

    app.config(['$animateProvider', function ($animateProvider) {
        $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    }]);

    app.config(['$localStorageProvider', function ($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('RPGSmith');
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
            $locationProvider.html5Mode(true).hashPrefix('!');
            //  $locationProvider.hashPrefix('');
            $urlRouterProvider.otherwise("/characters");
            $stateProvider
                .state('login', {
                    url: '/login',
                    cache: false,
                    authenticate: false,
                    templateUrl: '/views/home/login.html',
                    controller: 'loginController',
                    resolve: {
                        previousState: ['$state', function ($state) {
                            var current = {
                                name: $state.current.name,
                                params: $state.params,
                                url: $state.href($state.current.name, $state.params)
                            }
                            return current;
                        }]
                    }
                })
                .state('profile', {
                    abstract: true,
                    authenticate: false,
                    template: '<div ui-view="topNav"></div><div ui-view="main"></div>'
                })
                .state('profile.characters', {
                    authenticate: true,
                    url: '/characters',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/characters.html',
                            controller: 'charactersPageController'
                        }
                    },
                    params: {
                        menuSelected: 'Characters'
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.addnewcharacterdialog', {
                    authenticate: true,
                    url: '/characters/addnewcharacterdialog',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/dialogs/edit-character.html',
                            controller: 'charactersPageController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.addnewcorestatdialog', {
                    authenticate: true,
                    url: '/RuleSet/addnewcorestatdialog',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/dialogs/addnewcorestat.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.addnewcharacter', {
                    authenticate: true,
                    url: '/addnewcharacter',
                    views: {
                        'main@profile': {
                            templateUrl: '/views/home/character-addnew.html',
                            controller: 'charactersPageController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.character', {
                    abstract: true,
                    authenticate: true,
                    url: '^/characterlayout'
                })
                .state('profile.character.notes', {
                    authenticate: true,
                    url: '/notes',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-notes.html',
                            controller: 'notesPageController',
                        }
                    }
                })
                .state('profile.AddNewRuleSet', {
                    authenticate: true,
                    url: '/RuleSets',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/RuleSet.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        menuSelected: 'Rulesets',
                        action: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.NewRuleSet', {
                    authenticate: true,
                    url: '/RuleSet?RuleSetId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav_addnewruleset.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/ruleset-addnew.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 2,
                        isNew: 0,
                        // RuleSetId: 0,
                        CopyOrUpdate: 0,
                        IsAddRuleSet: 0
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.ExistingRuleSet', {
                    authenticate: true,
                    url: '/characters/ExistingRuleSet',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/dialogs/ExistingRuleset.html',
                            controller: 'charactersPageController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.character.counters', {
                    authenticate: true,
                    url: '/counters',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-counters.html',
                            controller: 'countersPageController',
                        }
                    }
                })
                .state('profile.character.attributes', {
                    authenticate: true,
                    url: '/stats',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-attributes.html',
                            controller: 'attributesPageController',
                        }
                    }
                })
                .state('profile.character.links', {
                    authenticate: true,
                    url: '/links',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-links.html',
                            controller: 'linksPageController',
                        }
                    }
                })
                .state('profile.character.executes', {
                    authenticate: true,
                    url: '/executes',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-executes.html',
                            controller: 'executesPageController',
                        }
                    }
                })
                .state('profile.character.commands', {
                    authenticate: true,
                    url: '/commands',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-commands.html',
                            controller: 'commandsPageController',
                        }
                    }
                })
                .state('profile.character.layouts', {
                    authenticate: true,
                    url: '/layouts',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-layouts.html',
                            controller: 'layoutsPageController',
                        }
                    }
                })
                .state('profile.character.layout', {
                    authenticate: true,
                    url: '?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/character-layout.html',
                            controller: 'layoutPageController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }],
                    params: {
                        //characterId:-1,
                        action: 1,
                        isNew: 1
                    }
                })
                .state('profile.EditProfile', {
                    authenticate: true,
                    url: '/Editprofile',
                    //  url: '/Editprofile/',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav_addnewruleset.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/editprofile.html',
                            controller: 'topNavController'
                        }
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                    //params: {
                    //    userid: {
                    //        dynamic: true
                    //    }

                    //},

                   
                })
                .state('profile.ResetPassword', {
                    authenticate: false,
                    url: '/ResetPassword',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav_addnewruleset.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/resetpassword.html',
                            controller: 'topNavController'
                        }
                    },
                    //params: {
                    //    userid: {
                    //        dynamic: true
                    //    }

                    //},
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.Items', {
                    authenticate: true,
                    url: '/Items?RuleSetId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/ruleset_itemproperties.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 4,
                        // RuleSetId: 0,
                        ContentId: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.Spells', {
                    authenticate: true,
                    url: '/Spells?RuleSetId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/ruleset-spells.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 4,
                        // RuleSetId: 0,
                        ContentId: 2
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.Abilities', {
                    authenticate: true,
                    url: '/Abilities?RuleSetId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/ruleset-abilities.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 4,
                        //  RuleSetId: 0,
                        ContentId: 3
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.Corestats', {
                    authenticate: true,
                    url: '/Corestats?RuleSetId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/ruleset-corestats.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 3,

                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.RulesetItemDetails', {
                    authenticate: true,
                    url: '/RulesetItemDetails',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/rulesetitemcontent.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 5,
                        RuleSetId:0,
                        contentType: 1,
                        index: -1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.RulesetSpellDetails', {
                    authenticate: true,
                    url: '/RulesetSpellDetails',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/rulesetspellcontent.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 5,
                        RuleSetId: 0,
                        contentType: 2,
                        index: -1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.RulesetAbilityDetails', {
                    authenticate: true,
                    url: '/RulesetAbilityDetails',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/rulesetabilitycontent.html',
                            controller: 'ruleSetPageController'
                        }
                    },
                    params: {
                        action: 5,
                        RuleSetId: 0,
                        contentType: 3,
                        index: -1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.ItemInventory', {
                    authenticate: true,
                    url: '/ItemInventory?characterId&contentType',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/iteminventory.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        // characterId:-1,
                        action: 2,
                        isNew: 0,
                       // contentType: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.SpellInventory', {
                    authenticate: true,
                    url: '/SpellInventory?characterId&contentType',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/spellinventory.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        //  characterId: -1,
                        action: 2,
                        //contentType: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.AbilityInventory', {
                    authenticate: true,
                    url: '/AbilityInventory?characterId&contentType',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/attributeinventory.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        // characterId: -1,
                        action: 2,
                       // contentType: 3
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterRulesetItems', {
                    authenticate: true,
                    url: '/CharacterRulesetItems?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/CharacterRulesetItems.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        // characterId: -1,
                        action: 3,
                        isNew: 0,
                        contentType: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterRulesetSpells', {
                    authenticate: true,
                    url: '/CharacterRulesetSpells?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/CharacterRulesetSpells.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        //characterId: -1,
                        action: 3,
                        contentType: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterRulesetAbilities', {
                    authenticate: true,
                    url: '/CharacterRulesetAbilities?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/CharacterRulesetAbilities.html',
                            controller: 'layoutPageController'
                        }
                    },
                    params: {
                        // characterId: -1,
                        action: 3,
                        isNew: 0,
                        contentType: 1
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterItemsDetails', {
                    authenticate: true,
                    url: '/CharacterItemsDetails?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/characteritemcontent.html',
                            controller: 'layoutPageController'
                        }

                    },
                    params: {
                        // characterId: -1,
                        action: 4,
                        contentType: 1,
                        index: -1,

                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterSpellDetails', {
                    authenticate: true,
                    url: '/CharacterSpellDetails?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/characterspellcontent.html',
                            controller: 'layoutPageController'
                        }

                    },
                    params: {
                        //characterId: -1,
                        action: 4,
                        contentType: 2,
                        index: -1,
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.CharacterAbilityDetails', {
                    authenticate: true,
                    url: '/CharacterAbilityDetails?characterId',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/home/characterabilitycontent.html',
                            controller: 'layoutPageController'
                        }

                    },
                    params: {
                        // characterId: -1,
                        action: 4,
                        contentType: 3,
                        index: -1,
                    },
                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                })
                .state('profile.AccountSettings', {
                    url: '/AccountSettings',
                    views: {
                        'topNav@profile': {
                            templateUrl: '/views/shared/home-topNav.html',
                            controller: 'topNavController'
                        },
                        'main@profile': {
                            templateUrl: '/views/shared/AccountSettings.html',
                            controller: 'topNavController',
                        }
                    },
                    params: {
                        menuSelected: 'AccountSettings',
                    }
				})
				.state('RegisterSuccess', {
					authenticate: false,
					url: '/RegisterSuccess',
					views: {
						
						'main@profile': {
							templateUrl: '/views/EmailTemplates/RegisterSuccess.html',
							controller: 'registerController'
						}
					}
				})
                .state('RegisterConfirmationEmailMessage', {
                    authenticate: true,
                    url: '/RegisterConfirmationEmail',
                    //  url: '/Editprofile/',
                    views: {
                        'main@profile': {
                            templateUrl: '/views/EmailTemplates/RegisterEmailConfirmation.html',
                            controller: 'topNavController'
                        }
                    },
                    //params: {
                    //    userid: {
                    //        dynamic: true
                    //    }

                    //},

                    onEnter: ['navService', function (navService) {
                        navService.setHeader(null);
                    }]
                });
        }]);

    app.config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);

    
    //app.run(function ($rootScope, $route, $location) {
    //    //Bind the `$locationChangeSuccess` event on the rootScope, so that we dont need to 
    //    //bind in induvidual controllers.
    //    debugger;
    //    $rootScope.$on('$locationChangeSuccess', function () {
    //        $rootScope.actualLocation = $location.path();
    //    });

    //    $rootScope.$watch(function () { return $location.path() }, function (newLocation, oldLocation) {
    //        if ($rootScope.actualLocation === newLocation) {
    //            alert('Why did you use history back?');
    //        }
    //    });
    //});

    app.run(['$rootScope', '$http', '$state', 'authService', 'navService',
        function ($rootScope, $http, $state, authService, navService) {
            authService.init();
            $rootScope.$on('httpUnauthorized', function () {
                $state.transitionTo('login');
            });
            $http.defaults.headers.common['X-XSRF-TOKEN'] = angular.element('input[name="__RequestVerificationToken"]').attr('value');
        }]);

    app.run(['$transitions', 'authService', '$state', function ($transitions, authService, $state) {

        $transitions.onBefore({}, function (transition) {
            transition.addResolvable({
                token: '$transition',
                resolveFn: function () {
                    return transition;
                }
            })
        });

        $transitions.onStart({}, function (transition) {
            if (!authService.authentication.authenticated) {
                $state.go("login");
            }

        });
    }]);

    app.run(['$templateCache', '$interpolate', function ($templateCache, $interpolate) {
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        $templateCache.put('/dialogs/error.html', '<div class="modal-header dialog-header-error"><h4 class="modal-title text-danger"><span class="' + startSym + 'icon' + endSym + '"></span> <span ng-bind-html="header"></span></h4></div><div class="modal-body text-danger" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="close()">' + startSym + '"DIALOGS_CLOSE" | translate' + endSym + '</button></div>');
        $templateCache.put('/dialogs/wait.html', '<div class="modal-header dialog-header-wait"><h4 class="modal-title"><span class="' + startSym + 'icon' + endSym + '"></span> ' + startSym + 'header' + endSym + '</h4></div><div class="modal-body"><p ng-bind-html="msg"></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" ng-style="getProgress()"></div><span class="sr-only">' + startSym + 'progress' + endSym + '' + startSym + '"DIALOGS_PERCENT_COMPLETE" | translate' + endSym + '</span></div></div>');
        $templateCache.put('/dialogs/notify.html', '<div class="modal-header dialog-header-notify"><h4 class="modal-title text-info"><span class="' + startSym + 'icon' + endSym + '"></span> ' + startSym + 'header' + endSym + '</h4></div><div class="modal-body text-info" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="close()">' + startSym + '"DIALOGS_OK" | translate' + endSym + '</button></div>');
        $templateCache.put('/dialogs/confirm.html', '<div class="modal-header dialog-header-confirm"><h4 class="modal-title"><span class="' + startSym + 'icon' + endSym + '"></span> ' + startSym + 'header' + endSym + '</h4></div><div class="modal-body" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="yes()">' + startSym + '"DIALOGS_YES" | translate' + endSym + '</button><button type="button" class="btn btn-primary" ng-click="no()">' + startSym + '"DIALOGS_NO" | translate' + endSym + '</button></div>');
    }]);
})();
