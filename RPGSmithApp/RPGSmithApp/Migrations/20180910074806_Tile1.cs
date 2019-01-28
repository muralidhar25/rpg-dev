using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Tile1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_Abilities_AbilityId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_Spells_SpellId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_Abilities_AbilityId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_Spells_SpellId",
                table: "CharacterLinkTiles");

            //migrationBuilder.DropColumn(
            //    name: "BgColor",
            //    table: "Tiles");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterAbilities_AbilityId",
                table: "CharacterExecuteTiles",
                column: "AbilityId",
                principalTable: "CharacterAbilities",
                principalColumn: "CharacterAbilityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterSpells_SpellId",
                table: "CharacterExecuteTiles",
                column: "SpellId",
                principalTable: "CharacterSpells",
                principalColumn: "CharacterSpellId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_CharacterAbilities_AbilityId",
                table: "CharacterLinkTiles",
                column: "AbilityId",
                principalTable: "CharacterAbilities",
                principalColumn: "CharacterAbilityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_CharacterSpells_SpellId",
                table: "CharacterLinkTiles",
                column: "SpellId",
                principalTable: "CharacterSpells",
                principalColumn: "CharacterSpellId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterAbilities_AbilityId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterSpells_SpellId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_CharacterAbilities_AbilityId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_CharacterSpells_SpellId",
                table: "CharacterLinkTiles");

            //migrationBuilder.AddColumn<string>(
            //    name: "BgColor",
            //    table: "Tiles",
            //    type: "nvarchar(50)",
            //    maxLength: 50,
            //    nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_Abilities_AbilityId",
                table: "CharacterExecuteTiles",
                column: "AbilityId",
                principalTable: "Abilities",
                principalColumn: "AbilityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_Spells_SpellId",
                table: "CharacterExecuteTiles",
                column: "SpellId",
                principalTable: "Spells",
                principalColumn: "SpellId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_Abilities_AbilityId",
                table: "CharacterLinkTiles",
                column: "AbilityId",
                principalTable: "Abilities",
                principalColumn: "AbilityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_Spells_SpellId",
                table: "CharacterLinkTiles",
                column: "SpellId",
                principalTable: "Spells",
                principalColumn: "SpellId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
