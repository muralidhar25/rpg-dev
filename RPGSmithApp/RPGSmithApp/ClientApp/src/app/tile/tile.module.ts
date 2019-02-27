import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TileComponent } from './tile.component';
import { NoteTileComponent } from './note/note.component';
import { CounterTileComponent } from './counter/counter.component';
import { CharacterStatTileComponent } from './character-stat/character-stat.component';
import { LinkTileComponent } from './link/link.component';
import { CommandTileComponent } from './command/command.component';
import { ImageTileComponent } from './image/image.component';
import { ExecuteTileComponent } from './execute/execute.component';
import { ColorsComponent } from './colors/colors.component';
import { EditNoteComponent } from './note/edit-note/edit-note.component';
import { EditImageComponent } from './image/edit-image/edit-image.component';
import { EditCounterComponent } from './counter/edit-counter/edit-counter.component';
import { EditCharacterStatComponent } from './character-stat/edit-character-stat/edit-character-stat.component';
import { UseLinkComponent } from './link/use-link/use-link.component';
import { UseExecuteComponent } from './execute/use-execute/use-execute.component';
import { TextTileComponent } from './text/text.component';
import { EditTextComponent } from './text/edit-text/edit-text.component';

@NgModule({
  declarations: [
    TileComponent,
    NoteTileComponent,
    CounterTileComponent,
    CharacterStatTileComponent,
    LinkTileComponent,
    CommandTileComponent,
    ImageTileComponent,
    ExecuteTileComponent,
    ColorsComponent,
    EditNoteComponent,
    EditImageComponent,
    EditCounterComponent,
    EditCharacterStatComponent,
    UseLinkComponent,
    UseExecuteComponent,
    TextTileComponent,
    EditTextComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
  ],
  exports: [
    TileComponent,
    NoteTileComponent,
    CounterTileComponent,
    CharacterStatTileComponent,
    LinkTileComponent,
    CommandTileComponent,
    ImageTileComponent,
    ExecuteTileComponent,
    ColorsComponent,
    EditNoteComponent,
    EditImageComponent,
    EditCounterComponent,
    EditCharacterStatComponent,
    UseLinkComponent,
    UseExecuteComponent,
    TextTileComponent,
    EditTextComponent
  ],
  entryComponents: [
    TileComponent,
    NoteTileComponent,
    CounterTileComponent,
    CharacterStatTileComponent,
    LinkTileComponent,
    CommandTileComponent,
    ImageTileComponent,
    ColorsComponent,
    ExecuteTileComponent,
    EditNoteComponent,
    EditImageComponent,
    EditCounterComponent,
    EditCharacterStatComponent,
    UseLinkComponent,
    UseExecuteComponent,
    TextTileComponent,
    EditTextComponent
  ]
})
export class TileModule {}
