using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class LastCommandRuleSet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastCommand",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastCommandResult",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastCommandTotal",
                table: "RuleSets",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LastCommandValues",
                table: "RuleSets",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastCommand",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "LastCommandResult",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "LastCommandTotal",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "LastCommandValues",
                table: "RuleSets");
        }
    }
}
