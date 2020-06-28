using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CharacterCurrencyall889 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemMasterLootCurrency",
                columns: table => new
                {
                    ItemMasterLootCurrencyId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    BaseUnit = table.Column<decimal>(nullable: false),
                    WeightValue = table.Column<decimal>(nullable: false),
                    SortOrder = table.Column<int>(nullable: true),
                    LootId = table.Column<int>(nullable: false),
                    CurrencyTypeId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLootCurrency", x => x.ItemMasterLootCurrencyId);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootCurrency_ItemMasterLoots_LootId",
                        column: x => x.LootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LootTemplateCurrency",
                columns: table => new
                {
                    LootTemplateCurrencyId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    LootTemplateId = table.Column<int>(nullable: false),
                    CurrencyTypeId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    BaseUnit = table.Column<decimal>(nullable: false),
                    WeightValue = table.Column<decimal>(nullable: false),
                    SortOrder = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootTemplateCurrency", x => x.LootTemplateCurrencyId);
                    table.ForeignKey(
                        name: "FK_LootTemplateCurrency_LootTemplates_LootTemplateId",
                        column: x => x.LootTemplateId,
                        principalTable: "LootTemplates",
                        principalColumn: "LootTemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonsterCurrency",
                columns: table => new
                {
                    MonsterCurrencyId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    BaseUnit = table.Column<decimal>(nullable: false),
                    WeightValue = table.Column<decimal>(nullable: false),
                    SortOrder = table.Column<int>(nullable: true),
                    MonsterId = table.Column<int>(nullable: false),
                    CurrencyTypeId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterCurrency", x => x.MonsterCurrencyId);
                    table.ForeignKey(
                        name: "FK_MonsterCurrency_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateCurrency",
                columns: table => new
                {
                    MonsterTemplateCurrencyId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    BaseUnit = table.Column<decimal>(nullable: false),
                    WeightValue = table.Column<decimal>(nullable: false),
                    SortOrder = table.Column<int>(nullable: true),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    CurrencyTypeId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateCurrency", x => x.MonsterTemplateCurrencyId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateCurrency_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootCurrency_LootId",
                table: "ItemMasterLootCurrency",
                column: "LootId");

            migrationBuilder.CreateIndex(
                name: "IX_LootTemplateCurrency_LootTemplateId",
                table: "LootTemplateCurrency",
                column: "LootTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterCurrency_MonsterId",
                table: "MonsterCurrency",
                column: "MonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateCurrency_MonsterTemplateId",
                table: "MonsterTemplateCurrency",
                column: "MonsterTemplateId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemMasterLootCurrency");

            migrationBuilder.DropTable(
                name: "LootTemplateCurrency");

            migrationBuilder.DropTable(
                name: "MonsterCurrency");

            migrationBuilder.DropTable(
                name: "MonsterTemplateCurrency");
        }
    }
}
