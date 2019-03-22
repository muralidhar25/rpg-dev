using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CreateBundleTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemMasterBundles",
                columns: table => new
                {
                    BundleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: true),
                    BundleName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BundleImage = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    BundleVisibleDesc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    Volume = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    TotalWeight = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rarity = table.Column<string>(type: "nvarchar(20)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterBundles", x => x.BundleId);
                    table.ForeignKey(
                        name: "FK_ItemMasterBundles_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterBundleItems",
                columns: table => new
                {
                    BundleItemId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BundleId = table.Column<int>(nullable: true),
                    ItemMasterId = table.Column<int>(nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18, 3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterBundleItems", x => x.BundleItemId);
                    table.ForeignKey(
                        name: "FK_ItemMasterBundleItems_ItemMasterBundles_BundleId",
                        column: x => x.BundleId,
                        principalTable: "ItemMasterBundles",
                        principalColumn: "BundleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemMasterBundleItems_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBundleItems_BundleId",
                table: "ItemMasterBundleItems",
                column: "BundleId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBundleItems_ItemMasterId",
                table: "ItemMasterBundleItems",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBundles_RuleSetId",
                table: "ItemMasterBundles",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemMasterBundleItems");

            migrationBuilder.DropTable(
                name: "ItemMasterBundles");
        }
    }
}
