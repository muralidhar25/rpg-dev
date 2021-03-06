USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_Ability]    Script Date: 4/4/2019 10:40:49 AM ******/
CREATE TYPE [dbo].[Type_Ability] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetId] [int] NULL,
	[Name] [nvarchar](255) NULL,
	[Level] [nvarchar](max) NULL,
	[Command] [nvarchar](max) NULL,
	[MaxNumberOfUses] [int] NULL,
	[CurrentNumberOfUses] [int] NULL,
	[Description] [nvarchar](max) NULL,
	[Stats] [nvarchar](max) NULL,
	[ImageUrl] [nvarchar](2048) NULL,
	[IsEnabled] [bit] NULL,
	[Metatags] [nvarchar](max) NULL,
	[ParentAbilityId] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldAbilityId] [int] NULL
)
GO
