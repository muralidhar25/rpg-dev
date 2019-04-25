using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class loot_Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "PlayerInvites",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ItemMasterLoots",
                columns: table => new
                {
                    LootId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterId = table.Column<int>(nullable: false),
                    IsShow = table.Column<bool>(nullable: false),
                    ContainedIn = table.Column<int>(nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    IsIdentified = table.Column<bool>(nullable: true),
                    IsVisible = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLoots", x => x.LootId);
                    table.ForeignKey(
                        name: "FK_ItemMasterLoots_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLoots_ItemMasterId",
                table: "ItemMasterLoots",
                column: "ItemMasterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "PlayerInvites");
        }
    }
}
