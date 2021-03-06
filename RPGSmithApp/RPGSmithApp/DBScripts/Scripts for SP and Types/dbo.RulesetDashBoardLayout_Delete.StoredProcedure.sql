USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[RulesetDashBoardLayout_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RulesetDashBoardLayout_Delete]
(
@DashboardLayoutId INT
)
AS

DECLARE @TempPageIds AS TABLE (ID INT)
DECLARE @TempIds AS TABLE (ID INT)

INSERT INTO @TempPageIds SELECT RulesetDashboardPageId FROM RulesetDashboardPages WHERE  RulesetDashboardLayoutId=@DashboardLayoutId AND (IsDeleted !=1 OR IsDeleted IS NULL)

INSERT INTO @TempIds SELECT RulesetTileId FROM RulesetTiles WHERE RulesetDashboardPageId in (SELECT ID FROM @TempPageIds) AND (IsDeleted !=1 OR IsDeleted IS NULL)


UPDATE RulesetDashboardLayouts SET IsDeleted=1 WHERE RulesetDashboardLayoutId =@DashboardLayoutId

UPDATE RulesetDashboardPages SET IsDeleted=1 WHERE RulesetDashboardPageId in (SELECT ID FROM @TempPageIds)

UPDATE RulesetTiles SET IsDeleted=1 WHERE RulesetDashboardPageId in (SELECT ID FROM @TempPageIds)

UPDATE RulesetNoteTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetImageTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCounterTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCharacterStatTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetCommandTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)

UPDATE RulesetTextTiles SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @TempIds)
GO
