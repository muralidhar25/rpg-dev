using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class linkAndExecuteTileChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BuffAndEffectId",
                table: "CharacterLinkTiles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BuffAndEffectId",
                table: "CharacterExecuteTiles",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_BuffAndEffectId",
                table: "CharacterLinkTiles",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_BuffAndEffectId",
                table: "CharacterExecuteTiles",
                column: "BuffAndEffectId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterBuffAndEffects_BuffAndEffectId",
                table: "CharacterExecuteTiles",
                column: "BuffAndEffectId",
                principalTable: "CharacterBuffAndEffects",
                principalColumn: "CharacterBuffAandEffectId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_CharacterBuffAndEffects_BuffAndEffectId",
                table: "CharacterLinkTiles",
                column: "BuffAndEffectId",
                principalTable: "CharacterBuffAndEffects",
                principalColumn: "CharacterBuffAandEffectId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_CharacterBuffAndEffects_BuffAndEffectId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_CharacterBuffAndEffects_BuffAndEffectId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterLinkTiles_BuffAndEffectId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterExecuteTiles_BuffAndEffectId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropColumn(
                name: "BuffAndEffectId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "BuffAndEffectId",
                table: "CharacterExecuteTiles");
        }
    }
}
