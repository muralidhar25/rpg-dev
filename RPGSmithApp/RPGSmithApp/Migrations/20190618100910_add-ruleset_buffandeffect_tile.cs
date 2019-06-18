using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addruleset_buffandeffect_tile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RulesetBuffAndEffectTiles",
                columns: table => new
                {
                    BuffAndEffectTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
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
                    table.PrimaryKey("PK_RulesetBuffAndEffectTiles", x => x.BuffAndEffectTileId);
                    table.ForeignKey(
                        name: "FK_RulesetBuffAndEffectTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RulesetBuffAndEffectTiles_RulesetTileId",
                table: "RulesetBuffAndEffectTiles",
                column: "RulesetTileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RulesetBuffAndEffectTiles");
        }
    }
}
