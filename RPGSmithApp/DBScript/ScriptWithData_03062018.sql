USE [RPGSmithy]
GO
EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CharacterStatTypes', @level2type=N'COLUMN',@level2name=N'isNumeric'
GO
EXEC sys.sp_dropextendedproperty @name=N'MS_Description' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CharacterStats', @level2type=N'CONSTRAINT',@level2name=N'FK_CharacterStats_CharacterStats'
GO
ALTER TABLE [dbo].[Users_RuleSets] DROP CONSTRAINT [FK_Users_RuleSets_RuleSets]
GO
ALTER TABLE [dbo].[Users_RuleSets] DROP CONSTRAINT [FK_Users_RuleSets_AspNetUsers]
GO
ALTER TABLE [dbo].[User_Preferences] DROP CONSTRAINT [FK_User_Preferences_AspNetUsers]
GO
ALTER TABLE [dbo].[User_Preferences] DROP CONSTRAINT [FK_User_Preferences_AccountTypes]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [FK_RuleSets_RuleSets1]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [FK_RuleSets_RuleSetGenres]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [FK_RuleSets_AspNetUsers2]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [FK_RuleSets_AspNetUsers1]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [FK_RuleSets_AspNetUsers]
GO
ALTER TABLE [dbo].[OpenIddictTokens] DROP CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens] DROP CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations] DROP CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_RuleSets]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_CharacterStatTypes]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_CharacterStats]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_AspNetUsers2]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_AspNetUsers1]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [FK_CharacterStats_AspNetUsers]
GO
ALTER TABLE [dbo].[CharacterStatChoices] DROP CONSTRAINT [FK_CharacterStatChoices_CharacterStats]
GO
ALTER TABLE [dbo].[CharacterStatCalcs] DROP CONSTRAINT [FK_CharacterStatCalcs_CharacterStats]
GO
ALTER TABLE [dbo].[Characters] DROP CONSTRAINT [FK_Characters_RuleSets]
GO
ALTER TABLE [dbo].[Characters] DROP CONSTRAINT [FK_Characters_AspNetUsers]
GO
ALTER TABLE [dbo].[AspNetUserTokens] DROP CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserRoles] DROP CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserRoles] DROP CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUserLogins] DROP CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserClaims] DROP CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetRoleClaims] DROP CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[User_Preferences] DROP CONSTRAINT [DF_User_Preferences_isDiceDisplayed]
GO
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [DF_RuleSets_isActive]
GO
ALTER TABLE [dbo].[CharacterStatTypes] DROP CONSTRAINT [DF_CharacterStatTypes_isNumeric]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [DF_CharacterStats_isMultiSelect]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [DF_CharacterStats_ModifiedDate]
GO
ALTER TABLE [dbo].[CharacterStats] DROP CONSTRAINT [DF_CharacterStats_CreatedDate]
GO
/****** Object:  Index [UIX_RuleSets]    Script Date: 6/3/2018 11:54:59 PM ******/
ALTER TABLE [dbo].[RuleSets] DROP CONSTRAINT [UIX_RuleSets]
GO
/****** Object:  Index [UIX_CharacterStatCalcs_CharacterStatId]    Script Date: 6/3/2018 11:54:59 PM ******/
ALTER TABLE [dbo].[CharacterStatCalcs] DROP CONSTRAINT [UIX_CharacterStatCalcs_CharacterStatId]
GO
/****** Object:  Index [UIX_Characters_UserId_CharacterName]    Script Date: 6/3/2018 11:54:59 PM ******/
ALTER TABLE [dbo].[Characters] DROP CONSTRAINT [UIX_Characters_UserId_CharacterName]
GO
/****** Object:  Index [UIX_AccountTypes_AccountTypeName]    Script Date: 6/3/2018 11:54:59 PM ******/
ALTER TABLE [dbo].[AccountTypes] DROP CONSTRAINT [UIX_AccountTypes_AccountTypeName]
GO
/****** Object:  Table [dbo].[Users_RuleSets]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[Users_RuleSets]
GO
/****** Object:  Table [dbo].[User_Preferences]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[User_Preferences]
GO
/****** Object:  Table [dbo].[UpdatedReferenceValue]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[UpdatedReferenceValue]
GO
/****** Object:  Table [dbo].[RuleSets]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[RuleSets]
GO
/****** Object:  Table [dbo].[RuleSetGenres]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[RuleSetGenres]
GO
/****** Object:  Table [dbo].[OpenIddictTokens]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[OpenIddictTokens]
GO
/****** Object:  Table [dbo].[OpenIddictScopes]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[OpenIddictScopes]
GO
/****** Object:  Table [dbo].[OpenIddictAuthorizations]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[OpenIddictAuthorizations]
GO
/****** Object:  Table [dbo].[OpenIddictApplications]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[OpenIddictApplications]
GO
/****** Object:  Table [dbo].[CharacterStatTypes]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[CharacterStatTypes]
GO
/****** Object:  Table [dbo].[CharacterStats]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[CharacterStats]
GO
/****** Object:  Table [dbo].[CharacterStatChoices]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[CharacterStatChoices]
GO
/****** Object:  Table [dbo].[CharacterStatCalcs]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[CharacterStatCalcs]
GO
/****** Object:  Table [dbo].[Characters]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[Characters]
GO
/****** Object:  Table [dbo].[AspNetUserTokens]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetUserTokens]
GO
/****** Object:  Table [dbo].[AspNetUsers]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetUsers]
GO
/****** Object:  Table [dbo].[AspNetUserRoles]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetUserRoles]
GO
/****** Object:  Table [dbo].[AspNetUserLogins]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetUserLogins]
GO
/****** Object:  Table [dbo].[AspNetUserClaims]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetUserClaims]
GO
/****** Object:  Table [dbo].[AspNetRoles]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetRoles]
GO
/****** Object:  Table [dbo].[AspNetRoleClaims]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AspNetRoleClaims]
GO
/****** Object:  Table [dbo].[AccountTypes]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[AccountTypes]
GO
/****** Object:  Table [dbo].[__MigrationHistory]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[__MigrationHistory]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 6/3/2018 11:54:59 PM ******/
DROP TABLE [dbo].[__EFMigrationsHistory]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[__MigrationHistory]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__MigrationHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ContextKey] [nvarchar](300) NOT NULL,
	[Model] [varbinary](max) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK_dbo.__MigrationHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC,
	[ContextKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AccountTypes]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccountTypes](
	[AccountTypeId] [tinyint] IDENTITY(1,1) NOT NULL,
	[AccountTypeName] [nvarchar](50) NOT NULL,
	[AccountTypeDescription] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_AccountTypes] PRIMARY KEY CLUSTERED 
(
	[AccountTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoleClaims]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoleClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
	[RoleId] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoles]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoles](
	[Id] [nvarchar](128) NOT NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
	[CreatedBy] [nvarchar](max) NULL,
	[CreatedDate] [datetime2](7) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[Name] [nvarchar](128) NULL,
	[NormalizedName] [nvarchar](256) NULL,
	[UpdatedBy] [nvarchar](max) NULL,
	[UpdatedDate] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserClaims]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
	[UserId] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserLogins]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserLogins](
	[LoginProvider] [nvarchar](128) NOT NULL,
	[ProviderKey] [nvarchar](128) NOT NULL,
	[ProviderDisplayName] [nvarchar](max) NULL,
	[UserId] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY CLUSTERED 
(
	[LoginProvider] ASC,
	[ProviderKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserRoles]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserRoles](
	[UserId] [nvarchar](128) NOT NULL,
	[RoleId] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUsers]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUsers](
	[Id] [nvarchar](128) NOT NULL,
	[AccessFailedCount] [int] NOT NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
	[Configuration] [nvarchar](max) NULL,
	[CreatedBy] [nvarchar](max) NULL,
	[CreatedDate] [datetime2](7) NOT NULL,
	[Email] [nvarchar](256) NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[FullName] [nvarchar](max) NULL,
	[IsEnabled] [bit] NOT NULL,
	[JobTitle] [nvarchar](max) NULL,
	[LockoutEnabled] [bit] NOT NULL,
	[LockoutEnd] [datetimeoffset](7) NULL,
	[NormalizedEmail] [nvarchar](256) NULL,
	[NormalizedUserName] [nvarchar](256) NULL,
	[PasswordHash] [nvarchar](500) NULL,
	[PhoneNumber] [nvarchar](30) NULL,
	[PhoneNumberConfirmed] [bit] NOT NULL,
	[SecurityStamp] [nvarchar](500) NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[UpdatedBy] [nvarchar](50) NULL,
	[UpdatedDate] [datetime2](7) NOT NULL,
	[UserName] [nvarchar](256) NULL,
	[ProfileImage] [nvarchar](400) NULL,
 CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserTokens]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserTokens](
	[UserId] [nvarchar](128) NOT NULL,
	[LoginProvider] [nvarchar](128) NOT NULL,
	[Name] [nvarchar](128) NOT NULL,
	[Value] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[LoginProvider] ASC,
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Characters]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Characters](
	[CharacterId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [nvarchar](128) NOT NULL,
	[RuleSetId] [int] NOT NULL,
	[CharacterName] [nvarchar](100) NOT NULL,
	[CharacterDescription] [nvarchar](4000) NULL,
	[ImageUrl] [nvarchar](400) NULL,
	[ThumbnailUrl] [nvarchar](400) NULL,
 CONSTRAINT [PK_Characters] PRIMARY KEY CLUSTERED 
(
	[CharacterId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CharacterStatCalcs]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CharacterStatCalcs](
	[CharacterStatCalcId] [int] IDENTITY(1,1) NOT NULL,
	[CharacterStatId] [int] NOT NULL,
	[StatCalculation] [nvarchar](500) NOT NULL,
 CONSTRAINT [PK_CharacterStatCalcs] PRIMARY KEY CLUSTERED 
(
	[CharacterStatCalcId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CharacterStatChoices]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CharacterStatChoices](
	[CharacterStatChoiceId] [int] IDENTITY(1,1) NOT NULL,
	[CharacterStatId] [int] NOT NULL,
	[StatChoiceValue] [nvarchar](100) NULL,
 CONSTRAINT [PK_CharacterStatChoices] PRIMARY KEY CLUSTERED 
(
	[CharacterStatChoiceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CharacterStats]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CharacterStats](
	[CharacterStatId] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetId] [int] NOT NULL,
	[isActive] [bit] NOT NULL,
	[StatName] [nvarchar](100) NOT NULL,
	[CharacterStatTypeId] [smallint] NOT NULL,
	[StatDesc] [nvarchar](4000) NULL,
	[OwnerId] [nvarchar](128) NOT NULL,
	[CreatedDate] [datetime2](7) NOT NULL,
	[CreatedBy] [nvarchar](128) NOT NULL,
	[ModifiedDate] [datetime2](7) NULL,
	[ModifiedBy] [nvarchar](128) NULL,
	[isMultiSelect] [bit] NOT NULL,
	[ParentCharacterStatId] [int] NULL,
	[SortOrder] [smallint] NOT NULL,
 CONSTRAINT [PK_CharacterStats] PRIMARY KEY CLUSTERED 
(
	[CharacterStatId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CharacterStatTypes]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CharacterStatTypes](
	[CharacterStatTypeId] [smallint] IDENTITY(1,1) NOT NULL,
	[StatTypeName] [nvarchar](255) NOT NULL,
	[StatTypeDesc] [nvarchar](4000) NULL,
	[isNumeric] [bit] NOT NULL,
 CONSTRAINT [PK_CharacterStatTypes] PRIMARY KEY CLUSTERED 
(
	[CharacterStatTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictApplications]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictApplications](
	[Id] [nvarchar](450) NOT NULL,
	[ClientId] [nvarchar](450) NOT NULL,
	[ClientSecret] [nvarchar](max) NULL,
	[ConcurrencyToken] [nvarchar](max) NULL,
	[ConsentType] [nvarchar](max) NULL,
	[DisplayName] [nvarchar](max) NULL,
	[Permissions] [nvarchar](max) NULL,
	[PostLogoutRedirectUris] [nvarchar](max) NULL,
	[Properties] [nvarchar](max) NULL,
	[RedirectUris] [nvarchar](max) NULL,
	[Type] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_OpenIddictApplications] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictAuthorizations]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictAuthorizations](
	[Id] [nvarchar](450) NOT NULL,
	[ApplicationId] [nvarchar](450) NULL,
	[ConcurrencyToken] [nvarchar](max) NULL,
	[Properties] [nvarchar](max) NULL,
	[Scopes] [nvarchar](max) NULL,
	[Status] [nvarchar](max) NOT NULL,
	[Subject] [nvarchar](max) NOT NULL,
	[Type] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_OpenIddictAuthorizations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictScopes]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictScopes](
	[Id] [nvarchar](450) NOT NULL,
	[ConcurrencyToken] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[DisplayName] [nvarchar](max) NULL,
	[Name] [nvarchar](128) NOT NULL,
	[Properties] [nvarchar](max) NULL,
	[Resources] [nvarchar](max) NULL,
 CONSTRAINT [PK_OpenIddictScopes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictTokens]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictTokens](
	[Id] [nvarchar](450) NOT NULL,
	[ApplicationId] [nvarchar](450) NULL,
	[AuthorizationId] [nvarchar](450) NULL,
	[ConcurrencyToken] [nvarchar](max) NULL,
	[CreationDate] [datetimeoffset](7) NULL,
	[ExpirationDate] [datetimeoffset](7) NULL,
	[Payload] [nvarchar](max) NULL,
	[Properties] [nvarchar](max) NULL,
	[ReferenceId] [nvarchar](450) NULL,
	[Status] [nvarchar](max) NULL,
	[Subject] [nvarchar](max) NOT NULL,
	[Type] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_OpenIddictTokens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RuleSetGenres]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RuleSetGenres](
	[RuleSetGenreId] [smallint] IDENTITY(1,1) NOT NULL,
	[GenreName] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_RuleSetGenres] PRIMARY KEY CLUSTERED 
(
	[RuleSetGenreId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RuleSets]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RuleSets](
	[RuleSetId] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetName] [nvarchar](255) NOT NULL,
	[RuleSetDesc] [nvarchar](4000) NULL,
	[isActive] [bit] NOT NULL,
	[DefaultDice] [nvarchar](255) NULL,
	[CurrencyLabel] [nvarchar](20) NULL,
	[WeightLabel] [nvarchar](20) NULL,
	[DistanceLabel] [nvarchar](20) NULL,
	[VolumeLabel] [nvarchar](20) NULL,
	[IsCoreContent] [bit] NULL,
	[OwnerId] [nvarchar](128) NOT NULL,
	[CreatedBy] [nvarchar](128) NOT NULL,
	[CreatedDate] [datetime2](7) NOT NULL,
	[ModifiedBy] [nvarchar](128) NULL,
	[ModifiedDate] [datetime2](7) NULL,
	[SortOrder] [int] NULL,
	[RuleSetGenreId] [smallint] NULL,
	[ParentRuleSetId] [int] NULL,
	[ImageUrl] [nvarchar](400) NULL,
	[ThumbnailUrl] [nvarchar](400) NULL,
 CONSTRAINT [PK_RuleSets] PRIMARY KEY CLUSTERED 
(
	[RuleSetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UpdatedReferenceValue]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UpdatedReferenceValue](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[CreatedBy] [nvarchar](max) NULL,
	[ModifiedAt] [datetime2](7) NOT NULL,
	[ModifiedBy] [nvarchar](max) NULL,
	[ReferenceId] [int] NOT NULL,
	[ReferenceType] [int] NOT NULL,
	[UpdatedJsonValue] [nvarchar](1500) NULL,
 CONSTRAINT [PK_UpdatedReferenceValue] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User_Preferences]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User_Preferences](
	[UserId] [nvarchar](128) NOT NULL,
	[isDiceDisplayed] [bit] NOT NULL,
	[AccountTypeId] [tinyint] NOT NULL,
 CONSTRAINT [PK_User_Preferences] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users_RuleSets]    Script Date: 6/3/2018 11:54:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users_RuleSets](
	[RuleSetId] [int] NOT NULL,
	[UserId] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_Users_RuleSets] PRIMARY KEY CLUSTERED 
(
	[RuleSetId] ASC,
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180301170309_Initial', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180429175353_imageaspath', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180429183031_RuleSetMapDeleted', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180429183847_RuleSetMapDeletedDBContext', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180501140416_DefaultDicedaddedNameFiledMandetory', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180502174456_UpdateRuleSet', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180506113937_CharacterStatTableCreated', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180507172131_ForiegenRemovedFromRuleSet', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180507174805_ManyToManyRuleSetAndCharacterStates', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508172149_ChangeStringToIntCharacterStateId', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508174417_CharacterStateIdChangeToInt', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508182027_UpdatedReferenceValueAdded', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508183123_CalculationCommandChanged', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508184913_AddField_CalculationCommandTable', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180508185502_UpdateLength_CalculationCommandTable', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180510042003_InitialCreate', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180513192152_InitialModules', N'2.0.1-rtm-125')
GO
INSERT [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20180513195848_AddFieldInMappingRuleSetCharacterStat', N'2.0.1-rtm-125')
GO
SET IDENTITY_INSERT [dbo].[AspNetRoleClaims] ON 
GO
INSERT [dbo].[AspNetRoleClaims] ([Id], [ClaimType], [ClaimValue], [RoleId]) VALUES (1, N'permission', N'users.view', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
INSERT [dbo].[AspNetRoleClaims] ([Id], [ClaimType], [ClaimValue], [RoleId]) VALUES (2, N'permission', N'users.manage', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
INSERT [dbo].[AspNetRoleClaims] ([Id], [ClaimType], [ClaimValue], [RoleId]) VALUES (3, N'permission', N'roles.view', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
INSERT [dbo].[AspNetRoleClaims] ([Id], [ClaimType], [ClaimValue], [RoleId]) VALUES (4, N'permission', N'roles.manage', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
INSERT [dbo].[AspNetRoleClaims] ([Id], [ClaimType], [ClaimValue], [RoleId]) VALUES (5, N'permission', N'roles.assign', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
SET IDENTITY_INSERT [dbo].[AspNetRoleClaims] OFF
GO
INSERT [dbo].[AspNetRoles] ([Id], [ConcurrencyStamp], [CreatedBy], [CreatedDate], [Description], [Name], [NormalizedName], [UpdatedBy], [UpdatedDate]) VALUES (N'009b9335-143e-4d54-912d-c0579df1f2cf', N'67d31eb3-27ab-4f0c-aa9f-05ce1c8ffbd2', NULL, CAST(N'2018-05-17T00:06:40.6680120' AS DateTime2), N'Default user', N'user', N'USER', NULL, CAST(N'2018-05-17T00:06:40.6680120' AS DateTime2))
GO
INSERT [dbo].[AspNetRoles] ([Id], [ConcurrencyStamp], [CreatedBy], [CreatedDate], [Description], [Name], [NormalizedName], [UpdatedBy], [UpdatedDate]) VALUES (N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63', N'187c2bbc-c1cb-4444-896c-4c3ec78464e8', NULL, CAST(N'2018-05-17T00:06:38.2307837' AS DateTime2), N'Default administrator', N'administrator', N'ADMINISTRATOR', NULL, CAST(N'2018-05-17T00:06:40.2320543' AS DateTime2))
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'2eaf8e9f-6bd3-4814-9235-c1142ed827a5', N'009b9335-143e-4d54-912d-c0579df1f2cf')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'622dd2b0-c6ce-49fd-9210-6dcec6658b6f', N'009b9335-143e-4d54-912d-c0579df1f2cf')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'aee2090e-44c7-476d-b94b-a375d0e07ec8', N'009b9335-143e-4d54-912d-c0579df1f2cf')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'string', N'009b9335-143e-4d54-912d-c0579df1f2cf')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'2f44eca3-bc54-43e5-af2c-6f35d4a4bf63')
GO
INSERT [dbo].[AspNetUsers] ([Id], [AccessFailedCount], [ConcurrencyStamp], [Configuration], [CreatedBy], [CreatedDate], [Email], [EmailConfirmed], [FullName], [IsEnabled], [JobTitle], [LockoutEnabled], [LockoutEnd], [NormalizedEmail], [NormalizedUserName], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UpdatedBy], [UpdatedDate], [UserName], [ProfileImage]) VALUES (N'2eaf8e9f-6bd3-4814-9235-c1142ed827a5', 0, N'b1fb8a0f-2ebb-492e-9177-15f94c6e9a38', NULL, NULL, CAST(N'2018-05-17T00:06:42.8462278' AS DateTime2), N'user@ebenmonney.com', 1, N'Inbuilt Standard User', 1, NULL, 1, NULL, N'USER@EBENMONNEY.COM', N'USER', N'AQAAAAEAACcQAAAAEIZaAzY0ZqJFq7SaRa5uGORRd9gs3ZnzJWvWaoWq3ubJ4/F2ICKUEbh9y4eoRxMg+A==', N'+1 (123) 000-0001', 0, N'695997d4-198d-4e5b-8216-2a1086656364', 0, NULL, CAST(N'2018-05-17T00:06:43.7838189' AS DateTime2), N'user', NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [AccessFailedCount], [ConcurrencyStamp], [Configuration], [CreatedBy], [CreatedDate], [Email], [EmailConfirmed], [FullName], [IsEnabled], [JobTitle], [LockoutEnabled], [LockoutEnd], [NormalizedEmail], [NormalizedUserName], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UpdatedBy], [UpdatedDate], [UserName], [ProfileImage]) VALUES (N'622dd2b0-c6ce-49fd-9210-6dcec6658b6f', 0, N'0468e0cb-4ccf-4a65-8dd7-74f30baccb47', NULL, NULL, CAST(N'2018-05-17T01:28:31.6533666' AS DateTime2), N'gary@neteazy.com', 0, N'gary gary', 0, N'developer', 1, NULL, N'GARY@NETEAZY.COM', N'GARY', N'AQAAAAEAACcQAAAAEFHhhZRXcsFWirQ+AhySJKefxjJpk2yBghrAsmJgQeLQ1UVFbLrA+WGvjpCGh6Aa7Q==', N'0168371548111', 0, N'ab12b192-681d-4ad1-9e15-8793abba9f73', 0, NULL, CAST(N'2018-05-17T01:28:32.5184690' AS DateTime2), N'gary', NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [AccessFailedCount], [ConcurrencyStamp], [Configuration], [CreatedBy], [CreatedDate], [Email], [EmailConfirmed], [FullName], [IsEnabled], [JobTitle], [LockoutEnabled], [LockoutEnd], [NormalizedEmail], [NormalizedUserName], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UpdatedBy], [UpdatedDate], [UserName], [ProfileImage]) VALUES (N'aee2090e-44c7-476d-b94b-a375d0e07ec8', 0, N'a5f5bbb6-635e-407e-8c43-7b2aa646d44d', NULL, NULL, CAST(N'2018-05-17T02:15:23.1431819' AS DateTime2), N'kapil.guleria074@gmail.com', 0, N'kapil kapil', 0, N'developer', 1, NULL, N'KAPIL.GULERIA074@GMAIL.COM', N'KAPIL', N'AQAAAAEAACcQAAAAEOEpYcdlhPGugTP3FNnTJ+SPFU+gqAZDGplOtXES5I053+z75/fWVD3f96E1rbDxQw==', N'0168371548111', 0, N'1ad640e0-b623-420f-898c-4cacdbdd2f25', 0, NULL, CAST(N'2018-05-17T02:15:23.3808906' AS DateTime2), N'kapil', NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [AccessFailedCount], [ConcurrencyStamp], [Configuration], [CreatedBy], [CreatedDate], [Email], [EmailConfirmed], [FullName], [IsEnabled], [JobTitle], [LockoutEnabled], [LockoutEnd], [NormalizedEmail], [NormalizedUserName], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UpdatedBy], [UpdatedDate], [UserName], [ProfileImage]) VALUES (N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 0, N'7f650051-8875-42ef-b43d-18411f93a1a2', NULL, NULL, CAST(N'2018-05-17T00:06:41.3392677' AS DateTime2), N'admin@ebenmonney.com', 1, N'Inbuilt Administrator', 1, NULL, 1, NULL, N'ADMIN@EBENMONNEY.COM', N'ADMIN', N'AQAAAAEAACcQAAAAELFA+x1NTUrMTfGXQMnaflrX69gBVUyXt45j4xYXEeyvFxabmbU0osNpgoQPXkWclA==', N'+1 (123) 000-0000', 0, N'61315c8c-0886-49be-8c15-80bf4dc70ec5', 0, NULL, CAST(N'2018-05-24T19:58:32.5892023' AS DateTime2), N'admin', NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [AccessFailedCount], [ConcurrencyStamp], [Configuration], [CreatedBy], [CreatedDate], [Email], [EmailConfirmed], [FullName], [IsEnabled], [JobTitle], [LockoutEnabled], [LockoutEnd], [NormalizedEmail], [NormalizedUserName], [PasswordHash], [PhoneNumber], [PhoneNumberConfirmed], [SecurityStamp], [TwoFactorEnabled], [UpdatedBy], [UpdatedDate], [UserName], [ProfileImage]) VALUES (N'string', 0, N'e20c5e5e-33c3-4b31-a79b-5010d1132f40', N'string', NULL, CAST(N'2018-06-03T17:46:41.4094856' AS DateTime2), N'aminul.haque@bs-23.com', 0, N'string', 1, N'string', 1, NULL, N'AMINUL.HAQUE@BS-23.COM', N'STRING2222222222222222', N'AQAAAAEAACcQAAAAECVvy8ckFG6wsUc5LV+KFCxFWoj0TBWlIma5w538MwCBZ6y/gh9p/eHHK04eLbc1lQ==', N'string', 0, N'SOD5F5MPN5LOJV7JTRVSJV5IG3OYD5JC', 0, NULL, CAST(N'2018-06-03T17:46:41.6000766' AS DateTime2), N'string2222222222222222', N'https://rpgsmithsa.blob.core.windows.net/media/70b70957-e34c-4ef5-8d11-17287894ee8b.jpg')
GO
SET IDENTITY_INSERT [dbo].[Characters] ON 
GO
INSERT [dbo].[Characters] ([CharacterId], [UserId], [RuleSetId], [CharacterName], [CharacterDescription], [ImageUrl], [ThumbnailUrl]) VALUES (1, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 2, N'string111111111111', N'string', NULL, NULL)
GO
INSERT [dbo].[Characters] ([CharacterId], [UserId], [RuleSetId], [CharacterName], [CharacterDescription], [ImageUrl], [ThumbnailUrl]) VALUES (2, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 2026, N'string', N'string', N'https://rpgsmithsa.blob.core.windows.net/media/769f0e2a-2815-4dc9-815c-07a0b7984297.png', N'https://rpgsmithsa.blob.core.windows.net/media/769f0e2a-2815-4dc9-815c-07a0b7984297-thumbnail.png')
GO
SET IDENTITY_INSERT [dbo].[Characters] OFF
GO
SET IDENTITY_INSERT [dbo].[CharacterStatCalcs] ON 
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (1, 5, N'string3333333333333')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (3, 7, N'string')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (7, 8, N'string11')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (9, 9, N'string11')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (1002, 1002, N'string1111x')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (2002, 2027, N'string1111x')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (2005, 2033, N'string3333333333333')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (2006, 2034, N'string')
GO
INSERT [dbo].[CharacterStatCalcs] ([CharacterStatCalcId], [CharacterStatId], [StatCalculation]) VALUES (2007, 2035, N'string11')
GO
SET IDENTITY_INSERT [dbo].[CharacterStatCalcs] OFF
GO
SET IDENTITY_INSERT [dbo].[CharacterStatChoices] ON 
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (1, 5, N'string33333333')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (2, 7, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (3, 5, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (4, 9, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (5, 9, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (6, 9, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (1002, 1002, N'stringxx')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (2002, 2033, N'string')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (2003, 2033, N'string33333333')
GO
INSERT [dbo].[CharacterStatChoices] ([CharacterStatChoiceId], [CharacterStatId], [StatChoiceValue]) VALUES (2004, 2034, N'string')
GO
SET IDENTITY_INSERT [dbo].[CharacterStatChoices] OFF
GO
SET IDENTITY_INSERT [dbo].[CharacterStats] ON 
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (5, 5, 1, N'string4444444444', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T13:44:57.0414270' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-29T23:07:39.7262838' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (7, 5, 1, N'string1', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T13:45:00.3755259' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-29T23:07:39.7262856' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 3)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (8, 5, 1, N'string111', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T13:45:01.3912568' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-29T23:07:39.7262861' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 1)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (9, 5, 1, N'string11122', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T13:45:02.2120428' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-25T02:28:03.1204657' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 0)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (1002, 5, 1, N'stringcccccccccccccccccccccccccc', 2, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T13:45:02.9336043' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-25T16:38:57.2769804' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2023, 2023, 1, N'string4444444444', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.5463756' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.5468562' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2024, 2023, 1, N'string1', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6301697' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6301711' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 3)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2025, 2023, 1, N'string111', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6377289' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6377302' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 1)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2026, 2023, 1, N'string11122', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6480488' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6480501' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 0)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2027, 2023, 1, N'stringcccccccccccccccccccccccccc', 2, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6538163' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:26.6538172' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2028, 2024, 1, N'string4444444444', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.8167844' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.8171663' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2029, 2024, 1, N'string1', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9079591' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9079608' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 3)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2030, 2024, 1, N'string111', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9230648' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9230662' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 1)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2031, 2024, 1, N'string11122', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9334977' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9334990' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 0)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2032, 2024, 1, N'stringcccccccccccccccccccccccccc', 2, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9439309' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:48.9439322' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2033, 2025, 1, N'string4444444444', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:44:58.4505676' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:44:58.4538907' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 2)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2034, 2025, 1, N'string1', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:46:19.6393282' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:46:19.6393295' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 3)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2035, 2025, 1, N'string111', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:46:20.7350401' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:46:20.7350419' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 1)
GO
INSERT [dbo].[CharacterStats] ([CharacterStatId], [RuleSetId], [isActive], [StatName], [CharacterStatTypeId], [StatDesc], [OwnerId], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy], [isMultiSelect], [ParentCharacterStatId], [SortOrder]) VALUES (2036, 2025, 1, N'string1112233', 1, N'string', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:46:21.5186773' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-31T12:46:31.3653023' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', 1, NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[CharacterStats] OFF
GO
SET IDENTITY_INSERT [dbo].[CharacterStatTypes] ON 
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (1, N'Text', N'Text', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (2, N'Rich Text', N'Rich Text', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (3, N'Number', N'Number', 1)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (4, N'Current & Max', N'Current & Max', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (5, N'Choice', N'Choice', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (6, N'Yes / No', N'Yes / No', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (7, N'On / Off', N'On / Off', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (8, N'Value & Sub-Value', N'Value & Sub-Value', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (9, N'Calculation', N'Calculation', 0)
GO
INSERT [dbo].[CharacterStatTypes] ([CharacterStatTypeId], [StatTypeName], [StatTypeDesc], [isNumeric]) VALUES (10, N'Command', N'Command', 0)
GO
SET IDENTITY_INSERT [dbo].[CharacterStatTypes] OFF
GO
INSERT [dbo].[OpenIddictAuthorizations] ([Id], [ApplicationId], [ConcurrencyToken], [Properties], [Scopes], [Status], [Subject], [Type]) VALUES (N'6c88c9c8-e093-4dc2-b7ee-61e713d04a5c', NULL, N'b8654ccf-05dc-4b9b-af7b-acb3f55e80da', NULL, N'["openid","email","phone","profile","offline_access","roles"]', N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ad-hoc')
GO
INSERT [dbo].[OpenIddictAuthorizations] ([Id], [ApplicationId], [ConcurrencyToken], [Properties], [Scopes], [Status], [Subject], [Type]) VALUES (N'98be2526-5447-4da4-97db-a631cc12e842', NULL, N'41b8b36c-3c84-484f-a76e-a1631faf624c', NULL, N'["openid","email","phone","profile","offline_access","roles"]', N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ad-hoc')
GO
INSERT [dbo].[OpenIddictAuthorizations] ([Id], [ApplicationId], [ConcurrencyToken], [Properties], [Scopes], [Status], [Subject], [Type]) VALUES (N'ef13095c-6e85-4097-b498-8e31adbfcd12', NULL, N'6a393b17-dfbf-457a-8884-596b47092979', NULL, N'["openid","email","phone","profile","offline_access","roles"]', N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ad-hoc')
GO
INSERT [dbo].[OpenIddictTokens] ([Id], [ApplicationId], [AuthorizationId], [ConcurrencyToken], [CreationDate], [ExpirationDate], [Payload], [Properties], [ReferenceId], [Status], [Subject], [Type]) VALUES (N'42a8d6d0-6ffa-4510-bfb1-3bf324cd9231', NULL, N'98be2526-5447-4da4-97db-a631cc12e842', N'184d60bf-915f-47be-bc57-8eae5c405768', CAST(N'2018-05-24T19:58:33.0000000+00:00' AS DateTimeOffset), CAST(N'2018-06-07T19:58:33.0000000+00:00' AS DateTimeOffset), NULL, NULL, NULL, N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'refresh_token')
GO
INSERT [dbo].[OpenIddictTokens] ([Id], [ApplicationId], [AuthorizationId], [ConcurrencyToken], [CreationDate], [ExpirationDate], [Payload], [Properties], [ReferenceId], [Status], [Subject], [Type]) VALUES (N'4ac96466-99c0-442e-877f-e5a8445d7338', NULL, N'ef13095c-6e85-4097-b498-8e31adbfcd12', N'78889071-d18e-4512-b09e-875d787874ea', CAST(N'2018-05-28T18:24:48.0000000+00:00' AS DateTimeOffset), CAST(N'2018-06-11T18:24:48.0000000+00:00' AS DateTimeOffset), NULL, NULL, NULL, N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'refresh_token')
GO
INSERT [dbo].[OpenIddictTokens] ([Id], [ApplicationId], [AuthorizationId], [ConcurrencyToken], [CreationDate], [ExpirationDate], [Payload], [Properties], [ReferenceId], [Status], [Subject], [Type]) VALUES (N'f0a3c4a6-8aee-4a6c-9fb8-f9e4e8e65ed8', NULL, N'6c88c9c8-e093-4dc2-b7ee-61e713d04a5c', N'37511034-ccc6-49c2-9573-969e26d2df53', CAST(N'2018-05-28T19:19:42.0000000+00:00' AS DateTimeOffset), CAST(N'2018-06-11T19:19:42.0000000+00:00' AS DateTimeOffset), NULL, NULL, NULL, N'valid', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'refresh_token')
GO
SET IDENTITY_INSERT [dbo].[RuleSets] ON 
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2, N'string', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-24T23:20:39.3540709' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-24T23:20:39.3544837' AS DateTime2), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (4, N'string1', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-24T23:20:39.3540709' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-24T23:20:39.3544837' AS DateTime2), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (5, N'string3', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-25T02:01:27.3941516' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-25T02:04:52.6433119' AS DateTime2), 2, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2005, N'string777777222222777717777', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-29T02:32:25.0856896' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-29T02:32:25.0862961' AS DateTime2), 1, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2023, N'strin1wqw2gwawsasad1552012', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:23.7847192' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:35:25.3663148' AS DateTime2), 1, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2024, N'string2', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:47.8672269' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:43:47.8674710' AS DateTime2), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2025, N'string32', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:44:54.8278427' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-05-30T14:44:54.8282524' AS DateTime2), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[RuleSets] ([RuleSetId], [RuleSetName], [RuleSetDesc], [isActive], [DefaultDice], [CurrencyLabel], [WeightLabel], [DistanceLabel], [VolumeLabel], [IsCoreContent], [OwnerId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [SortOrder], [RuleSetGenreId], [ParentRuleSetId], [ImageUrl], [ThumbnailUrl]) VALUES (2026, N'stringvvvvvvvvvvv', N'string', 1, N'string', N'string', N'string', N'string', N'string', NULL, N'ec34768b-c2ff-43b2-9bf3-d0946d416482', N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-06-03T23:50:36.0384204' AS DateTime2), N'ec34768b-c2ff-43b2-9bf3-d0946d416482', CAST(N'2018-06-03T23:50:36.0388185' AS DateTime2), 3, NULL, NULL, N'https://rpgsmithsa.blob.core.windows.net/media/769f0e2a-2815-4dc9-815c-07a0b7984297.png', N'https://rpgsmithsa.blob.core.windows.net/media/769f0e2a-2815-4dc9-815c-07a0b7984297-thumbnail.png')
GO
SET IDENTITY_INSERT [dbo].[RuleSets] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UIX_AccountTypes_AccountTypeName]    Script Date: 6/3/2018 11:55:00 PM ******/
ALTER TABLE [dbo].[AccountTypes] ADD  CONSTRAINT [UIX_AccountTypes_AccountTypeName] UNIQUE NONCLUSTERED 
(
	[AccountTypeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [UIX_Characters_UserId_CharacterName]    Script Date: 6/3/2018 11:55:00 PM ******/
ALTER TABLE [dbo].[Characters] ADD  CONSTRAINT [UIX_Characters_UserId_CharacterName] UNIQUE NONCLUSTERED 
(
	[CharacterId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [UIX_CharacterStatCalcs_CharacterStatId]    Script Date: 6/3/2018 11:55:00 PM ******/
ALTER TABLE [dbo].[CharacterStatCalcs] ADD  CONSTRAINT [UIX_CharacterStatCalcs_CharacterStatId] UNIQUE NONCLUSTERED 
(
	[CharacterStatId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UIX_RuleSets]    Script Date: 6/3/2018 11:55:00 PM ******/
ALTER TABLE [dbo].[RuleSets] ADD  CONSTRAINT [UIX_RuleSets] UNIQUE NONCLUSTERED 
(
	[RuleSetName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[CharacterStats] ADD  CONSTRAINT [DF_CharacterStats_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[CharacterStats] ADD  CONSTRAINT [DF_CharacterStats_ModifiedDate]  DEFAULT (getdate()) FOR [ModifiedDate]
GO
ALTER TABLE [dbo].[CharacterStats] ADD  CONSTRAINT [DF_CharacterStats_isMultiSelect]  DEFAULT ((0)) FOR [isMultiSelect]
GO
ALTER TABLE [dbo].[CharacterStatTypes] ADD  CONSTRAINT [DF_CharacterStatTypes_isNumeric]  DEFAULT ((0)) FOR [isNumeric]
GO
ALTER TABLE [dbo].[RuleSets] ADD  CONSTRAINT [DF_RuleSets_isActive]  DEFAULT ((0)) FOR [isActive]
GO
ALTER TABLE [dbo].[User_Preferences] ADD  CONSTRAINT [DF_User_Preferences_isDiceDisplayed]  DEFAULT ((1)) FOR [isDiceDisplayed]
GO
ALTER TABLE [dbo].[AspNetRoleClaims]  WITH CHECK ADD  CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetRoleClaims] CHECK CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUserClaims]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserClaims] CHECK CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserLogins]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserLogins] CHECK CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserRoles]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUserRoles]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[AspNetUserTokens]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserTokens] CHECK CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[Characters]  WITH CHECK ADD  CONSTRAINT [FK_Characters_AspNetUsers] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Characters] CHECK CONSTRAINT [FK_Characters_AspNetUsers]
GO
ALTER TABLE [dbo].[Characters]  WITH CHECK ADD  CONSTRAINT [FK_Characters_RuleSets] FOREIGN KEY([RuleSetId])
REFERENCES [dbo].[RuleSets] ([RuleSetId])
GO
ALTER TABLE [dbo].[Characters] CHECK CONSTRAINT [FK_Characters_RuleSets]
GO
ALTER TABLE [dbo].[CharacterStatCalcs]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStatCalcs_CharacterStats] FOREIGN KEY([CharacterStatId])
REFERENCES [dbo].[CharacterStats] ([CharacterStatId])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CharacterStatCalcs] CHECK CONSTRAINT [FK_CharacterStatCalcs_CharacterStats]
GO
ALTER TABLE [dbo].[CharacterStatChoices]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStatChoices_CharacterStats] FOREIGN KEY([CharacterStatId])
REFERENCES [dbo].[CharacterStats] ([CharacterStatId])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CharacterStatChoices] CHECK CONSTRAINT [FK_CharacterStatChoices_CharacterStats]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_AspNetUsers] FOREIGN KEY([OwnerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_AspNetUsers]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_AspNetUsers1] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_AspNetUsers1]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_AspNetUsers2] FOREIGN KEY([ModifiedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_AspNetUsers2]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_CharacterStats] FOREIGN KEY([ParentCharacterStatId])
REFERENCES [dbo].[CharacterStats] ([CharacterStatId])
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_CharacterStats]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_CharacterStatTypes] FOREIGN KEY([CharacterStatTypeId])
REFERENCES [dbo].[CharacterStatTypes] ([CharacterStatTypeId])
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_CharacterStatTypes]
GO
ALTER TABLE [dbo].[CharacterStats]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStats_RuleSets] FOREIGN KEY([RuleSetId])
REFERENCES [dbo].[RuleSets] ([RuleSetId])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CharacterStats] CHECK CONSTRAINT [FK_CharacterStats_RuleSets]
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId] FOREIGN KEY([ApplicationId])
REFERENCES [dbo].[OpenIddictApplications] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations] CHECK CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId] FOREIGN KEY([ApplicationId])
REFERENCES [dbo].[OpenIddictApplications] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictTokens] CHECK CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId] FOREIGN KEY([AuthorizationId])
REFERENCES [dbo].[OpenIddictAuthorizations] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictTokens] CHECK CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId]
GO
ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_AspNetUsers] FOREIGN KEY([OwnerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_AspNetUsers]
GO
ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_AspNetUsers1] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_AspNetUsers1]
GO
ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_AspNetUsers2] FOREIGN KEY([ModifiedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_AspNetUsers2]
GO
ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_RuleSetGenres] FOREIGN KEY([RuleSetGenreId])
REFERENCES [dbo].[RuleSetGenres] ([RuleSetGenreId])
GO
ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_RuleSetGenres]
GO
ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_RuleSets1] FOREIGN KEY([ParentRuleSetId])
REFERENCES [dbo].[RuleSets] ([RuleSetId])
GO
ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_RuleSets1]
GO
ALTER TABLE [dbo].[User_Preferences]  WITH CHECK ADD  CONSTRAINT [FK_User_Preferences_AccountTypes] FOREIGN KEY([AccountTypeId])
REFERENCES [dbo].[AccountTypes] ([AccountTypeId])
GO
ALTER TABLE [dbo].[User_Preferences] CHECK CONSTRAINT [FK_User_Preferences_AccountTypes]
GO
ALTER TABLE [dbo].[User_Preferences]  WITH CHECK ADD  CONSTRAINT [FK_User_Preferences_AspNetUsers] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[User_Preferences] CHECK CONSTRAINT [FK_User_Preferences_AspNetUsers]
GO
ALTER TABLE [dbo].[Users_RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_Users_RuleSets_AspNetUsers] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Users_RuleSets] CHECK CONSTRAINT [FK_Users_RuleSets_AspNetUsers]
GO
ALTER TABLE [dbo].[Users_RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_Users_RuleSets_RuleSets] FOREIGN KEY([RuleSetId])
REFERENCES [dbo].[RuleSets] ([RuleSetId])
GO
ALTER TABLE [dbo].[Users_RuleSets] CHECK CONSTRAINT [FK_Users_RuleSets_RuleSets]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Establishes Parent Child relationship' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CharacterStats', @level2type=N'CONSTRAINT',@level2name=N'FK_CharacterStats_CharacterStats'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'If set, will indicate that the characterstat can be used in formulas and calculations' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'CharacterStatTypes', @level2type=N'COLUMN',@level2name=N'isNumeric'
GO
