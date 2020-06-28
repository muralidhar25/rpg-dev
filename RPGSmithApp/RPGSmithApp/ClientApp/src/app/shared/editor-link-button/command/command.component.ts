import { Component, OnInit, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { DBkeys } from '../../../core/common/db-keys';
import { DiceComponent } from '../../dice/dice/dice.component';
import { User } from '../../../core/models/user.model';
import { PlatformLocation } from '@angular/common';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class EditorCommandComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();

  commandTitle: string;
  commandContent: any;
  isLoading: boolean;

  title: string;
  imageUrl: string;
  characterId: number;
  editorHtml: any;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private location: PlatformLocation,
    private sharedService: SharedService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.commandTitle = this.bsModalRef.content.commandTitle ? this.bsModalRef.content.commandTitle:'';
      this.commandContent = this.bsModalRef.content.commandContent ? this.bsModalRef.content.commandContent : '';
      this.editorHtml = this.bsModalRef.content.editor;

      this.Initialize();
      try {
        document.getElementsByClassName('modal-md modal-with-max-zindex')[0].parentElement.style.zIndex = '99999999999';
      } catch (e) {

      }
    }, 0);
  }

  private Initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
  }

  submitForm() {
    this.close();
    if (this.commandContent) {
      if (this.commandTitle) {
        //this.event.emit('<a class="Editor_Command a-hyperLink" data-Editor="' + this.commandContent + '">' + this.commandTitle + '</a>');
        this.sharedService.updateEditorCommand({
          htmlToInsert: '<a class="Editor_Command a-hyperLink" data-Editor="' + this.commandContent + '">' + this.commandTitle + '</a>',
          htmlEditor: this.editorHtml});
      } else {
        //this.event.emit('<a class="Editor_Command a-hyperLink" data-Editor="' + this.commandContent + '">' + this.commandContent + '</a>');
        this.sharedService.updateEditorCommand({
          htmlToInsert: '<a class="Editor_Command a-hyperLink" data-Editor="' + this.commandContent + '">' + this.commandContent + '</a>',
          htmlEditor: this.editorHtml
        });
      }      
    }
  }

  close() {
    this.bsModalRef.hide();
    //this.destroyModalOnInit()
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  openDiceModal(index, command) {

  this.close();
    this.bsModalRef = this.modalService.show(DiceComponent, {
      class: 'modal-primary modal-md dice-screen modal-with-max-zindex',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.parentCommand = command;
    this.bsModalRef.content.inputIndex = index;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.isFromEditor = true;
    this.bsModalRef.content.commandTitle = this.commandTitle;
    this.bsModalRef.content.commandContent = this.commandContent;
    this.bsModalRef.content.editor = this.editorHtml;
    this.bsModalRef.content.closeevent.subscribe(diceCommand => {
      this.commandContent = diceCommand.command;
    });
  }


}
