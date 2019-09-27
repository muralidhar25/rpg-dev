using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Update_Link_Execute_Tile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AllyId",
                table: "CharacterLinkTiles",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AllyId",
                table: "CharacterExecuteTiles",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_AllyId",
                table: "CharacterLinkTiles",
                column: "AllyId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_AllyId",
                table: "CharacterExecuteTiles",
                column: "AllyId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterExecuteTiles_Monsters_AllyId",
                table: "CharacterExecuteTiles",
                column: "AllyId",
                principalTable: "Monsters",
                principalColumn: "MonsterId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterLinkTiles_Monsters_AllyId",
                table: "CharacterLinkTiles",
                column: "AllyId",
                principalTable: "Monsters",
                principalColumn: "MonsterId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterExecuteTiles_Monsters_AllyId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_CharacterLinkTiles_Monsters_AllyId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterLinkTiles_AllyId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterExecuteTiles_AllyId",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropColumn(
                name: "AllyId",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "AllyId",
                table: "CharacterExecuteTiles");
        }
    }
}
