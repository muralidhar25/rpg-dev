using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class associate_buff_records : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CharacterBuffAndEffectTiles_CharacterTileId",
                table: "CharacterBuffAndEffectTiles");

            migrationBuilder.CreateTable(
                name: "AbilityBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AbilityId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbilityBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AbilityBuffAndEffects_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_AbilityBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemBuffAndEffects_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterBuffAndEffects_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "SpellBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SpellId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpellBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpellBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_SpellBuffAndEffects_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterBuffAndEffectTiles_CharacterTileId",
                table: "CharacterBuffAndEffectTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AbilityBuffAndEffects_AbilityId",
                table: "AbilityBuffAndEffects",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_AbilityBuffAndEffects_BuffAndEffectId",
                table: "AbilityBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemBuffAndEffects_BuffAndEffectId",
                table: "ItemBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemBuffAndEffects_ItemId",
                table: "ItemBuffAndEffects",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBuffAndEffects_BuffAndEffectId",
                table: "ItemMasterBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBuffAndEffects_ItemMasterId",
                table: "ItemMasterBuffAndEffects",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_SpellBuffAndEffects_BuffAndEffectId",
                table: "SpellBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_SpellBuffAndEffects_SpellId",
                table: "SpellBuffAndEffects",
                column: "SpellId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AbilityBuffAndEffects");

            migrationBuilder.DropTable(
                name: "ItemBuffAndEffects");

            migrationBuilder.DropTable(
                name: "ItemMasterBuffAndEffects");

            migrationBuilder.DropTable(
                name: "SpellBuffAndEffects");

            migrationBuilder.DropIndex(
                name: "IX_CharacterBuffAndEffectTiles_CharacterTileId",
                table: "CharacterBuffAndEffectTiles");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterBuffAndEffectTiles_CharacterTileId",
                table: "CharacterBuffAndEffectTiles",
                column: "CharacterTileId");
        }
    }
}
