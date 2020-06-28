using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class clustertile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterCharacterStatClusterTiles",
                columns: table => new
                {
                    CharacterStatClusterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DisplayCharacterStatId = table.Column<int>(nullable: true),
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
                    table.PrimaryKey("PK_CharacterCharacterStatClusterTiles", x => x.CharacterStatClusterTileId);
                    table.ForeignKey(
                        name: "FK_CharacterCharacterStatClusterTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterCharacterStatClusterTiles_CharacterStats_DisplayCharacterStatId",
                        column: x => x.DisplayCharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatClusterTiles_CharacterTileId",
                table: "CharacterCharacterStatClusterTiles",
                column: "CharacterTileId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatClusterTiles_DisplayCharacterStatId",
                table: "CharacterCharacterStatClusterTiles",
                column: "DisplayCharacterStatId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterCharacterStatClusterTiles");
        }
    }
}
