using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CampaignClusterTilecChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RulesetCharacterStatClusterTile",
                columns: table => new
                {
                    CharacterStatClusterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DisplayCharactersCharacterStatID = table.Column<int>(nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ClusterWithSortOrder = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetCharacterStatClusterTile", x => x.CharacterStatClusterTileId);
                    table.ForeignKey(
                        name: "FK_RulesetCharacterStatClusterTile_CharacterStats_DisplayCharactersCharacterStatID",
                        column: x => x.DisplayCharactersCharacterStatID,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RulesetCharacterStatClusterTile_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCharacterStatClusterTile_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTile",
                column: "DisplayCharactersCharacterStatID");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCharacterStatClusterTile_RulesetTileId",
                table: "RulesetCharacterStatClusterTile",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RulesetCharacterStatClusterTile");
        }
    }
}
