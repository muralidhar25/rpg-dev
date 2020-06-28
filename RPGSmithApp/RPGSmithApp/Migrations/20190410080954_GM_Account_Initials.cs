using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class GM_Account_Initials : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "GmEndDate",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGm",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGmPermanent",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PlayerControls",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CampaignID = table.Column<int>(nullable: false),
                    PlayerCharacterID = table.Column<int>(nullable: true),
                    PauseGame = table.Column<bool>(nullable: false),
                    PauseItemCreate = table.Column<bool>(nullable: false),
                    PauseItemAdd = table.Column<bool>(nullable: false),
                    PauseSpellCreate = table.Column<bool>(nullable: false),
                    PauseSpellAdd = table.Column<bool>(nullable: false),
                    PauseAbilityCreate = table.Column<bool>(nullable: false),
                    PauseAbilityAdd = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerControls_RuleSets_CampaignID",
                        column: x => x.CampaignID,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerControls_Characters_PlayerCharacterID",
                        column: x => x.PlayerCharacterID,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerInvites",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SendByUserID = table.Column<string>(nullable: true),
                    PlayerUserID = table.Column<string>(nullable: true),
                    PlayerCampaignID = table.Column<int>(nullable: false),
                    PlayerCharacterID = table.Column<int>(nullable: true),
                    IsAccepted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerInvites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerInvites_RuleSets_PlayerCampaignID",
                        column: x => x.PlayerCampaignID,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerInvites_Characters_PlayerCharacterID",
                        column: x => x.PlayerCharacterID,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerInvites_AspNetUsers_PlayerUserID",
                        column: x => x.PlayerUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerInvites_AspNetUsers_SendByUserID",
                        column: x => x.SendByUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserSubscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(nullable: true),
                    RulesetCount = table.Column<int>(nullable: false),
                    CampaignCount = table.Column<int>(nullable: false),
                    CharacterCount = table.Column<int>(nullable: false),
                    PlayerCount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerControls_CampaignID",
                table: "PlayerControls",
                column: "CampaignID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerControls_PlayerCharacterID",
                table: "PlayerControls",
                column: "PlayerCharacterID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerInvites_PlayerCampaignID",
                table: "PlayerInvites",
                column: "PlayerCampaignID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerInvites_PlayerCharacterID",
                table: "PlayerInvites",
                column: "PlayerCharacterID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerInvites_PlayerUserID",
                table: "PlayerInvites",
                column: "PlayerUserID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerInvites_SendByUserID",
                table: "PlayerInvites",
                column: "SendByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId",
                table: "UserSubscriptions",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerControls");

            migrationBuilder.DropTable(
                name: "PlayerInvites");

            migrationBuilder.DropTable(
                name: "UserSubscriptions");

            migrationBuilder.DropColumn(
                name: "GmEndDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsGm",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsGmPermanent",
                table: "AspNetUsers");
        }
    }
}
