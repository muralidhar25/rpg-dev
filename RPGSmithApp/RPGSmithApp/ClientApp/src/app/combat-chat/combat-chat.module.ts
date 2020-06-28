import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CombatChat } from './combat-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { SharedModule } from '../shared/shared.module';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule, SharedModule, NgCircleProgressModule],
  declarations: [CombatChat, EmojifyPipe, LinkfyPipe, GroupMessageDisplayNamePipe, NgChatOptionsComponent],
  exports: [CombatChat]
})
export class CombatChatModule {
}
