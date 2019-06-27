using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class add_loot_Column_to_Item : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CopiedLootID",
                table: "Items",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CopiedLootID",
                table: "Items");
        }
    }
}
