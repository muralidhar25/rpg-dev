using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class remove_buffandeffectfortilesId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuffAndEffectIdsForTiles");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BuffAndEffectIdsForTiles",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BuffAndEffectTileId = table.Column<int>(nullable: false),
                    CharacterBuffAndEffectId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuffAndEffectIdsForTiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuffAndEffectIdsForTiles_CharacterBuffAndEffectTiles_BuffAndEffectTileId",
                        column: x => x.BuffAndEffectTileId,
                        principalTable: "CharacterBuffAndEffectTiles",
                        principalColumn: "BuffAndEffectTileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BuffAndEffectIdsForTiles_CharacterBuffAndEffects_CharacterBuffAndEffectId",
                        column: x => x.CharacterBuffAndEffectId,
                        principalTable: "CharacterBuffAndEffects",
                        principalColumn: "CharacterBuffAandEffectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuffAndEffectIdsForTiles_BuffAndEffectTileId",
                table: "BuffAndEffectIdsForTiles",
                column: "BuffAndEffectTileId");

            migrationBuilder.CreateIndex(
                name: "IX_BuffAndEffectIdsForTiles_CharacterBuffAndEffectId",
                table: "BuffAndEffectIdsForTiles",
                column: "CharacterBuffAndEffectId");
        }
    }
}
