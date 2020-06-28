using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class AddParentBundleIdForCoreRulesets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentItemMasterBundleId",
                table: "ItemMasterBundles",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterBundles_ParentItemMasterBundleId",
                table: "ItemMasterBundles",
                column: "ParentItemMasterBundleId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterBundles_ItemMasterBundles_ParentItemMasterBundleId",
                table: "ItemMasterBundles",
                column: "ParentItemMasterBundleId",
                principalTable: "ItemMasterBundles",
                principalColumn: "BundleId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterBundles_ItemMasterBundles_ParentItemMasterBundleId",
                table: "ItemMasterBundles");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterBundles_ParentItemMasterBundleId",
                table: "ItemMasterBundles");

            migrationBuilder.DropColumn(
                name: "ParentItemMasterBundleId",
                table: "ItemMasterBundles");
        }
    }
}
