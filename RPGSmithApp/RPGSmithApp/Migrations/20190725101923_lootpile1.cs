using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class lootpile1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LootPiles",
                columns: table => new
                {
                    LootPileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Visible = table.Column<bool>(nullable: false),
                    CharacterID = table.Column<int>(nullable: true),
                    MonsterID = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootPiles", x => x.LootPileId);
                    table.ForeignKey(
                        name: "FK_LootPiles_Characters_CharacterID",
                        column: x => x.CharacterID,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LootPiles_Monsters_MonsterID",
                        column: x => x.MonsterID,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LootPiles_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "LootPileLootItems",
                columns: table => new
                {
                    LootPileLootItemId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    LootPileId = table.Column<int>(nullable: false),
                    LootId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootPileLootItems", x => x.LootPileLootItemId);
                    table.ForeignKey(
                        name: "FK_LootPileLootItems_ItemMasterLoots_LootId",
                        column: x => x.LootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_LootPileLootItems_LootPiles_LootPileId",
                        column: x => x.LootPileId,
                        principalTable: "LootPiles",
                        principalColumn: "LootPileId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LootPileLootItems_LootId",
                table: "LootPileLootItems",
                column: "LootId");

            migrationBuilder.CreateIndex(
                name: "IX_LootPileLootItems_LootPileId",
                table: "LootPileLootItems",
                column: "LootPileId");

            migrationBuilder.CreateIndex(
                name: "IX_LootPiles_CharacterID",
                table: "LootPiles",
                column: "CharacterID");

            migrationBuilder.CreateIndex(
                name: "IX_LootPiles_MonsterID",
                table: "LootPiles",
                column: "MonsterID");

            migrationBuilder.CreateIndex(
                name: "IX_LootPiles_RuleSetId",
                table: "LootPiles",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LootPileLootItems");

            migrationBuilder.DropTable(
                name: "LootPiles");
        }
    }
}
