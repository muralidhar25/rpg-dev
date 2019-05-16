using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class createchatmessagetable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropIndex(
            //    name: "IX_ItemMasterLoots_ItemMasterId",
            //    table: "ItemMasterLoots");

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Message = table.Column<string>(nullable: true),
                    CampaignID = table.Column<int>(nullable: false),
                    SenderCharacterID = table.Column<int>(nullable: false),
                    SenderCampaignID = table.Column<int>(nullable: false),
                    ReceiverCharacterID = table.Column<int>(nullable: false),
                    ReceiverCampaignID = table.Column<int>(nullable: false),
                    DateSent = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                });

            //migrationBuilder.CreateIndex(
            //    name: "IX_ItemMasterLoots_ItemMasterId",
            //    table: "ItemMasterLoots",
            //    column: "ItemMasterId",
            //    unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages");

            //migrationBuilder.DropIndex(
            //    name: "IX_ItemMasterLoots_ItemMasterId",
            //    table: "ItemMasterLoots");

            //migrationBuilder.CreateIndex(
            //    name: "IX_ItemMasterLoots_ItemMasterId",
            //    table: "ItemMasterLoots",
            //    column: "ItemMasterId");
        }
    }
}
