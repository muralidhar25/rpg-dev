using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Monsters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropIndex(
            //    name: "IX_RulesetBuffAndEffectTiles_RulesetTileId",
            //    table: "RulesetBuffAndEffectTiles");

            migrationBuilder.CreateTable(
                name: "MonsterTemplates",
                columns: table => new
                {
                    MonsterTemplateId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Command = table.Column<string>(nullable: true),
                    CommandName = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Stats = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentMonsterTemplateId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    Health = table.Column<string>(nullable: true),
                    ArmorClass = table.Column<string>(nullable: true),
                    XPValue = table.Column<string>(nullable: true),
                    ChallangeRating = table.Column<string>(nullable: true),
                    InitiativeCommand = table.Column<string>(nullable: true),
                    IsRandomizationEngine = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplates", x => x.MonsterTemplateId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplates_MonsterTemplates_ParentMonsterTemplateId",
                        column: x => x.ParentMonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonsterTemplates_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RandomizationEngines",
                columns: table => new
                {
                    RandomizationEngineId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Percentage = table.Column<decimal>(nullable: false),
                    Qty = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    ItemMasterId = table.Column<int>(nullable: false),
                    IsOr = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RandomizationEngines", x => x.RandomizationEngineId);
                    table.ForeignKey(
                        name: "FK_RandomizationEngines_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Monsters",
                columns: table => new
                {
                    MonsterId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    HealthCurrent = table.Column<int>(nullable: false),
                    HealthMax = table.Column<int>(nullable: false),
                    ArmorClass = table.Column<int>(nullable: false),
                    XPValue = table.Column<int>(nullable: false),
                    ChallangeRating = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Monsters", x => x.MonsterId);
                    table.ForeignKey(
                        name: "FK_Monsters_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Monsters_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateAbilities",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateAbilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateAbilities_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateAbilities_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateBuffAndEffects_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateCommands",
                columns: table => new
                {
                    MonsterTemplateCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateCommands", x => x.MonsterTemplateCommandId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateCommands_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateMonsters",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    AssociateMonsterTemplateId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateMonsters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateMonsters_MonsterTemplates_AssociateMonsterTemplateId",
                        column: x => x.AssociateMonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateMonsters_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateSpells",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateSpells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateSpells_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateSpells_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateRandomizationEngines",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    RandomizationEngineId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateRandomizationEngines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateRandomizationEngines_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateRandomizationEngines_RandomizationEngines_RandomizationEngineId",
                        column: x => x.RandomizationEngineId,
                        principalTable: "RandomizationEngines",
                        principalColumn: "RandomizationEngineId",
                        onDelete: ReferentialAction.Cascade);
                });

            //migrationBuilder.CreateIndex(
            //    name: "IX_RulesetBuffAndEffectTiles_RulesetTileId",
            //    table: "RulesetBuffAndEffectTiles",
            //    column: "RulesetTileId",
            //    unique: true,
            //    filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Monsters_MonsterTemplateId",
                table: "Monsters",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Monsters_RuleSetId",
                table: "Monsters",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateAbilities_AbilityId",
                table: "MonsterTemplateAbilities",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateAbilities_MonsterTemplateId",
                table: "MonsterTemplateAbilities",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBuffAndEffects_BuffAndEffectId",
                table: "MonsterTemplateBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateBuffAndEffects_MonsterTemplateId",
                table: "MonsterTemplateBuffAndEffects",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateCommands_MonsterTemplateId",
                table: "MonsterTemplateCommands",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateMonsters_AssociateMonsterTemplateId",
                table: "MonsterTemplateMonsters",
                column: "AssociateMonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateMonsters_MonsterTemplateId",
                table: "MonsterTemplateMonsters",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateRandomizationEngines_MonsterTemplateId",
                table: "MonsterTemplateRandomizationEngines",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateRandomizationEngines_RandomizationEngineId",
                table: "MonsterTemplateRandomizationEngines",
                column: "RandomizationEngineId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplates_ParentMonsterTemplateId",
                table: "MonsterTemplates",
                column: "ParentMonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplates_RuleSetId",
                table: "MonsterTemplates",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateSpells_MonsterTemplateId",
                table: "MonsterTemplateSpells",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateSpells_SpellId",
                table: "MonsterTemplateSpells",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_RandomizationEngines_ItemMasterId",
                table: "RandomizationEngines",
                column: "ItemMasterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Monsters");

            migrationBuilder.DropTable(
                name: "MonsterTemplateAbilities");

            migrationBuilder.DropTable(
                name: "MonsterTemplateBuffAndEffects");

            migrationBuilder.DropTable(
                name: "MonsterTemplateCommands");

            migrationBuilder.DropTable(
                name: "MonsterTemplateMonsters");

            migrationBuilder.DropTable(
                name: "MonsterTemplateRandomizationEngines");

            migrationBuilder.DropTable(
                name: "MonsterTemplateSpells");

            migrationBuilder.DropTable(
                name: "RandomizationEngines");

            migrationBuilder.DropTable(
                name: "MonsterTemplates");

            //migrationBuilder.DropIndex(
            //    name: "IX_RulesetBuffAndEffectTiles_RulesetTileId",
            //    table: "RulesetBuffAndEffectTiles");

            //migrationBuilder.CreateIndex(
            //    name: "IX_RulesetBuffAndEffectTiles_RulesetTileId",
            //    table: "RulesetBuffAndEffectTiles",
            //    column: "RulesetTileId");
        }
    }
}
