using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addedtypeidcolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "TypeId",
                table: "CharacterStatTypes",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AlterColumn<int>(
                name: "DefaultPageId",
                table: "CharacterDashboardLayouts",
                nullable: true,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "CharacterStatTypes");

            migrationBuilder.AlterColumn<int>(
                name: "DefaultPageId",
                table: "CharacterDashboardLayouts",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
