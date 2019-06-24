using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class monster_associateItem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemMasterMonsterItems",
                columns: table => new
                {
                    ItemId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterId = table.Column<int>(nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18, 3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterMonsterItems", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItems_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItems_ItemMasterId",
                table: "ItemMasterMonsterItems",
                column: "ItemMasterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemMasterMonsterItems");
        }
    }
}
