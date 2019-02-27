import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'contains' })
export class ContainsPipe implements PipeTransform {

    transform(items: any, value: string, column: string): any {
       
        var hasValue: boolean = false;

        if (items == null || items == undefined) return hasValue;
        if (!value) return hasValue;

        items.filter(function (val) {
            var x = +val[column];
            var y = +value;

            if (x === y) hasValue = true;
        });

        return hasValue;
    }
}

