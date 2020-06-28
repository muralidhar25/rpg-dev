using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class charcharStatcombo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ComboText",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DefaultValue",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Minimum",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ComboText",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "DefaultValue",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "Minimum",
                table: "CharactersCharacterStats");
        }
    }
}
