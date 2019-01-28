using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class UpdateCharCustomToggleRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharactersCharacterStats_CharacterCustomToggle_CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.DropIndex(
                name: "IX_CharactersCharacterStats_CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.AddColumn<int>(
                name: "CharacterCharacterStatId",
                table: "CharacterCustomToggle",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCustomToggle_CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                column: "CharactersCharacterStatId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                column: "CharactersCharacterStatId",
                principalTable: "CharactersCharacterStats",
                principalColumn: "CharactersCharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.DropIndex(
                name: "IX_CharacterCustomToggle_CharactersCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.DropColumn(
                name: "CharacterCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.DropColumn(
                name: "CharactersCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.AddColumn<int>(
                name: "CustomToggleId",
                table: "CharactersCharacterStats",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharactersCharacterStats_CustomToggleId",
                table: "CharactersCharacterStats",
                column: "CustomToggleId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharactersCharacterStats_CharacterCustomToggle_CustomToggleId",
                table: "CharactersCharacterStats",
                column: "CustomToggleId",
                principalTable: "CharacterCustomToggle",
                principalColumn: "CustomToggleId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
