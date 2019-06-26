using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class monsterTemplateBundle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MonsterTemplateBundles",
                columns: table => new
                {
                    BundleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: true),
                    BundleName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BundleImage = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    BundleVisibleDesc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentMonsterTemplateBundleId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateBundles", x => x.BundleId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBundles_MonsterTemplateBundles_ParentMonsterTemplateBundleId",
                        column: x => x.ParentMonsterTemplateBundleId,
                        principalTable: "MonsterTemplateBundles",
                        principalColumn: "BundleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBundles_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateBundleItems",
                columns: table => new
                {
                    BundleItemId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BundleId = table.Column<int>(nullable: true),
                    MonsterTemplateId = table.Column<int>(nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18, 3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateBundleItems", x => x.BundleItemId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBundleItems_MonsterTemplateBundles_BundleId",
                        column: x => x.BundleId,
                        principalTable: "MonsterTemplateBundles",
                        principalColumn: "BundleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBundleItems_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBundleItems_BundleId",
                table: "MonsterTemplateBundleItems",
                column: "BundleId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBundleItems_MonsterTemplateId",
                table: "MonsterTemplateBundleItems",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBundles_ParentMonsterTemplateBundleId",
                table: "MonsterTemplateBundles",
                column: "ParentMonsterTemplateBundleId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBundles_RuleSetId",
                table: "MonsterTemplateBundles",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonsterTemplateBundleItems");

            migrationBuilder.DropTable(
                name: "MonsterTemplateBundles");
        }
    }
}
