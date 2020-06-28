using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class toggletile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TileToggles",
                columns: table => new
                {
                    TileToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    YesNo = table.Column<bool>(nullable: false),
                    OnOff = table.Column<bool>(nullable: false),
                    Display = table.Column<bool>(nullable: false),
                    ShowCheckbox = table.Column<bool>(nullable: false),
                    IsCustom = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TileToggles", x => x.TileToggleId);
                });

            migrationBuilder.CreateTable(
                name: "CharacterToggleTiles",
                columns: table => new
                {
                    ToggleTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    TileToggleId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterToggleTiles", x => x.ToggleTileId);
                    table.ForeignKey(
                        name: "FK_CharacterToggleTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterToggleTiles_TileToggles_TileToggleId",
                        column: x => x.TileToggleId,
                        principalTable: "TileToggles",
                        principalColumn: "TileToggleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetToggleTiles",
                columns: table => new
                {
                    ToggleTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    TileToggleId = table.Column<int>(nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetToggleTiles", x => x.ToggleTileId);
                    table.ForeignKey(
                        name: "FK_RulesetToggleTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RulesetToggleTiles_TileToggles_TileToggleId",
                        column: x => x.TileToggleId,
                        principalTable: "TileToggles",
                        principalColumn: "TileToggleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TileCustomToggles",
                columns: table => new
                {
                    TileCustomToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ToggleText = table.Column<string>(nullable: true),
                    Image = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TileToggleId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TileCustomToggles", x => x.TileCustomToggleId);
                    table.ForeignKey(
                        name: "FK_TileCustomToggles_TileToggles_TileToggleId",
                        column: x => x.TileToggleId,
                        principalTable: "TileToggles",
                        principalColumn: "TileToggleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterToggleTiles_CharacterTileId",
                table: "CharacterToggleTiles",
                column: "CharacterTileId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterToggleTiles_TileToggleId",
                table: "CharacterToggleTiles",
                column: "TileToggleId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetToggleTiles_RulesetTileId",
                table: "RulesetToggleTiles",
                column: "RulesetTileId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetToggleTiles_TileToggleId",
                table: "RulesetToggleTiles",
                column: "TileToggleId");

            migrationBuilder.CreateIndex(
                name: "IX_TileCustomToggles_TileToggleId",
                table: "TileCustomToggles",
                column: "TileToggleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterToggleTiles");

            migrationBuilder.DropTable(
                name: "RulesetToggleTiles");

            migrationBuilder.DropTable(
                name: "TileCustomToggles");

            migrationBuilder.DropTable(
                name: "TileToggles");
        }
    }
}
