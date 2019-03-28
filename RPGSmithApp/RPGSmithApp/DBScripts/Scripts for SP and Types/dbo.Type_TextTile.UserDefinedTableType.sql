USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_TextTile]    Script Date: 3/28/2019 1:15:35 PM ******/
CREATE TYPE [dbo].[Type_TextTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[Title] [nvarchar](255) NULL,
	[Text] [nvarchar](255) NULL,
	[TitleTextColor] [nvarchar](50) NULL,
	[TitleBgColor] [nvarchar](50) NULL,
	[BodyTextColor] [nvarchar](50) NULL,
	[BodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldTextTileId] [int] NULL
)
GO
