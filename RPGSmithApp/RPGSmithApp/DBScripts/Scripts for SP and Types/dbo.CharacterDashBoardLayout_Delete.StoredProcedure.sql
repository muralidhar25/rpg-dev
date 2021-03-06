USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterDashBoardLayout_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharacterDashBoardLayout_Delete]
(
@DashboardLayoutId INT
)
AS

DECLARE @TempPageIds AS TABLE (ID INT)
DECLARE @TempIds AS TABLE (ID INT)
 

INSERT INTO @TempPageIds SELECT CharacterDashboardPageId FROM CharacterDashboardPages WHERE CharacterDashboardLayoutId=@DashboardLayoutId AND (IsDeleted !=1 OR IsDeleted IS NULL)

INSERT INTO @TempIds SELECT CharacterTileId FROM CharacterTiles WHERE CharacterDashboardPageId in (SELECT ID FROM @TempPageIds) AND (IsDeleted !=1 OR IsDeleted IS NULL)

UPDATE CharacterDashboardLayouts SET IsDeleted=1 WHERE CharacterDashboardLayoutId =@DashboardLayoutId

UPDATE CharacterDashboardPages SET IsDeleted=1 WHERE CharacterDashboardPageId in (SELECT ID FROM @TempPageIds)

UPDATE CharacterTiles SET IsDeleted=1 WHERE CharacterDashboardPageId in (SELECT ID FROM @TempPageIds)

UPDATE CharacterNoteTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterImageTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCounterTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCharacterStatTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterLinkTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterExecuteTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCommandTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterTextTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)
GO
