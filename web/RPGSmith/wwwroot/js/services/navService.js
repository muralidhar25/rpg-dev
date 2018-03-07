(function () {
    'use strict';

    var app = angular.module('rpgsmith-services');

    app.factory('navService', ['$rootScope', '$state', '$localStorage', 'authService', 'rulesetDataShareService',
        function ($rootScope, $state, $localStorage, authService, rulesetDataShareService) {

        var navs = {};
        var service = {};

        service.topNav = {};

        var getNavKey = function (id) {
            return $state.current.url + '/' + id;
        };

        service.setLastCharacterId = function (characterId) {
            $localStorage.lastCharacterId = characterId;
        };

        service.setLastLayoutId = function (characterId, layoutId) {

            var layoutsAll = $localStorage.lastLayouts || {};
            var layouts = layoutsAll[characterId] || [];

            var layout = layouts.find(function (c) { return c.layoutId === layoutId });
            if (layout) {
                layout.dt = Date.now();
            }
            else {
                layouts.push({
                    layoutId: layoutId,
                    pageId: null
                });
            }

            layoutsAll[characterId] = layouts;
            $localStorage.lastLayouts = layoutsAll;
        };

        service.setLastTabId = function (characterId, layoutId, pageId) {

            var layoutsAll = $localStorage.lastLayouts || {};
            var layouts = layoutsAll[characterId] || [];

            var layout = layouts.find(function (c) { return c.layoutId === layoutId });

            if (layout) {
                layout.dt = Date.now();
                layout.pageId = pageId;
            }
            else {
                layouts.push({
                    dt: Date.now(),
                    layoutId: layoutId,
                    pageId: pageId
                });
            }

            layoutsAll[characterId] = layouts;
            $localStorage.lastLayouts = layoutsAll;
        };

        service.getLastCharacterId = function () {
            return $localStorage.lastCharacterId;
        };

        service.getLastLayoutId = function (character) {
            var layout = service.getLastLayout(character);
            if (layout)
                return layout.layoutId;
            return null;
        };

        service.getLastPageId = function (character, layout) {

            if ($localStorage.lastLayouts) {

                if (layout.tabs && layout.tabs.length) {

                    var lastLayouts = ($localStorage.lastLayouts[character.id] || []);
                    var lastLayout = lastLayouts.find(function (c) { return c.layoutId === layout.id });

                    if (lastLayout) {
                        // Ensure this is a valid id
                        var tab = layout.tabs.find(function (c) { return c.id === lastLayout.pageId; });
                        if (tab)
                            return tab.id;
                    }

                    // We didn't find any (or any valid), so return the first one
                    return layout.tabs[0].id;
                }
            }

            return null;
        };

        service.getLastLayout = function (character) {

            if ($localStorage.lastLayouts) {

                var lastLayouts = ($localStorage.lastLayouts[character.id] || []);

                if (lastLayouts.length) {

                    if (character.layouts && character.layouts.length) {

                        var sorted = lastLayouts.sort(function (a, b) { return b.dt - a.dt });
                        var found = null;

                        while (sorted.length) {

                            var layout = character.layouts.find(function (c) { return c.id === sorted[0].layoutId; });
                            if (layout) {
                                found = sorted[0];
                                break;
                            }

                            sorted.shift();
                        }

                        $localStorage.lastLayouts[character.id] = sorted;
                        return found;

                    }
                    else {
                        // We don't have any layouts, clean house
                        $localStorage.lastLayouts[character.id] = [];
                    }
                }
            }

            return null;
        };
		service.gotoRegisterSuccess = function (replace) {
			return $state.go('RegisterSuccess',
				null,
				{ location: 'replace' }
			);
		};
        service.gotoCharacters = function (replace) {
            return $state.go('profile.characters',
                null,
                { location: 'replace' }
            );
        };
        service.NewRuleSet = function () {
            return $state.go('profile.NewRuleSet',
             
                { location: 'replace' }
            );
        };
        service.ExistingRuleSet = function () {
            return $state.go('profile.ExistingRuleSet',

                { location: 'replace' }
            );
        };

        service.gotoLayouts = function (characterId, replace) {
            return $state.go('profile.character.layouts',
                { characterId: characterId },
                { location: 'replace' }
            );
        };

        service.gotoLayout = function (characterId, layoutId, pageId, replace) {
            return $state.go('profile.character.layout',
                { characterId: characterId, layoutId: layoutId, pageId: pageId },
                { location: 'replace' }
            );
        };

        service.setHeader = function (value) {
            service.topNav.header = value;
        }

        service.updateBody = function (nav1, nav2) {
            var add = null, remove = null;

            if (nav2) {
                add = 'navbar-2';
                remove = 'navbar-1';
            }
            else if (nav1) {
                add = 'navbar-1';
                remove = 'navbar-2';
            }
            else {
                remove = 'navbar-1 navbar2';
            }

            $rootScope.$emit('rpgsmithSetBodyClass', { add: add, remove: remove });
        }

        service.logout = function () {
            authService.logout();
        }
        
        service.registerNav = function (id, config) {
            navs[getNavKey(id)] = config;
        };

        service.hasNav = function (id) {
           return navs.hasOwnProperty(getNavKey(id));
        };

        service.toggleNav = function (id) {
            var config = navs[getNavKey(id)];
            if (config)
                config.opened = !config.opened;
        };

        service.getCommonHamburger = function (more) {
            var common = [
                {
                    id: 'nav.profile',
                    name: 'Profile',
                    icon: 'fa-fw fa-user',
                    action: function () {
                        $state.go("profile.characters");
                    }
                },
                {
                    id: 'nav.signout',
                    name: 'Sign out',
                    icon: 'fa-fw fa-sign-out',
                    action: function () {
                        var logout = authService.logout();
                        logout.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                var savedData = {};
                                var savedspell = {};
                                var savedability = {};
                                var savedcorestat = {};
                                rulesetDataShareService.set(savedData)
                                rulesetDataShareService.setspell(savedspell)
                                rulesetDataShareService.setability(savedability)
                                rulesetDataShareService.setcorestat(savedcorestat)
                                localStorage.clear();
                                $state.go('login');
                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        alert(data.data.ErrorMessage);
                                    }
                                }
                            }
                        })
                       // service.logout();
                    }
                }
            ];
            return common.concat(more || []);
        }

        service.getCommonCharacterNav = function (more) {
            var common = [
                {
                    id: 'nav.notes',
                    name: 'Notes',
                    icon: 'fa-fw fa-sticky-note-o',
                    action: function () {
                        $state.go('profile.character.notes', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.counters',
                    name: 'Counters',
                    icon: 'fa-fw fa-percent',
                    action: function () {
                        $state.go('profile.character.counters', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.attributes',
                    name: 'Core Stats',
                    icon: 'fa-fw fa-user-circle-o',
                    action: function () {
                        $state.go('profile.character.attributes', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.links',
                    name: 'Links',
                    icon: 'fa-fw fa-user-circle-o',
                    action: function () {
                        $state.go('profile.character.links', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.attributes',
                    name: 'Executes',
                    icon: 'fa-fw fa-user-circle-o',
                    action: function () {
                        $state.go('profile.character.executes', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.attributes',
                    name: 'Commands',
                    icon: 'fa-fw fa-user-circle-o',
                    action: function () {
                        $state.go('profile.character.commands', { characterId: $state.params.characterId });
                    }
                },
                {
                    id: 'nav.characters',
                    name: 'Characters',
                    icon: 'fa-fw fa-users',
                    action: function () {
                        $state.go('profile.characters');
                    }
                }
            ];
            return common.concat(more || []);
        };

        return service;
    }]);    

})();