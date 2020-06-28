using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class craeteTextTileTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterTextTiles",
                columns: table => new
                {
                    TextTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Text = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
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
                    table.PrimaryKey("PK_CharacterTextTiles", x => x.TextTileId);
                    table.ForeignKey(
                        name: "FK_CharacterTextTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetTextTiles",
                columns: table => new
                {
                    TextTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Text = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
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
                    table.PrimaryKey("PK_RulesetTextTiles", x => x.TextTileId);
                    table.ForeignKey(
                        name: "FK_RulesetTextTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterTextTiles_CharacterTileId",
                table: "CharacterTextTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTextTiles_RulesetTileId",
                table: "RulesetTextTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterTextTiles");

            migrationBuilder.DropTable(
                name: "RulesetTextTiles");
        }
    }
}
