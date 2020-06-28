using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updatecombatsetting1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CampaignId",
                table: "CombatSettings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CampaignId",
                table: "CombatSettings",
                column: "CampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_CombatSettings_RuleSets_CampaignId",
                table: "CombatSettings",
                column: "CampaignId",
                principalTable: "RuleSets",
                principalColumn: "RuleSetId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CombatSettings_RuleSets_CampaignId",
                table: "CombatSettings");

            migrationBuilder.DropIndex(
                name: "IX_CombatSettings_CampaignId",
                table: "CombatSettings");

            migrationBuilder.DropColumn(
                name: "CampaignId",
                table: "CombatSettings");
        }
    }
}
