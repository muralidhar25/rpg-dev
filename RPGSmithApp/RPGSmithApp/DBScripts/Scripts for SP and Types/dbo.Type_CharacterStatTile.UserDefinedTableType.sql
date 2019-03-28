USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CharacterStatTile]    Script Date: 3/28/2019 1:15:30 PM ******/
CREATE TYPE [dbo].[Type_CharacterStatTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[CharacterStatId] [int] NULL,
	[ShowTitle] [bit] NULL,
	[titleTextColor] [nvarchar](50) NULL,
	[titleBgColor] [nvarchar](50) NULL,
	[bodyTextColor] [nvarchar](50) NULL,
	[bodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldCharacterStatTileId] [int] NULL,
	[imageUrl] [nvarchar](max) NULL
)
GO
