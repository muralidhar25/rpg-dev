using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Add_LogStatUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LogStatUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterStatId = table.Column<int>(nullable: true),
                    CharacterId = table.Column<int>(nullable: true),
                    RuleSetId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogStatUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LogStatUpdates_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LogStatUpdates_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LogStatUpdates_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LogStatUpdates_CharacterId",
                table: "LogStatUpdates",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_LogStatUpdates_CharacterStatId",
                table: "LogStatUpdates",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_LogStatUpdates_RuleSetId",
                table: "LogStatUpdates",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LogStatUpdates");
        }
    }
}
