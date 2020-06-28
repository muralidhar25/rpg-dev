using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class UpdateCharCustomToggleRelation_fix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.DropColumn(
                name: "CharacterCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.AlterColumn<int>(
                name: "CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                column: "CharactersCharacterStatId",
                principalTable: "CharactersCharacterStats",
                principalColumn: "CharactersCharacterStatId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle");

            migrationBuilder.AlterColumn<int>(
                name: "CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddColumn<int>(
                name: "CharacterCharacterStatId",
                table: "CharacterCustomToggle",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterCustomToggle_CharactersCharacterStats_CharactersCharacterStatId",
                table: "CharacterCustomToggle",
                column: "CharactersCharacterStatId",
                principalTable: "CharactersCharacterStats",
                principalColumn: "CharactersCharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
