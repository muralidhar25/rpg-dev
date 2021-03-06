USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Characters_UpdateInventoryWeight]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC Characters_UpdateInventoryWeight 246
CREATE PROCEDURE [dbo].[Characters_UpdateInventoryWeight]
(
	@CharacterId INT
)
AS

DECLARE @TotalWeight DECIMAL(18,2)

SELECT @TotalWeight=SUM(TotalWeight) FROM [dbo].[Items]
	WHERE [CharacterId] = @CharacterId
	AND (ContainedIn = 0 OR ContainedIn IS NULL)
	AND (IsDeleted !=1 OR IsDeleted IS NULL)

IF(@TotalWeight IS NULL)
BEGIN
	SET @TotalWeight = 0
END

UPDATE [dbo].[Characters] SET [InventoryWeight] = @TotalWeight WHERE [CharacterId] = @CharacterId

SELECT * FROM [dbo].[Characters] WHERE [CharacterId] = @CharacterId

--print @TotalWeight
GO
