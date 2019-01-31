using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class DefaultValue_nullableColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Minimum",
                table: "CharacterStatDefaultValues",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "Maximum",
                table: "CharacterStatDefaultValues",
                nullable: true,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Minimum",
                table: "CharacterStatDefaultValues",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Maximum",
                table: "CharacterStatDefaultValues",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
