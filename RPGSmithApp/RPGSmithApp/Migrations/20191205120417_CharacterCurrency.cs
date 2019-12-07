using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CharacterCurrency : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CharacterCurrencyTypeTiles_CharacterTileId",
                table: "CharacterCurrencyTypeTiles");

            migrationBuilder.CreateTable(
                name: "CharacterCurrency",
                columns: table => new
                {
                    CharacterCurrencyId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    BaseUnit = table.Column<decimal>(nullable: false),
                    WeightValue = table.Column<decimal>(nullable: false),
                    SortOrder = table.Column<int>(nullable: true),
                    CurrencyTypeId = table.Column<int>(nullable: false),
                    CharacterId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCurrency", x => x.CharacterCurrencyId);
                    table.ForeignKey(
                        name: "FK_CharacterCurrency_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCurrencyTypeTiles_CharacterTileId",
                table: "CharacterCurrencyTypeTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCurrency_CharacterId",
                table: "CharacterCurrency",
                column: "CharacterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterCurrency");

            migrationBuilder.DropIndex(
                name: "IX_CharacterCurrencyTypeTiles_CharacterTileId",
                table: "CharacterCurrencyTypeTiles");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCurrencyTypeTiles_CharacterTileId",
                table: "CharacterCurrencyTypeTiles",
                column: "CharacterTileId");
        }
    }
}
