USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Item_GetItemCommands]    Script Date: 3/28/2019 1:15:36 PM ******/
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
