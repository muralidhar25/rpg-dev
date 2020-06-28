using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class RPGDB01Oct2018 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    CreatedBy = table.Column<string>(nullable: true),
                    UpdatedBy = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 50, nullable: false),
                    UserName = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(maxLength: 256, nullable: true),
                    Email = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    PasswordHash = table.Column<string>(maxLength: 500, nullable: true),
                    SecurityStamp = table.Column<string>(nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(maxLength: 30, nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(nullable: false),
                    TwoFactorEnabled = table.Column<bool>(nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
                    LockoutEnabled = table.Column<bool>(nullable: false),
                    AccessFailedCount = table.Column<int>(nullable: false),
                    JobTitle = table.Column<string>(maxLength: 150, nullable: true),
                    FullName = table.Column<string>(maxLength: 150, nullable: true),
                    Configuration = table.Column<string>(nullable: true),
                    IsEnabled = table.Column<bool>(nullable: false),
                    CreatedBy = table.Column<string>(maxLength: 50, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 50, nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    ProfileImage = table.Column<string>(maxLength: 400, nullable: true),
                    TempUserName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CharacterDashboardLayouts",
                columns: table => new
                {
                    CharacterDashboardLayoutId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DefaultPageId = table.Column<int>(nullable: false),
                    LayoutHeight = table.Column<int>(nullable: false),
                    LayoutWidth = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterDashboardLayouts", x => x.CharacterDashboardLayoutId);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatTypes",
                columns: table => new
                {
                    CharacterStatTypeId = table.Column<short>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    StatTypeName = table.Column<string>(maxLength: 255, nullable: false),
                    StatTypeDesc = table.Column<string>(maxLength: 4000, nullable: true),
                    isNumeric = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatTypes", x => x.CharacterStatTypeId);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictApplications",
                columns: table => new
                {
                    ClientId = table.Column<string>(nullable: false),
                    ClientSecret = table.Column<string>(nullable: true),
                    ConcurrencyToken = table.Column<string>(nullable: true),
                    ConsentType = table.Column<string>(nullable: true),
                    DisplayName = table.Column<string>(nullable: true),
                    Id = table.Column<string>(nullable: false),
                    Permissions = table.Column<string>(nullable: true),
                    PostLogoutRedirectUris = table.Column<string>(nullable: true),
                    Properties = table.Column<string>(nullable: true),
                    RedirectUris = table.Column<string>(nullable: true),
                    Type = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictScopes",
                columns: table => new
                {
                    ConcurrencyToken = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    DisplayName = table.Column<string>(nullable: true),
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Properties = table.Column<string>(nullable: true),
                    Resources = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictScopes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PageLastViews",
                columns: table => new
                {
                    PageLastViewId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    PageName = table.Column<string>(nullable: false),
                    ViewType = table.Column<string>(nullable: false),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageLastViews", x => x.PageLastViewId);
                });

            migrationBuilder.CreateTable(
                name: "RPGCoreColors",
                columns: table => new
                {
                    RPGCoreColorId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RPGCoreColors", x => x.RPGCoreColorId);
                });

            migrationBuilder.CreateTable(
                name: "RuleSetGenres",
                columns: table => new
                {
                    RuleSetGenreId = table.Column<short>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    GenreName = table.Column<string>(maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RuleSetGenres", x => x.RuleSetGenreId);
                });

            migrationBuilder.CreateTable(
                name: "TileTypes",
                columns: table => new
                {
                    TileTypeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TileTypes", x => x.TileTypeId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RoleId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(nullable: false),
                    ProviderKey = table.Column<string>(nullable: false),
                    ProviderDisplayName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    LoginProvider = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TileColors",
                columns: table => new
                {
                    TileColorId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TileColors", x => x.TileColorId);
                    table.ForeignKey(
                        name: "FK_TileColors_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictAuthorizations",
                columns: table => new
                {
                    ApplicationId = table.Column<string>(nullable: true),
                    ConcurrencyToken = table.Column<string>(nullable: true),
                    Id = table.Column<string>(nullable: false),
                    Properties = table.Column<string>(nullable: true),
                    Scopes = table.Column<string>(nullable: true),
                    Status = table.Column<string>(nullable: false),
                    Subject = table.Column<string>(nullable: false),
                    Type = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictAuthorizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "OpenIddictApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RuleSets",
                columns: table => new
                {
                    RuleSetId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetName = table.Column<string>(maxLength: 255, nullable: false),
                    RuleSetDesc = table.Column<string>(maxLength: 4000, nullable: true),
                    isActive = table.Column<bool>(nullable: false),
                    DefaultDice = table.Column<string>(maxLength: 255, nullable: true),
                    CurrencyLabel = table.Column<string>(maxLength: 20, nullable: true),
                    WeightLabel = table.Column<string>(maxLength: 20, nullable: true),
                    DistanceLabel = table.Column<string>(maxLength: 20, nullable: true),
                    VolumeLabel = table.Column<string>(maxLength: 20, nullable: true),
                    ImageUrl = table.Column<string>(maxLength: 400, nullable: true),
                    ThumbnailUrl = table.Column<string>(maxLength: 400, nullable: true),
                    IsCoreContent = table.Column<bool>(nullable: true),
                    OwnerId = table.Column<string>(maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    ModifiedBy = table.Column<string>(maxLength: 50, nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    SortOrder = table.Column<int>(nullable: true),
                    RuleSetGenreId = table.Column<short>(nullable: true),
                    ParentRuleSetId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RuleSets", x => x.RuleSetId);
                    table.ForeignKey(
                        name: "FK_RuleSets_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RuleSets_AspNetUsers_ModifiedBy",
                        column: x => x.ModifiedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RuleSets_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RuleSets_RuleSets_ParentRuleSetId",
                        column: x => x.ParentRuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RuleSets_RuleSetGenres_RuleSetGenreId",
                        column: x => x.RuleSetGenreId,
                        principalTable: "RuleSetGenres",
                        principalColumn: "RuleSetGenreId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictTokens",
                columns: table => new
                {
                    ApplicationId = table.Column<string>(nullable: true),
                    AuthorizationId = table.Column<string>(nullable: true),
                    CreationDate = table.Column<DateTimeOffset>(nullable: true),
                    ExpirationDate = table.Column<DateTimeOffset>(nullable: true),
                    ConcurrencyToken = table.Column<string>(nullable: true),
                    Id = table.Column<string>(nullable: false),
                    Payload = table.Column<string>(nullable: true),
                    Properties = table.Column<string>(nullable: true),
                    ReferenceId = table.Column<string>(nullable: true),
                    Status = table.Column<string>(nullable: true),
                    Subject = table.Column<string>(nullable: false),
                    Type = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpenIddictTokens_OpenIddictApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "OpenIddictApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId",
                        column: x => x.AuthorizationId,
                        principalTable: "OpenIddictAuthorizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Abilities",
                columns: table => new
                {
                    AbilityId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Level = table.Column<string>(nullable: true),
                    Command = table.Column<string>(nullable: true),
                    MaxNumberOfUses = table.Column<int>(nullable: false),
                    CurrentNumberOfUses = table.Column<int>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    Stats = table.Column<string>(nullable: true),
                    ImageUrl = table.Column<string>(nullable: true),
                    IsEnabled = table.Column<bool>(nullable: false),
                    Metatags = table.Column<string>(type: "nvarchar(4000)", nullable: true),
                    ParentAbilityId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Abilities", x => x.AbilityId);
                    table.ForeignKey(
                        name: "FK_Abilities_Abilities_ParentAbilityId",
                        column: x => x.ParentAbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Abilities_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Characters",
                columns: table => new
                {
                    CharacterId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterName = table.Column<string>(maxLength: 100, nullable: false),
                    CharacterDescription = table.Column<string>(maxLength: 4000, nullable: true),
                    ImageUrl = table.Column<string>(maxLength: 400, nullable: true),
                    ThumbnailUrl = table.Column<string>(maxLength: 400, nullable: true),
                    UserId = table.Column<string>(maxLength: 50, nullable: false),
                    RuleSetId = table.Column<int>(nullable: false),
                    ParentCharacterId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    LastCommand = table.Column<string>(nullable: true),
                    LastCommandResult = table.Column<string>(nullable: true),
                    InventoryWeight = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Characters", x => x.CharacterId);
                    table.ForeignKey(
                        name: "FK_Characters_Characters_ParentCharacterId",
                        column: x => x.ParentCharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Characters_RuleSets",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Characters_AspNetUsers",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStats",
                columns: table => new
                {
                    CharacterStatId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    StatName = table.Column<string>(maxLength: 100, nullable: false),
                    StatDesc = table.Column<string>(maxLength: 4000, nullable: true),
                    isActive = table.Column<bool>(nullable: false),
                    CharacterStatTypeId = table.Column<short>(nullable: false),
                    OwnerId = table.Column<string>(maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    ModifiedBy = table.Column<string>(maxLength: 50, nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    isMultiSelect = table.Column<bool>(nullable: false),
                    ParentCharacterStatId = table.Column<int>(nullable: true),
                    SortOrder = table.Column<short>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStats", x => x.CharacterStatId);
                    table.ForeignKey(
                        name: "FK_CharacterStats_CharacterStatTypes_CharacterStatTypeId",
                        column: x => x.CharacterStatTypeId,
                        principalTable: "CharacterStatTypes",
                        principalColumn: "CharacterStatTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStats_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStats_AspNetUsers_ModifiedBy",
                        column: x => x.ModifiedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStats_AspNetUsers_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterStats_CharacterStats_ParentCharacterStatId",
                        column: x => x.ParentCharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStats_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasters",
                columns: table => new
                {
                    ItemMasterId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    ItemName = table.Column<string>(maxLength: 255, nullable: false),
                    ItemImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemStats = table.Column<string>(type: "nvarchar(1024)", nullable: true),
                    ItemVisibleDesc = table.Column<string>(type: "nvarchar(4000)", nullable: true),
                    Command = table.Column<string>(nullable: true),
                    ItemCalculation = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    Value = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    Volume = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    IsContainer = table.Column<bool>(nullable: false),
                    ContainerWeightMax = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    ContainerVolumeMax = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    ContainerWeightModifier = table.Column<string>(type: "varchar(50)", nullable: true),
                    PercentReduced = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    TotalWeightWithContents = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    IsMagical = table.Column<bool>(nullable: false),
                    IsConsumable = table.Column<bool>(nullable: false),
                    Metatags = table.Column<string>(type: "nvarchar(4000)", nullable: true),
                    Rarity = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    ParentItemMasterId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasters", x => x.ItemMasterId);
                    table.ForeignKey(
                        name: "FK_ItemMasters_ItemMasters_ParentItemMasterId",
                        column: x => x.ParentItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemMasters_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Spells",
                columns: table => new
                {
                    SpellId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    School = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Class = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Levels = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Command = table.Column<string>(nullable: true),
                    MaterialComponent = table.Column<string>(nullable: true),
                    IsMaterialComponent = table.Column<bool>(nullable: false),
                    IsSomaticComponent = table.Column<bool>(nullable: false),
                    IsVerbalComponent = table.Column<bool>(nullable: false),
                    CastingTime = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Stats = table.Column<string>(nullable: true),
                    HitEffect = table.Column<string>(type: "ntext", nullable: true),
                    MissEffect = table.Column<string>(type: "ntext", nullable: true),
                    EffectDescription = table.Column<string>(type: "ntext", nullable: true),
                    ShouldCast = table.Column<bool>(nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Memorized = table.Column<bool>(nullable: false),
                    Metatags = table.Column<string>(type: "nvarchar(4000)", nullable: true),
                    ParentSpellId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spells", x => x.SpellId);
                    table.ForeignKey(
                        name: "FK_Spells_Spells_ParentSpellId",
                        column: x => x.ParentSpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Spells_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users_RuleSets",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RuleSetId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users_RuleSets", x => new { x.RuleSetId, x.UserId });
                    table.ForeignKey(
                        name: "FK_Users_RuleSets_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_RuleSets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AbilityCommands",
                columns: table => new
                {
                    AbilityCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbilityCommands", x => x.AbilityCommandId);
                    table.ForeignKey(
                        name: "FK_AbilityCommands_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterAbilities",
                columns: table => new
                {
                    CharacterAbilityId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: false),
                    IsEnabled = table.Column<bool>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    CurrentNumberOfUses = table.Column<int>(nullable: true),
                    MaxNumberOfUses = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterAbilities", x => x.CharacterAbilityId);
                    table.ForeignKey(
                        name: "FK_CharacterAbilities_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_CharacterAbilities_Characters_CharacterId",
                    //    column: x => x.CharacterId,
                    //    principalTable: "Characters",
                    //    principalColumn: "CharacterId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterCommands",
                columns: table => new
                {
                    CharacterCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: false),
                    Command = table.Column<string>(nullable: true),
                    CharacterId = table.Column<int>(nullable: false),
                    CreatedOn = table.Column<DateTime>(nullable: true),
                    UpdatedOn = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCommands", x => x.CharacterCommandId);
                    table.ForeignKey(
                        name: "FK_CharacterCommands_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterDashboardPages",
                columns: table => new
                {
                    CharacterDashboardPageId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterDashboardLayoutId = table.Column<int>(nullable: false),
                    CharacterId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ContainerHeight = table.Column<int>(nullable: false),
                    ContainerWidth = table.Column<int>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterDashboardPages", x => x.CharacterDashboardPageId);
                    table.ForeignKey(
                        name: "FK_CharacterDashboardPages_CharacterDashboardLayouts_CharacterDashboardLayoutId",
                        column: x => x.CharacterDashboardLayoutId,
                        principalTable: "CharacterDashboardLayouts",
                        principalColumn: "CharacterDashboardLayoutId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterDashboardPages_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharactersCharacterStats",
                columns: table => new
                {
                    CharactersCharacterStatId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterStatId = table.Column<int>(nullable: false),
                    CharacterId = table.Column<int>(nullable: false),
                    Text = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    RichText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Choice = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    MultiChoice = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Command = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    YesNo = table.Column<bool>(nullable: false),
                    OnOff = table.Column<bool>(nullable: false),
                    Value = table.Column<int>(nullable: false),
                    SubValue = table.Column<int>(nullable: false),
                    Current = table.Column<int>(nullable: false),
                    Maximum = table.Column<int>(nullable: false),
                    CalculationResult = table.Column<int>(nullable: false),
                    Number = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharactersCharacterStats", x => x.CharactersCharacterStatId);
                    table.ForeignKey(
                        name: "FK_CharactersCharacterStats_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_CharactersCharacterStats_CharacterStats_CharacterStatId",
                    //    column: x => x.CharacterStatId,
                    //    principalTable: "CharacterStats",
                    //    principalColumn: "CharacterStatId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatCalcs",
                columns: table => new
                {
                    CharacterStatCalcId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    StatCalculation = table.Column<string>(maxLength: 500, nullable: false),
                    CharacterStatId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatCalcs", x => x.CharacterStatCalcId);
                    table.ForeignKey(
                        name: "FK_CharacterStatCalcs_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatChoices",
                columns: table => new
                {
                    CharacterStatChoiceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    StatChoiceValue = table.Column<string>(maxLength: 100, nullable: true),
                    CharacterStatId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatChoices", x => x.CharacterStatChoiceId);
                    table.ForeignKey(
                        name: "FK_CharacterStatChoices_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemMaster_Abilities",
                columns: table => new
                {
                    ItemMasterId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMaster_Abilities", x => new { x.AbilityId, x.ItemMasterId });
                    table.ForeignKey(
                        name: "FK_ItemMaster_Abilities_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_ItemMaster_Abilities_ItemMasters_ItemMasterId",
                    //    column: x => x.ItemMasterId,
                    //    principalTable: "ItemMasters",
                    //    principalColumn: "ItemMasterId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemMaster_Players",
                columns: table => new
                {
                    PlayerId = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    ItemMasterId = table.Column<int>(nullable: false),
                    isVisable = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMaster_Players", x => new { x.PlayerId, x.ItemMasterId });
                    table.ForeignKey(
                        name: "FK_ItemMaster_Players_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemMaster_Players_AspNetUsers_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterCommands",
                columns: table => new
                {
                    ItemMasterCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    ItemMasterId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterCommands", x => x.ItemMasterCommandId);
                    table.ForeignKey(
                        name: "FK_ItemMasterCommands_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    ItemId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CharacterId = table.Column<int>(nullable: false),
                    ItemMasterId = table.Column<int>(nullable: false),
                    Command = table.Column<string>(nullable: true),
                    ContainedIn = table.Column<int>(nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    TotalWeight = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    Volume = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    ItemStats = table.Column<string>(type: "nvarchar(1024)", nullable: true),
                    IsContainer = table.Column<bool>(nullable: false),
                    ContainerWeightMax = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    ContainerVolumeMax = table.Column<decimal>(type: "decimal(18, 8)", nullable: false),
                    ContainerWeightModifier = table.Column<string>(type: "varchar(50)", nullable: true),
                    PercentReduced = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    TotalWeightWithContents = table.Column<decimal>(type: "decimal(18, 3)", nullable: false),
                    IsIdentified = table.Column<bool>(nullable: true),
                    IsVisible = table.Column<bool>(nullable: true),
                    IsEquipped = table.Column<bool>(nullable: true),
                    IsMagical = table.Column<bool>(nullable: false),
                    IsConsumable = table.Column<bool>(nullable: false),
                    ItemCalculation = table.Column<string>(type: "nvarchar(1024)", nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rarity = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    ParentItemId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK_Items_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_Items_ItemMasters_ItemMasterId",
                    //    column: x => x.ItemMasterId,
                    //    principalTable: "ItemMasters",
                    //    principalColumn: "ItemMasterId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterSpells",
                columns: table => new
                {
                    CharacterSpellId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterId = table.Column<int>(nullable: false),
                    IsMemorized = table.Column<bool>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterSpells", x => x.CharacterSpellId);
                    table.ForeignKey(
                        name: "FK_CharacterSpells_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_CharacterSpells_Spells_SpellId",
                    //    column: x => x.SpellId,
                    //    principalTable: "Spells",
                    //    principalColumn: "SpellId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemMaster_Spells",
                columns: table => new
                {
                    ItemMasterId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMaster_Spells", x => new { x.SpellId, x.ItemMasterId });
                    table.ForeignKey(
                        name: "FK_ItemMaster_Spells_ItemMasters_ItemMasterId",
                        column: x => x.ItemMasterId,
                        principalTable: "ItemMasters",
                        principalColumn: "ItemMasterId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_ItemMaster_Spells_Spells_SpellId",
                    //    column: x => x.SpellId,
                    //    principalTable: "Spells",
                    //    principalColumn: "SpellId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpellCommands",
                columns: table => new
                {
                    SpellCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpellCommands", x => x.SpellCommandId);
                    table.ForeignKey(
                        name: "FK_SpellCommands_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterTiles",
                columns: table => new
                {
                    CharacterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileTypeId = table.Column<int>(nullable: false),
                    CharacterDashboardPageId = table.Column<int>(nullable: false),
                    CharacterId = table.Column<int>(nullable: false),
                    Shape = table.Column<int>(nullable: false),
                    LocationX = table.Column<int>(nullable: false),
                    LocationY = table.Column<int>(nullable: false),
                    Height = table.Column<int>(nullable: false),
                    Width = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterTiles", x => x.CharacterTileId);
                    table.ForeignKey(
                        name: "FK_CharacterTiles_CharacterDashboardPages_CharacterDashboardPageId",
                        column: x => x.CharacterDashboardPageId,
                        principalTable: "CharacterDashboardPages",
                        principalColumn: "CharacterDashboardPageId",
                        onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_CharacterTiles_Characters_CharacterId",
                    //    column: x => x.CharacterId,
                    //    principalTable: "Characters",
                    //    principalColumn: "CharacterId",
                    //    onDelete: ReferentialAction.Cascade);
                    //table.ForeignKey(
                    //    name: "FK_CharacterTiles_TileTypes_TileTypeId",
                    //    column: x => x.TileTypeId,
                    //    principalTable: "TileTypes",
                    //    principalColumn: "TileTypeId",
                    //    onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tiles",
                columns: table => new
                {
                    TileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileTypeId = table.Column<int>(nullable: false),
                    CharacterDashboardPageId = table.Column<int>(nullable: true),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(maxLength: 50, nullable: false),
                    LocationX = table.Column<int>(nullable: false),
                    LocationY = table.Column<int>(nullable: false),
                    Height = table.Column<int>(nullable: false),
                    Width = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CharacterId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tiles", x => x.TileId);
                    table.ForeignKey(
                        name: "FK_Tiles_CharacterDashboardPages_CharacterDashboardPageId",
                        column: x => x.CharacterDashboardPageId,
                        principalTable: "CharacterDashboardPages",
                        principalColumn: "CharacterDashboardPageId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tiles_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tiles_TileTypes_TileTypeId",
                        column: x => x.TileTypeId,
                        principalTable: "TileTypes",
                        principalColumn: "TileTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemAbilities",
                columns: table => new
                {
                    ItemId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemAbilities", x => new { x.AbilityId, x.ItemId });
                    table.ForeignKey(
                        name: "FK_ItemAbilities_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemAbilities_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemCommands",
                columns: table => new
                {
                    ItemCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    ItemId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemCommands", x => x.ItemCommandId);
                    table.ForeignKey(
                        name: "FK_ItemCommands_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemSpells",
                columns: table => new
                {
                    ItemId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemSpells", x => new { x.SpellId, x.ItemId });
                    table.ForeignKey(
                        name: "FK_ItemSpells_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemSpells_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterCharacterStatTiles",
                columns: table => new
                {
                    CharacterStatTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    CharactersCharacterStatId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    titleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    titleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    bodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    bodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCharacterStatTiles", x => x.CharacterStatTileId);
                    table.ForeignKey(
                        name: "FK_CharacterCharacterStatTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterCharacterStatTiles_CharactersCharacterStats_CharactersCharacterStatId",
                        column: x => x.CharactersCharacterStatId,
                        principalTable: "CharactersCharacterStats",
                        principalColumn: "CharactersCharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterCommandTiles",
                columns: table => new
                {
                    CommandTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Command = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCommandTiles", x => x.CommandTileId);
                    table.ForeignKey(
                        name: "FK_CharacterCommandTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterCounterTiles",
                columns: table => new
                {
                    CounterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DefaultValue = table.Column<int>(nullable: false),
                    Maximum = table.Column<int>(nullable: false),
                    Minimum = table.Column<int>(nullable: false),
                    Step = table.Column<int>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCounterTiles", x => x.CounterTileId);
                    table.ForeignKey(
                        name: "FK_CharacterCounterTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterExecuteTiles",
                columns: table => new
                {
                    ExecuteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    SpellId = table.Column<int>(nullable: true),
                    AbilityId = table.Column<int>(nullable: true),
                    ItemId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    CommandId = table.Column<int>(nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterExecuteTiles", x => x.ExecuteTileId);
                    table.ForeignKey(
                        name: "FK_CharacterExecuteTiles_CharacterAbilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "CharacterAbilities",
                        principalColumn: "CharacterAbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterExecuteTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterExecuteTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterExecuteTiles_CharacterSpells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "CharacterSpells",
                        principalColumn: "CharacterSpellId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterImageTiles",
                columns: table => new
                {
                    ImageTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterImageTiles", x => x.ImageTileId);
                    table.ForeignKey(
                        name: "FK_CharacterImageTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterLinkTiles",
                columns: table => new
                {
                    LinkTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    SpellId = table.Column<int>(nullable: true),
                    AbilityId = table.Column<int>(nullable: true),
                    ItemId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterLinkTiles", x => x.LinkTileId);
                    table.ForeignKey(
                        name: "FK_CharacterLinkTiles_CharacterAbilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "CharacterAbilities",
                        principalColumn: "CharacterAbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterLinkTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterLinkTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterLinkTiles_CharacterSpells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "CharacterSpells",
                        principalColumn: "CharacterSpellId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CharacterNoteTiles",
                columns: table => new
                {
                    NoteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterNoteTiles", x => x.NoteTileId);
                    table.ForeignKey(
                        name: "FK_CharacterNoteTiles_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TileConfig",
                columns: table => new
                {
                    TileConfigId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterTileId = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    UniqueId = table.Column<string>(nullable: true),
                    Payload = table.Column<int>(nullable: false),
                    Col = table.Column<int>(nullable: false),
                    Row = table.Column<int>(nullable: false),
                    SizeX = table.Column<int>(nullable: false),
                    SizeY = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TileConfig", x => x.TileConfigId);
                    table.ForeignKey(
                        name: "FK_TileConfig_CharacterTiles_CharacterTileId",
                        column: x => x.CharacterTileId,
                        principalTable: "CharacterTiles",
                        principalColumn: "CharacterTileId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatTiles",
                columns: table => new
                {
                    CharacterStatTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    CharactersCharacterStatId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatTiles", x => x.CharacterStatTileId);
                    table.ForeignKey(
                        name: "FK_CharacterStatTiles_CharactersCharacterStats_CharactersCharacterStatId",
                        column: x => x.CharactersCharacterStatId,
                        principalTable: "CharactersCharacterStats",
                        principalColumn: "CharactersCharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStatTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CommandTiles",
                columns: table => new
                {
                    CommandTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Command = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommandTiles", x => x.CommandTileId);
                    table.ForeignKey(
                        name: "FK_CommandTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CounterTiles",
                columns: table => new
                {
                    CounterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DefaultValue = table.Column<int>(nullable: false),
                    Maximum = table.Column<int>(nullable: false),
                    Minimum = table.Column<int>(nullable: false),
                    Step = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CounterTiles", x => x.CounterTileId);
                    table.ForeignKey(
                        name: "FK_CounterTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExecuteTiles",
                columns: table => new
                {
                    ExecuteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    SpellId = table.Column<int>(nullable: true),
                    AbilityId = table.Column<int>(nullable: true),
                    ItemId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    CommandId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecuteTiles", x => x.ExecuteTileId);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ImageTiles",
                columns: table => new
                {
                    ImageTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImageTiles", x => x.ImageTileId);
                    table.ForeignKey(
                        name: "FK_ImageTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LinkTiles",
                columns: table => new
                {
                    LinkTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    SpellId = table.Column<int>(nullable: true),
                    AbilityId = table.Column<int>(nullable: true),
                    ItemId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkTiles", x => x.LinkTileId);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NoteTiles",
                columns: table => new
                {
                    NoteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteTiles", x => x.NoteTileId);
                    table.ForeignKey(
                        name: "FK_NoteTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Abilities_ParentAbilityId",
                table: "Abilities",
                column: "ParentAbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_Abilities_RuleSetId",
                table: "Abilities",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_AbilityCommands_AbilityId",
                table: "AbilityCommands",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterAbilities_AbilityId",
                table: "CharacterAbilities",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterAbilities_CharacterId",
                table: "CharacterAbilities",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatTiles_CharacterTileId",
                table: "CharacterCharacterStatTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatTiles_CharactersCharacterStatId",
                table: "CharacterCharacterStatTiles",
                column: "CharactersCharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCommands_CharacterId",
                table: "CharacterCommands",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCommandTiles_CharacterTileId",
                table: "CharacterCommandTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCounterTiles_CharacterTileId",
                table: "CharacterCounterTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterDashboardPages_CharacterDashboardLayoutId",
                table: "CharacterDashboardPages",
                column: "CharacterDashboardLayoutId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterDashboardPages_CharacterId",
                table: "CharacterDashboardPages",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_AbilityId",
                table: "CharacterExecuteTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_CharacterTileId",
                table: "CharacterExecuteTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_ItemId",
                table: "CharacterExecuteTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterExecuteTiles_SpellId",
                table: "CharacterExecuteTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterImageTiles_CharacterTileId",
                table: "CharacterImageTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_AbilityId",
                table: "CharacterLinkTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_CharacterTileId",
                table: "CharacterLinkTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_ItemId",
                table: "CharacterLinkTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterLinkTiles_SpellId",
                table: "CharacterLinkTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterNoteTiles_CharacterTileId",
                table: "CharacterNoteTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_ParentCharacterId",
                table: "Characters",
                column: "ParentCharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_RuleSetId",
                table: "Characters",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters",
                columns: new[] { "UserId", "CharacterName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharactersCharacterStats_CharacterId",
                table: "CharactersCharacterStats",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharactersCharacterStats_CharacterStatId",
                table: "CharactersCharacterStats",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterSpells_CharacterId",
                table: "CharacterSpells",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterSpells_SpellId",
                table: "CharacterSpells",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatCalcs_CharacterStatId",
                table: "CharacterStatCalcs",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatChoices_CharacterStatId",
                table: "CharacterStatChoices",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_CharacterStatTypeId",
                table: "CharacterStats",
                column: "CharacterStatTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_CreatedBy",
                table: "CharacterStats",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_ModifiedBy",
                table: "CharacterStats",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_OwnerId",
                table: "CharacterStats",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_ParentCharacterStatId",
                table: "CharacterStats",
                column: "ParentCharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_RuleSetId",
                table: "CharacterStats",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatTiles_CharactersCharacterStatId",
                table: "CharacterStatTiles",
                column: "CharactersCharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatTiles_TileId",
                table: "CharacterStatTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterTiles_CharacterDashboardPageId",
                table: "CharacterTiles",
                column: "CharacterDashboardPageId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterTiles_CharacterId",
                table: "CharacterTiles",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterTiles_TileTypeId",
                table: "CharacterTiles",
                column: "TileTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CommandTiles_TileId",
                table: "CommandTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_CounterTiles_TileId",
                table: "CounterTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_AbilityId",
                table: "ExecuteTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_ItemId",
                table: "ExecuteTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_SpellId",
                table: "ExecuteTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_TileId",
                table: "ExecuteTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_ImageTiles_TileId",
                table: "ImageTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemAbilities_ItemId",
                table: "ItemAbilities",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemCommands_ItemId",
                table: "ItemCommands",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMaster_Abilities_ItemMasterId",
                table: "ItemMaster_Abilities",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMaster_Players_ItemMasterId",
                table: "ItemMaster_Players",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMaster_Spells_ItemMasterId",
                table: "ItemMaster_Spells",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterCommands_ItemMasterId",
                table: "ItemMasterCommands",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasters_ParentItemMasterId",
                table: "ItemMasters",
                column: "ParentItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasters_RuleSetId",
                table: "ItemMasters",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_CharacterId",
                table: "Items",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_ItemMasterId",
                table: "Items",
                column: "ItemMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemSpells_ItemId",
                table: "ItemSpells",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_AbilityId",
                table: "LinkTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_ItemId",
                table: "LinkTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_SpellId",
                table: "LinkTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_TileId",
                table: "LinkTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteTiles_TileId",
                table: "NoteTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictApplications_ClientId",
                table: "OpenIddictApplications",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictAuthorizations_ApplicationId",
                table: "OpenIddictAuthorizations",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictScopes_Name",
                table: "OpenIddictScopes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_ApplicationId",
                table: "OpenIddictTokens",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_AuthorizationId",
                table: "OpenIddictTokens",
                column: "AuthorizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_ReferenceId",
                table: "OpenIddictTokens",
                column: "ReferenceId",
                unique: true,
                filter: "[ReferenceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_CreatedBy",
                table: "RuleSets",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_ModifiedBy",
                table: "RuleSets",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_OwnerId",
                table: "RuleSets",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_ParentRuleSetId",
                table: "RuleSets",
                column: "ParentRuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_RuleSetGenreId",
                table: "RuleSets",
                column: "RuleSetGenreId");

            migrationBuilder.CreateIndex(
                name: "IX_SpellCommands_SpellId",
                table: "SpellCommands",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_Spells_ParentSpellId",
                table: "Spells",
                column: "ParentSpellId");

            migrationBuilder.CreateIndex(
                name: "IX_Spells_RuleSetId",
                table: "Spells",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_TileColors_UserId",
                table: "TileColors",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TileConfig_CharacterTileId",
                table: "TileConfig",
                column: "CharacterTileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TileConfig_UniqueId",
                table: "TileConfig",
                column: "UniqueId",
                unique: true,
                filter: "[UniqueId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_CharacterDashboardPageId",
                table: "Tiles",
                column: "CharacterDashboardPageId");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_CharacterId",
                table: "Tiles",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_TileTypeId",
                table: "Tiles",
                column: "TileTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RuleSets_UserId",
                table: "Users_RuleSets",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AbilityCommands");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "CharacterCharacterStatTiles");

            migrationBuilder.DropTable(
                name: "CharacterCommands");

            migrationBuilder.DropTable(
                name: "CharacterCommandTiles");

            migrationBuilder.DropTable(
                name: "CharacterCounterTiles");

            migrationBuilder.DropTable(
                name: "CharacterExecuteTiles");

            migrationBuilder.DropTable(
                name: "CharacterImageTiles");

            migrationBuilder.DropTable(
                name: "CharacterLinkTiles");

            migrationBuilder.DropTable(
                name: "CharacterNoteTiles");

            migrationBuilder.DropTable(
                name: "CharacterStatCalcs");

            migrationBuilder.DropTable(
                name: "CharacterStatChoices");

            migrationBuilder.DropTable(
                name: "CharacterStatTiles");

            migrationBuilder.DropTable(
                name: "CommandTiles");

            migrationBuilder.DropTable(
                name: "CounterTiles");

            migrationBuilder.DropTable(
                name: "ExecuteTiles");

            migrationBuilder.DropTable(
                name: "ImageTiles");

            migrationBuilder.DropTable(
                name: "ItemAbilities");

            migrationBuilder.DropTable(
                name: "ItemCommands");

            migrationBuilder.DropTable(
                name: "ItemMaster_Abilities");

            migrationBuilder.DropTable(
                name: "ItemMaster_Players");

            migrationBuilder.DropTable(
                name: "ItemMaster_Spells");

            migrationBuilder.DropTable(
                name: "ItemMasterCommands");

            migrationBuilder.DropTable(
                name: "ItemSpells");

            migrationBuilder.DropTable(
                name: "LinkTiles");

            migrationBuilder.DropTable(
                name: "NoteTiles");

            migrationBuilder.DropTable(
                name: "OpenIddictScopes");

            migrationBuilder.DropTable(
                name: "OpenIddictTokens");

            migrationBuilder.DropTable(
                name: "PageLastViews");

            migrationBuilder.DropTable(
                name: "RPGCoreColors");

            migrationBuilder.DropTable(
                name: "SpellCommands");

            migrationBuilder.DropTable(
                name: "TileColors");

            migrationBuilder.DropTable(
                name: "TileConfig");

            migrationBuilder.DropTable(
                name: "Users_RuleSets");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "CharacterAbilities");

            migrationBuilder.DropTable(
                name: "CharacterSpells");

            migrationBuilder.DropTable(
                name: "CharactersCharacterStats");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Tiles");

            migrationBuilder.DropTable(
                name: "OpenIddictAuthorizations");

            migrationBuilder.DropTable(
                name: "CharacterTiles");

            migrationBuilder.DropTable(
                name: "Abilities");

            migrationBuilder.DropTable(
                name: "Spells");

            migrationBuilder.DropTable(
                name: "CharacterStats");

            migrationBuilder.DropTable(
                name: "ItemMasters");

            migrationBuilder.DropTable(
                name: "OpenIddictApplications");

            migrationBuilder.DropTable(
                name: "CharacterDashboardPages");

            migrationBuilder.DropTable(
                name: "TileTypes");

            migrationBuilder.DropTable(
                name: "CharacterStatTypes");

            migrationBuilder.DropTable(
                name: "CharacterDashboardLayouts");

            migrationBuilder.DropTable(
                name: "Characters");

            migrationBuilder.DropTable(
                name: "RuleSets");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "RuleSetGenres");
        }
    }
}
