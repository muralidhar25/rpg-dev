using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class combatinitialtablesupdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Combats",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CampaignId = table.Column<int>(nullable: true),
                    IsStarted = table.Column<bool>(nullable: false),
                    Round = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Combats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Combats_RuleSets_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CombatInitiatives",
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

            migrationBuilder.CreateTable(
                name: "CombatSettings",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CombatId = table.Column<int>(nullable: true),
                    PcInitiativeFormula = table.Column<string>(nullable: true),
                    RollInitiativeForPlayer = table.Column<bool>(nullable: false),
                    RollInitiativeEveryRound = table.Column<bool>(nullable: false),
                    GameRoundLength = table.Column<int>(nullable: false),
                    XPDistributionforDeletedMonster = table.Column<bool>(nullable: false),
                    CharcterXpStats = table.Column<string>(nullable: true),
                    CharcterHealthStats = table.Column<string>(nullable: true),
                    AccessMonsterDetails = table.Column<bool>(nullable: false),
                    GroupInitiative = table.Column<bool>(nullable: false),
                    GroupInitFormula = table.Column<string>(nullable: true),
                    DropItemsForDeletedMonsters = table.Column<bool>(nullable: false),
                    MonsterVisibleByDefault = table.Column<bool>(nullable: false),
                    DisplayMonsterRollResultInChat = table.Column<bool>(nullable: false),
                    ShowMonsterHealth = table.Column<bool>(nullable: false),
                    SeeMonsterBuffEffects = table.Column<bool>(nullable: false),
                    SeeMonsterItems = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombatSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CombatSettings_Combats_CombatId",
                        column: x => x.CombatId,
                        principalTable: "Combats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Combats_CampaignId",
                table: "Combats",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings",
                column: "CombatId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CombatInitiatives");

            migrationBuilder.DropTable(
                name: "CombatSettings");

            migrationBuilder.DropTable(
                name: "Combats");
        }
    }
}
