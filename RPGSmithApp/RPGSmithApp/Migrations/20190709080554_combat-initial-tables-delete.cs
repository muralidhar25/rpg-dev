using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class combatinitialtablesdelete : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CombatInitiatives");

            migrationBuilder.DropTable(
                name: "CombatSettings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CombatInitiatives",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CampaignID = table.Column<int>(nullable: false),
                    CharacterID = table.Column<int>(nullable: true),
                    Initiative = table.Column<decimal>(nullable: false),
                    MonsterID = table.Column<int>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombatInitiatives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_RuleSets_CampaignID",
                        column: x => x.CampaignID,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_Characters_CharacterID",
                        column: x => x.CharacterID,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CombatInitiatives_Monsters_MonsterID",
                        column: x => x.MonsterID,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CombatSettings",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CampaignID = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TypeId = table.Column<int>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombatSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CombatSettings_RuleSets_CampaignID",
                        column: x => x.CampaignID,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_CampaignID",
                table: "CombatInitiatives",
                column: "CampaignID");

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_CharacterID",
                table: "CombatInitiatives",
                column: "CharacterID");

            migrationBuilder.CreateIndex(
                name: "IX_CombatInitiatives_MonsterID",
                table: "CombatInitiatives",
                column: "MonsterID");

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CampaignID",
                table: "CombatSettings",
                column: "CampaignID");
        }
    }
}
