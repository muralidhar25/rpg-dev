USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Character_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Character_Delete]
(
@CharacterID INT
)
AS

--DECLARE @CharacterID INT=422

DECLARE @CharactersItems AS TABLE (ID INT)
DECLARE @CharacterTiles AS TABLE (ID INT)

INSERT INTO @CharacterTiles
	SELECT CharacterTileId FROM CharacterTiles WHERE CharacterId=@CharacterID

DELETE FROM TileColors WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM TileConfig WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterNoteTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterImageTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterTextTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterCounterTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterCharacterStatTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterLinkTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterExecuteTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)
DELETE FROM CharacterCommandTiles WHERE CharacterTileId IN (SELECT ID FROM @CharacterTiles)

DELETE FROM CharacterTiles WHERE CharacterId=@CharacterID

DELETE FROM CharacterDashboardPages WHERE CharacterId=@CharacterID
DELETE FROM CharacterDashboardLayouts WHERE CharacterId=@CharacterID

DELETE FROM CharactersCharacterStats WHERE CharacterId=@CharacterID

DELETE FROM CharacterAbilities WHERE CharacterId=@CharacterID

DELETE FROM CharacterSpells WHERE CharacterId=@CharacterID

INSERT INTO @CharactersItems 
	SELECT ItemId FROM Items WHERE CharacterId=@CharacterID
DELETE FROM ItemCommands WHERE ItemId IN (SELECT ID from @CharactersItems)
DELETE FROM ItemAbilities WHERE ItemId IN (SELECT ID from @CharactersItems)
DELETE FROM ItemSpells WHERE ItemId IN (SELECT ID from @CharactersItems)
DELETE FROM Items WHERE CharacterId=@CharacterID

DELETE FROM CharacterCommands WHERE CharacterId=@CharacterID
DELETE FROM SearchFilter WHERE CharacterId=@CharacterID

DELETE FROM Characters WHERE CharacterId=@CharacterID
GO
