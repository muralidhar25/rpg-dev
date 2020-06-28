using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class UpdateChoiceCharStatColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsChoiceNumeric",
                table: "CharacterStats",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsChoicesFromAnotherStat",
                table: "CharacterStats",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsChoiceNumeric",
                table: "CharacterStats");

            migrationBuilder.DropColumn(
                name: "IsChoicesFromAnotherStat",
                table: "CharacterStats");
        }
    }
}
