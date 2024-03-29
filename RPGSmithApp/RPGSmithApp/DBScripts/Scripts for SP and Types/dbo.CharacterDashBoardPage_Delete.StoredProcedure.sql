USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterDashBoardPage_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[CharacterDashBoardPage_Delete]
(
@DashboardPageId INT
)
AS

DECLARE @TempIds AS TABLE (ID INT)

INSERT INTO @TempIds SELECT CharacterTileId FROM CharacterTiles WHERE CharacterDashboardPageId=@DashboardPageId AND (IsDeleted !=1 OR IsDeleted IS NULL)


UPDATE CharacterDashboardPages SET IsDeleted=1 WHERE CharacterDashboardPageId=@DashboardPageId

UPDATE CharacterTiles SET IsDeleted=1 WHERE CharacterDashboardPageId=@DashboardPageId

UPDATE CharacterNoteTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterImageTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCounterTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCharacterStatTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterLinkTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterExecuteTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterCommandTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)

UPDATE CharacterTextTiles SET IsDeleted=1 WHERE CharacterTileId IN (SELECT ID FROM @TempIds)
GO
