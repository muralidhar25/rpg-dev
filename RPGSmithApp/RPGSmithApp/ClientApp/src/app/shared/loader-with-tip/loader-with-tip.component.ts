import { Component, Input } from '@angular/core';

@Component({
  selector: 'loader-with-tip',
  templateUrl: './loader-with-tip.component.html',
  styleUrls: ['./loader-with-tip.component.scss']
})
export class LoaderWithTipComponent {
	@Input() isLoading = false;
  loadingMessage: string = '';

  constructor() {

  }

  ngOnInit() {
    this.loadingMessage = this.tips();
    setTimeout(() => {
      this.loadingMessage = this.tips();
    }, 100);

  }

  tips() {
    return [
      { key: 1, value: 'Make a duplicate of your Character or Rule Set to save a pristine copy.' },
      { key: 2, value: 'Perform separate rolls at the same time with the use of the ‘AND’ function.' },
      { key: 3, value: 'Want to drop some dice results from your roll? Use the Keep High/Low & Drop High/Low functions. (KHx, KLx, DHx, DLx)' },
      { key: 4, value: 'Looking for the perfect image? Search the web right through the interface.' },
      { key: 5, value: 'Want to select and delete multiple tiles at once? Go into ‘deletion mode’, accessible when editing a page.' },
      { key: 6, value: 'Use a counter tile to keep track of a numeric values without creating a character stat.' },
      { key: 7, value: 'Check out the RPGSmith help page for tons of useful information about the app. Accessible through the stack menu on the top right.' },
      { key: 8, value: 'Use the ‘Note’ tile to jot down a quick note. The rich text editor provides tons of formatting and other features.' },
      { key: 9, value: 'Associate spells and abilities with items for quick access to magical and other effects.' },
      { key: 10, value: 'Place items in containers. Configure weight reduction on the container to automatically adjust the weight of items placed in it.' },
      { key: 11, value: 'Hide Items, Spells, and/or Abilities from the Rule Set settings to remove elements not used in your game.' },
      { key: 12, value: 'Enable sharing for your custom Rule Sets and allow others to obtain a copy of your creation.' },
      { key: 13, value: 'Flag items as Equipped, Magical, Consumable, Unidentified, Visible, and more to allow for quick identification from the records views.' },
      { key: 14, value: 'Increase the quantity for a given item and the total weight will update automatically.' },
      { key: 15, value: '‘Calculation’ Character Stats will update automatically when the value of other character stats used in their formula is changed.' },
      { key: 16, value: 'Use the ‘Choice’ Character Stats to provide a list of choices for a given stat. Enable Multi-Select and allow more than one choice selection to be set on the character.' },
      { key: 17, value: 'Save frequently rolled commands in the dice interface for quick and easy access.' },
      { key: 18, value: 'Roll any number sided die by typing in ‘d’ and that number in the command line. EXP: ‘d157’ picks a random number between 1 and 157.' },
      { key: 19, value: 'Reroll dice individually by double clicking on the corresponding die tile in the dice results screen.' },
      { key: 20, value: 'Click through multiple pages of tiles by clicking on the left and right arrows on a given page.' },
      { key: 21, value: 'Reorder Layouts & Pages in the menu by dragging to a new order position.' }
    ][Math.floor(Math.random() * 21)].value;
  }
}
