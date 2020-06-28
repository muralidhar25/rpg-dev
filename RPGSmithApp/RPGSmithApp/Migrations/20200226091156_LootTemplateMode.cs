using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class LootTemplateMode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Mode",
                table: "MonsterTemplates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mode",
                table: "LootTemplates",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mode",
                table: "MonsterTemplates");

            migrationBuilder.DropColumn(
                name: "Mode",
                table: "LootTemplates");

        }
    }
}
