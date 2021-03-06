USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_Spell]    Script Date: 4/4/2019 10:40:55 AM ******/
CREATE TYPE [dbo].[Type_Spell] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetId] [int] NULL,
	[Name] [nvarchar](255) NULL,
	[School] [nvarchar](255) NULL,
	[Class] [nvarchar](255) NULL,
	[Levels] [nvarchar](255) NULL,
	[Command] [nvarchar](max) NULL,
	[MaterialComponent] [nvarchar](max) NULL,
	[IsSomaticComponent] [bit] NULL,
	[IsVerbalComponent] [bit] NULL,
	[CastingTime] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[Stats] [nvarchar](max) NULL,
	[HitEffect] [nvarchar](max) NULL,
	[MissEffect] [nvarchar](max) NULL,
	[EffectDescription] [nvarchar](max) NULL,
	[ShouldCast] [bit] NULL,
	[ImageUrl] [nvarchar](2048) NULL,
	[Memorized] [bit] NULL,
	[Metatags] [nvarchar](4000) NULL,
	[IsMaterialComponent] [bit] NULL,
	[OldSpellId] [int] NULL,
	[ParentSpellId] [int] NULL
)
GO
