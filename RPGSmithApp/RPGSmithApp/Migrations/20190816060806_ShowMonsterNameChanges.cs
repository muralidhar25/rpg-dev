using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class ShowMonsterNameChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowMonsterNameByDefault",
                table: "CombatSettings",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowMonsterName",
                table: "CombatantLists",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowMonsterNameByDefault",
                table: "CombatSettings");

            migrationBuilder.DropColumn(
                name: "ShowMonsterName",
                table: "CombatantLists");
        }
    }
}
