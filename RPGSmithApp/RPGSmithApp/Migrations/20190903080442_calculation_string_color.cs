using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class calculation_string_color : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastCommandResultColor",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastCommandResultColor",
                table: "Characters",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastCommandResultColor",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "LastCommandResultColor",
                table: "Characters");
        }
    }
}
