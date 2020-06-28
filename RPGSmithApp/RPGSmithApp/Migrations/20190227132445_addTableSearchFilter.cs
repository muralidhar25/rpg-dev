using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addTableSearchFilter : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SearchFilter",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: false),
                    RulesetId = table.Column<int>(nullable: false),
                    IsRuleSet = table.Column<bool>(nullable: false),
                    IsCharacter = table.Column<bool>(nullable: false),
                    IsItem = table.Column<bool>(nullable: false),
                    IsSpell = table.Column<bool>(nullable: false),
                    IsAbility = table.Column<bool>(nullable: false),
                    IsName = table.Column<bool>(nullable: false),
                    IsTags = table.Column<bool>(nullable: false),
                    IsStats = table.Column<bool>(nullable: false),
                    IsDesc = table.Column<bool>(nullable: false),
                    IsRarity = table.Column<bool>(nullable: false),
                    IsAssociatedSpell = table.Column<bool>(nullable: false),
                    IsAssociatedAbility = table.Column<bool>(nullable: false),
                    IsLevel = table.Column<bool>(nullable: false),
                    IsClass = table.Column<bool>(nullable: false),
                    IsSchool = table.Column<bool>(nullable: false),
                    IsCastingTime = table.Column<bool>(nullable: false),
                    IsEffectDesc = table.Column<bool>(nullable: false),
                    IsHitEffect = table.Column<bool>(nullable: false),
                    IsMissEffect = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SearchFilter", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SearchFilter_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_SearchFilter_RuleSets_RulesetId",
                        column: x => x.RulesetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SearchFilter_CharacterId",
                table: "SearchFilter",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchFilter_RulesetId",
                table: "SearchFilter",
                column: "RulesetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SearchFilter");
        }
    }
}
