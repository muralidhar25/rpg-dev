USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Item_GetItemCommands]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[Item_GetItemCommands]
(
 @ItemId INT
)
AS
BEGIN	
	SELECT * FROM [dbo].[ItemCommands]
	WHERE [ItemId] = @ItemId
END
GO
