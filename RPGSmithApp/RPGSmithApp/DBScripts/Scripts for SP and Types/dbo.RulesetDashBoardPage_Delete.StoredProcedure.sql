USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[RulesetDashBoardPage_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RulesetDashBoardPage_Delete]
(
@DashboardPageId INT
)
AS

DECLARE @TempIds AS TABLE (ID INT)

INSERT INTO @TempIds SELECT RulesetTileId FROM RulesetTiles WHERE RulesetDashboardPageId=@DashboardPageId AND (IsDeleted !=1 OR IsDeleted IS NULL)


UPDATE RulesetDashboardPages SET IsDeleted=1 WHERE RulesetDashboardPageId=@DashboardPageId 

UPDATE RulesetTiles SET IsDeleted=1 WHERE RulesetDashboardPageId=@DashboardPageId

UPDATE RulesetNoteTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetImageTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCounterTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCharacterStatTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCommandTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetTextTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)
GO
