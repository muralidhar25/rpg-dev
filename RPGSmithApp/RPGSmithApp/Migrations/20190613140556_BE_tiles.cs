using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class BE_tiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterBuffAndEffectTiles",
                columns: table => new
                {
                    BuffAndEffectTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    DisplayLinkImage = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterBuffAndEffectTiles", x => x.BuffAndEffectTileId);
                    table.ForeignKey(
                        name: "FK_CharacterBuffAndEffectTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_CharacterBuffAndEffectTiles_CharacterTileId",
                table: "CharacterBuffAndEffectTiles",
                column: "CharacterTileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuffAndEffectIdsForTiles");

            migrationBuilder.DropTable(
                name: "CharacterBuffAndEffectTiles");
        }
    }
}
