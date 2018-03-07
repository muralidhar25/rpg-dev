(function(r) {
    'use strict';

    var tileTypes = window.rpgsmith.tileTypes;
    var module = angular.module('rpgsmith-services');

    module.factory('tileFactory', ['dataContext', function(dataContext) {
        
        var Tile = function Tile() {

            function trimProblems(obj) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var v = obj[p];
                        if (rpgsmith.isEmpty(v) || v === 'inherit' || v === 'initial' || v === 'transparent')
                            delete obj[p];
                    }
                }
                return obj;
            }

            this.parseStyle = function() {

                if (this.__styleComputed === null) {

                    var tmp = angular.fromJson(this.style) || {};

                    tmp = angular.extend({
                        'tile': { 'classes': null, 'styles': {} },
                        'content': { 'classes': null, 'styles': {} }
                    }, tmp);

                    trimProblems(tmp.tile.styles);
                    trimProblems(tmp.content.styles);

                    this.__styleComputed = tmp;
                }

                return this.__styleComputed;
            };

            this.updateStyle = function(value) {

                trimProblems(value.tile.styles);
                trimProblems(value.content.styles);

                this.__styleComputed = value;
                this.style = value && Object.keys(value).length ? angular.toJson(value) : null;
            };

        };

        var getEntity = function (tile) {

            if (dataContext.character) {
                switch (tile.typeId) {
                    case tileTypes.note.id:
                        return dataContext.character.notes.find(function (c) { return c.id === tile.entityId });
                    case tileTypes.counter.id:
                        return dataContext.character.counters.find(function (c) { return c.id === tile.entityId });
                }
            }

            return null;
        };

        Tile.typeInitializer = function (tile) {
            tile.__entity = null;
            tile.__styleComputed = null;
            tile.__randomShake = 'disable-rpgsmith-shake-' + Math.randomInteger(1, 10);
        };

        Tile.prototype.onPropertyChanged = function (args) {
            if (args.propertyName === 'entityId' || args.propertyName === 'typeId')
                this.__entity = getEntity(this);
        };

        Object.defineProperty(Tile.prototype, 'entity', {
            enumerable: false,
            configurable: false,
            get: function() {
                if (this.__entity == null)
                    this.__entity = getEntity(this);
                return this.__entity;
            }
        });

        var service = {
            Tile: Tile
        };

        return service;

    }]);

})();