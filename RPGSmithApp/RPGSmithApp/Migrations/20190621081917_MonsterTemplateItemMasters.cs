using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class MonsterTemplateItemMasters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MonsterTemplateItemMasters",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    ItemMasterId = table.Column<int>(nullable: false),
                    Qty = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateItemMasters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateItemMasters_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateItemMasters_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateItemMasters_ItemMasterId",
                table: "MonsterTemplateItemMasters",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateItemMasters_MonsterTemplateId",
                table: "MonsterTemplateItemMasters",
                column: "MonsterTemplateId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonsterTemplateItemMasters");
        }
    }
}
