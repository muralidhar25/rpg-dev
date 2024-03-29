USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_TileConfig]    Script Date: 4/4/2019 10:40:56 AM ******/
CREATE TYPE [dbo].[Type_TileConfig] AS TABLE(
	[RowNum] [int] NOT NULL,
	[TileId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[UniqueId] [nvarchar](max) NULL,
	[Payload] [int] NOT NULL,
	[Col] [int] NOT NULL,
	[Row] [int] NOT NULL,
	[SizeX] [int] NOT NULL,
	[SizeY] [int] NOT NULL,
	[IsDeleted] [bit] NOT NULL
)
GO
