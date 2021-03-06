USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ruleset_Delete]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Ruleset_Delete]
(
@RulesetID INT
)
AS

--DECLARE @RulesetID INT=340

DECLARE @RulesetsCharacters AS TABLE ([RowNum] [int] IDENTITY(1,1),ID INT)

INSERT INTO @RulesetsCharacters
	SELECT CharacterId FROM Characters WHERE RulesetId=@RulesetID

DECLARE @CurrentCharacterCount INT=1
DECLARE @TotalCharacterCount INT=0

SELECT @TotalCharacterCount=COUNT(*) FROM @RulesetsCharacters

WHILE(@CurrentCharacterCount<=@TotalCharacterCount)
BEGIN
	DECLARE @CharecterIDtoDelete INT
	SELECT @CharecterIDtoDelete=CHARACTERID FROM CHARACTERS WHERE CHARACTERID=(SELECT ID FROM @RulesetsCharacters WHERE RowNum=@CurrentCharacterCount)
	
	--UPDATE CHARACTERS WHERE CHARACTERID=(SELECT ID FROM @RulesetsCharacters WHERE RowNum=@CurrentCharacterCount)
	EXEC [Character_Delete] @CharacterID=@CharecterIDtoDelete

	SET @CurrentCharacterCount=@CurrentCharacterCount+1
END


DECLARE @RulesetsItems AS TABLE (ID INT)
DECLARE @RulesetTiles AS TABLE (ID INT)
DECLARE @RulesetCharacterStats AS TABLE (ID INT)
DECLARE @RulesetSpells AS TABLE (ID INT)
DECLARE @RulesetAbilitys AS TABLE (ID INT)
DECLARE @RulesetItemMasters AS TABLE (ID INT)

INSERT INTO @RulesetTiles
	SELECT RulesetTileId FROM RulesetTiles WHERE RulesetId=@RulesetID

UPDATE RulesetTileColors SET IsDeleted=1 WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetTileConfig SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetNoteTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetImageTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetTextTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetCounterTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetcharacterStatTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)
UPDATE RulesetCommandTiles SET IsDeleted=1  WHERE RulesetTileId IN (SELECT ID FROM @RulesetTiles)

UPDATE RulesetTiles SET IsDeleted=1  WHERE RulesetId=@RulesetID

UPDATE RulesetDashboardPages SET IsDeleted=1  WHERE RulesetId=@RulesetID
UPDATE RulesetDashboardLayouts SET IsDeleted=1  WHERE RulesetId=@RulesetID

INSERT INTO @RulesetCharacterStats
	SELECT CharacterStatId FROM CharacterStats WHERE RuleSetId=@RulesetID

UPDATE CharacterStatCalcs SET IsDeleted=1  WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)
UPDATE CharacterStatChoices SET IsDeleted=1  WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)

DELETE FROM CharacterStatCombos WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)
DELETE FROM CharacterStatToggle WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)
DELETE FROM CharacterStatConditions WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)
DELETE FROM CharacterStatDefaultValues WHERE CharacterStatId IN (SELECT ID FROM @RulesetCharacterStats)

UPDATE CharacterStats SET IsDeleted=1  WHERE RuleSetId=@RulesetID

INSERT INTO @RulesetSpells
	SELECT SpellID From Spells WHERE RuleSetId=@RulesetID

UPDATE SpellCommands SET IsDeleted=1  WHERE SpellId IN (SELECT ID FROM @RulesetSpells)
UPDATE ItemMaster_Spells SET IsDeleted=1  WHERE SpellId IN (SELECT ID FROM @RulesetSpells)
UPDATE CharacterSpells SET IsDeleted=1  WHERE SpellId IN (SELECT ID FROM @RulesetSpells)
UPDATE Spells  SET IsDeleted=1 WHERE RuleSetId=@RulesetID

INSERT INTO @RulesetAbilitys
	SELECT AbilityId From Abilities WHERE RuleSetId=@RulesetID

UPDATE AbilityCommands SET IsDeleted=1  WHERE AbilityId IN (SELECT ID FROM @RulesetSpells)
UPDATE ItemMaster_Abilities SET IsDeleted=1  WHERE AbilityId IN (SELECT ID FROM @RulesetSpells)
UPDATE CharacterAbilities SET IsDeleted=1  WHERE AbilityId IN (SELECT ID FROM @RulesetSpells)
UPDATE Abilities SET IsDeleted=1  WHERE RuleSetId=@RulesetID

INSERT INTO @RulesetItemMasters
	SELECT ItemMasterId From ItemMasters WHERE RuleSetId=@RulesetID

UPDATE ItemMasterCommands SET IsDeleted=1  WHERE ItemMasterId IN (SELECT ID FROM @RulesetItemMasters)
UPDATE ItemMaster_Abilities SET IsDeleted=1  WHERE ItemMasterId IN (SELECT ID FROM @RulesetItemMasters)
UPDATE ItemMaster_Spells SET IsDeleted=1  WHERE ItemMasterId IN (SELECT ID FROM @RulesetItemMasters)
UPDATE ItemMaster_Players SET IsDeleted=1  WHERE ItemMasterId IN (SELECT ID FROM @RulesetItemMasters)
UPDATE Items SET IsDeleted=1  WHERE ItemMasterId IN (SELECT ID FROM @RulesetItemMasters)
UPDATE ItemMasters  SET IsDeleted=1 WHERE RuleSetId=@RulesetID

DELETE ItemMasterBundleItems Where BundleID IN (SELECT BundleID FROM ItemMasterBundles Where RulesetID=@RulesetID)
DELETE ItemMasterBundles Where RulesetID=@RulesetID

UPDATE RuleSets  SET IsDeleted=1 WHERE RuleSetId=@RulesetID
GO
