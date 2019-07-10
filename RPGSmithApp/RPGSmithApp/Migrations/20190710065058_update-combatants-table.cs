using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updatecombatantstable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CombatInitiatives");

            migrationBuilder.DropIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings");

            migrationBuilder.CreateTable(
                name: "CombatantLists",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CombatId = table.Column<int>(nullable: true),
                    Type = table.Column<int>(nullable: false),
                    CharacterId = table.Column<int>(nullable: true),
                    MonsterId = table.Column<int>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    Initiative = table.Column<decimal>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombatantLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CombatantLists_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CombatantLists_Combats_CombatId",
                        column: x => x.CombatId,
                        principalTable: "Combats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CombatantLists_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings",
                column: "CombatId",
                unique: true,
                filter: "[CombatId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CombatantLists_CharacterId",
                table: "CombatantLists",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatantLists_CombatId",
                table: "CombatantLists",
                column: "CombatId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatantLists_MonsterId",
                table: "CombatantLists",
                column: "MonsterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CombatantLists");

            migrationBuilder.DropIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings");

            migrationBuilder.CreateTable(
                name: "CombatInitiatives",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: true),
                    CombatId = table.Column<int>(nullable: true),
                    Initiative = table.Column<decimal>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    MonsterId = table.Column<int>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombatInitiatives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_Combats_CombatId",
                        column: x => x.CombatId,
                        principalTable: "Combats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings",
                column: "CombatId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_CharacterId",
                table: "CombatInitiatives",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_CombatId",
                table: "CombatInitiatives",
                column: "CombatId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_MonsterId",
                table: "CombatInitiatives",
                column: "MonsterId");
        }
    }
}
