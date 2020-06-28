import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'gif' })
export class DiceGif implements PipeTransform {
    transform(value, args: string[]): any {
        let gifs = [];
        
        for (var gifVal in value) {
            var isValueProperty = parseInt(gifVal, 10) >= 0
            if (isValueProperty) {
                gifs.push({ gif: gifVal, value: value[gifVal] });
                
                
            }
        }
        return gifs;
    }
}

//export class DiceGifs implements PipeTransform {
//    transform(data: Object) {
//        
//        const gifs = Object.keys(data);
//        return gifs;
//    }
//}

