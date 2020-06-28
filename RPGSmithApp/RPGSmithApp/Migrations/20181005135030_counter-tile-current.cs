using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class countertilecurrent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StatCalculationIds",
                table: "CharacterStatCalcs",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentValue",
                table: "CharacterCounterTiles",
                nullable: false,
                defaultValue: 0);

            //migrationBuilder.CreateIndex(
            //    name: "IX_RuleSets_ShareCode",
            //    table: "RuleSets",
            //    column: "ShareCode",
            //    unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropIndex(
            //    name: "IX_RuleSets_ShareCode",
            //    table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "StatCalculationIds",
                table: "CharacterStatCalcs");

            migrationBuilder.DropColumn(
                name: "CurrentValue",
                table: "CharacterCounterTiles");
        }
    }
}
