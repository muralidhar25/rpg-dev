import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterTile' })
export class FilterTilePipe implements PipeTransform {

    transform(data: any, searchText: string, column?: string): any[] {

        if (!data) return [];
        if (!searchText) return data;

        searchText = searchText.toLowerCase();

        if (column == 'spell') {
            return data.filter(function (item) {
                let name = item.spell.name;
                return (name.toLowerCase().indexOf(searchText) > -1);
            });
        }
        else if (column == 'ability') {
            return data.filter(function (item) {
                let name = item.ability.name;
                return (name.toLowerCase().indexOf(searchText) > -1);
            });
        }
        else if (column == 'buffAndEffect') {
          return data.filter(function (item) {
            let name = item.buffAndEffect.name;
            return (name.toLowerCase().indexOf(searchText) > -1);
          });
        }
        else if (column == 'ally') {
          return data.filter(function (item) {
            let name = item.name;
            return (name.toLowerCase().indexOf(searchText) > -1);
          });
        }
        else if (column == 'item') {
            return data.filter(function (item) {
                let name = item.name;
                return (name.toLowerCase().indexOf(searchText) > -1);
            });
        }
        else if (column == 'stat') {
            return data.filter(function (item) {
                let name = item.characterStat.statName;
                return (name.toLowerCase().indexOf(searchText) > -1);
            });
        }
        else if (column == 'rStat') {
            return data.filter(function (item) {
                let name = item.statName;
                return (name.toLowerCase().indexOf(searchText) > -1);
            });
        }

        //TODO -r
    }
}
