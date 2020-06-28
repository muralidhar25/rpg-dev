using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class UpdateCharacterStatToggleRemoveCustomToggleField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomToggleId",
                table: "CharacterStatToggle");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomToggleId",
                table: "CharacterStatToggle",
                nullable: false,
                defaultValue: 0);
        }
    }
}
