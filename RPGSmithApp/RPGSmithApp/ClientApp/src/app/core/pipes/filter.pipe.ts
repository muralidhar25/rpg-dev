import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {

    transform(data: any, searchText: string, column?: string): any[] {
        
        if (!data) return [];
        if (!searchText) return data;

        searchText = searchText.toLowerCase();

        return data.filter(function (item) {
            return (item[column].toLowerCase().indexOf(searchText)>-1);
        });

        //TODO -r
    }
}
