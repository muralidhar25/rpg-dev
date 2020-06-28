using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class weightlabelcurrency : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WeightLabel",
                table: "CurrencyTypes",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeightLabel",
                table: "CharacterCurrency",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WeightLabel",
                table: "CurrencyTypes");

            migrationBuilder.DropColumn(
                name: "WeightLabel",
                table: "CharacterCurrency");
        }
    }
}
