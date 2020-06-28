using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CharacterBuffAndEffect : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterBuffAndEffects",
                columns: table => new
                {
                    CharacterBuffAandEffectId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: false),
                    BuffAndEffectID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterBuffAndEffects", x => x.CharacterBuffAandEffectId);
                    table.ForeignKey(
                        name: "FK_CharacterBuffAndEffects_BuffAndEffects_BuffAndEffectID",
                        column: x => x.BuffAndEffectID,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterBuffAndEffects_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterBuffAndEffects_BuffAndEffectID",
                table: "CharacterBuffAndEffects",
                column: "BuffAndEffectID");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterBuffAndEffects_CharacterId",
                table: "CharacterBuffAndEffects",
                column: "CharacterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterBuffAndEffects");
        }
    }
}
