using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class currencytiletable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterCurrencyTypeTiles",
                columns: table => new
                {
                    CurrencyTypeTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
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
                    table.PrimaryKey("PK_CharacterCurrencyTypeTiles", x => x.CurrencyTypeTileId);
                    table.ForeignKey(
                        name: "FK_CharacterCurrencyTypeTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetCurrencyTypeTiles",
                columns: table => new
                {
                    CurrencyTypeTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    RulesetTileId = table.Column<int>(nullable: true),
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
                    table.PrimaryKey("PK_RulesetCurrencyTypeTiles", x => x.CurrencyTypeTileId);
                    table.ForeignKey(
                        name: "FK_RulesetCurrencyTypeTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCurrencyTypeTiles_CharacterTileId",
                table: "CharacterCurrencyTypeTiles",
                column: "CharacterTileId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCurrencyTypeTiles_RulesetTileId",
                table: "RulesetCurrencyTypeTiles",
                column: "RulesetTileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterCurrencyTypeTiles");

            migrationBuilder.DropTable(
                name: "RulesetCurrencyTypeTiles");
        }
    }
}
