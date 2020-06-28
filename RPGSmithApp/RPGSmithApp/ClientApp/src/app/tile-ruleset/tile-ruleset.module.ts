import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';
import { RulesetTileComponent } from './tile.component';
import { RulesetNoteTileComponent } from './note/note.component';
import { RulesetEditNoteComponent } from './note/edit-note/edit-note.component';
import { RulesetImageTileComponent } from './image/image.component';
import { RulesetEditImageComponent } from './image/edit-image/edit-image.component';
import { RulesetCounterTileComponent } from './counter/counter.component';
import { RulesetEditCounterComponent } from './counter/edit-counter/edit-counter.component';
import { RulesetCommandTileComponent } from './command/command.component';
import { RulesetCharacterStatTileComponent } from './character-stat/character-stat.component';
import { RulesetEditCharacterStatComponent } from './character-stat/edit-character-stat/edit-character-stat.component';
import { RulesetTextTileComponent } from './text/text.component';
import { RulesetEditTextComponent } from './text/edit-text/edit-text.component';
import { RulesetBuffAndEffectTileComponent } from "./buff-and-effect/buff-and-effect.component";
import { RulesetToggleTileComponent } from "./toggle/toggle.component";
import { EditRulesetCharacterStatClusterComponent } from "./character-stat-cluster/edit-character-stat-cluster/edit-character-stat-cluster.component";
import { RulesetCharacterStatClusterTileComponent } from "./character-stat-cluster/character-stat-cluster.component";


@NgModule({
  declarations: [
    RulesetTileComponent,
    RulesetNoteTileComponent,
    RulesetEditNoteComponent,
    RulesetImageTileComponent,
    RulesetEditImageComponent,
    RulesetCounterTileComponent,
    RulesetEditCounterComponent,
    RulesetCommandTileComponent,
    RulesetCharacterStatTileComponent,
    RulesetEditCharacterStatComponent,
    RulesetTextTileComponent,
    RulesetEditTextComponent, RulesetBuffAndEffectTileComponent,
    RulesetToggleTileComponent,
    RulesetCharacterStatClusterTileComponent,
    EditRulesetCharacterStatClusterComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
  ],
  exports: [
    RulesetTileComponent,
    RulesetNoteTileComponent,
    RulesetEditNoteComponent,
    RulesetImageTileComponent,
    RulesetEditImageComponent,
    RulesetCounterTileComponent,
    RulesetEditCounterComponent,
    RulesetCommandTileComponent,
    RulesetCharacterStatTileComponent,
    RulesetEditCharacterStatComponent,
    RulesetTextTileComponent,
    RulesetEditTextComponent, RulesetBuffAndEffectTileComponent,
    RulesetToggleTileComponent,
    RulesetCharacterStatClusterTileComponent,
    EditRulesetCharacterStatClusterComponent
  ],
  entryComponents: [
    RulesetTileComponent,
    RulesetNoteTileComponent,
    RulesetEditNoteComponent,
    RulesetImageTileComponent,
    RulesetEditImageComponent,
    RulesetCounterTileComponent,
    RulesetEditCounterComponent,
    RulesetCommandTileComponent,
    RulesetCharacterStatTileComponent,
    RulesetEditCharacterStatComponent,
    RulesetTextTileComponent,
    RulesetEditTextComponent, RulesetBuffAndEffectTileComponent,
    RulesetToggleTileComponent,
    RulesetCharacterStatClusterTileComponent,
    EditRulesetCharacterStatClusterComponent
  ]
})
export class TileRulesetModule {}
