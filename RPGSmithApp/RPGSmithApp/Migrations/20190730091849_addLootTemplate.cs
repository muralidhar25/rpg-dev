using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addLootTemplate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LootTemplates",
                columns: table => new
                {
                    LootTemplateId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootTemplates", x => x.LootTemplateId);
                    table.ForeignKey(
                        name: "FK_LootTemplates_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "LootTemplateRandomizationEngines",
                columns: table => new
                {
                    RandomizationEngineId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    LootTemplateId = table.Column<int>(nullable: false),
                    Percentage = table.Column<decimal>(nullable: false),
                    Qty = table.Column<string>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    ItemMasterId = table.Column<int>(nullable: false),
                    IsOr = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootTemplateRandomizationEngines", x => x.RandomizationEngineId);
                    table.ForeignKey(
                        name: "FK_LootTemplateRandomizationEngines_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_LootTemplateRandomizationEngines_LootTemplates_LootTemplateId",
                        column: x => x.LootTemplateId,
                        principalTable: "LootTemplates",
                        principalColumn: "LootTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LootTemplateRandomizationEngines_ItemMasterId",
                table: "LootTemplateRandomizationEngines",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_LootTemplateRandomizationEngines_LootTemplateId",
                table: "LootTemplateRandomizationEngines",
                column: "LootTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_LootTemplates_RuleSetId",
                table: "LootTemplates",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LootTemplateRandomizationEngines");

            migrationBuilder.DropTable(
                name: "LootTemplates");
        }
    }
}
