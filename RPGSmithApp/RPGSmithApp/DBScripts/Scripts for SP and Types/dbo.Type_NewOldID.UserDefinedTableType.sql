USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_NewOldID]    Script Date: 4/4/2019 11:26:41 AM ******/
CREATE TYPE [dbo].[Type_NewOldID] AS TABLE(
	[NewID] [int] NULL,
	[OldID] [int] NULL
)
GO
