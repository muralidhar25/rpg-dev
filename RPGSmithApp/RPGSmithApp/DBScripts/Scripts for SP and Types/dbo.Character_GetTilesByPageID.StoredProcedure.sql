USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Character_GetTilesByPageID]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Character_GetTilesByPageID]
(
@CharacterID INT,
@PageID INT
  )
AS
--DECLARE @CharacterID INT=308 ,@PageID INT=377

BEGIN
	DECLARE @TmpIDs_CharacterTiles AS TABLE (ID INT)
	DECLARE @TmpIDs_CharacterCharStats AS TABLE (ID INT, TypeID INT, StatID INT)

	DECLARE @TmpIDs_CharacterLink AS TABLE (AbilityID INT, SpellID INT, ItemID INT)
	DECLARE @TmpIDs_CharacterExecute AS TABLE (AbilityID INT, SpellID INT, ItemID INT)


	INSERT INTO @TmpIDs_CharacterTiles  
	SELECT CharacterTileId FROM CharacterTiles 
	WHERE CharacterId=@CharacterID 
	AND CharacterDashboardPageId=@PageID 
	AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT * FROM CharacterTiles WHERE CharacterId=@CharacterID AND CharacterDashboardPageId=@PageID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT * FROM Characters WHERE CharacterId=@CharacterID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT * FROM CharacterDashboardPages WHERE CharacterId=@CharacterID AND CharacterDashboardPageId=@PageID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterCommandTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterCounterTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterNoteTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterImageTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	INSERT INTO @TmpIDs_CharacterCharStats 
	SELECT M.CharactersCharacterStatId,CS.CharacterStatTypeID,CS.characterStatID FROM CharacterCharacterStatTiles M 
	LEFT JOIN @TmpIDs_CharacterTiles T ON M.CharacterTileId=T.ID 
	LEFT JOIN CharactersCharacterStats CCS ON  CCS.CharactersCharacterStatId=M.CharactersCharacterStatId
	LEFT JOIN CharacterStats CS ON  CS.characterStatID=CCS.CharacterStatId
	WHERE M.CharacterTileId=T.ID AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT M.* FROM CharacterCharacterStatTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	--SELECT M.* FROM CharactersCharacterStats M 
	--LEFT JOIN @TmpIDs_CharacterCharStats T on M.CharactersCharacterStatId=T.ID 
	--WHERE M.CharactersCharacterStatId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	SELECT M.CharacterStatID,M.RulesetID,M.StatName,M.StatDesc,M.CharacterStatTypeId,m.isMultiSelect,M.ParentCharacterStatId,M.SortOrder,M.IsDeleted,M.isActive,M.[IsChoiceNumeric],M.IsChoicesFromAnotherStat,M.SelectedChoiceCharacterStatId,
	CCS.* FROM CharacterStats M 
	LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.StatID 
	LEFT JOIN CharactersCharacterStats CCS ON CCS.characterstatID=M.CharacterStatId
	WHERE M.characterStatID=T.StatID AND CCS.CharactersCharacterStatId=T.ID AND (CCS.IsDeleted !=1 OR CCS.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT DISTINCT M.* FROM CharacterStatCalcs M LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.StatID WHERE M.characterStatID=T.StatID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	--SELECT DISTINCT M.* FROM CharacterStatChoices M LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.StatID WHERE M.characterStatID=T.StatID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT DISTINCT M.* FROM CharacterStatChoices M LEFT JOIN CharactersCharacterStats T on M.characterStatID=T.characterStatID 
	WHERE T.CharacterId=@CharacterID	 AND (T.IsDeleted !=1 OR T.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT DISTINCT M.* FROM CharacterStatTypes M LEFT JOIN @TmpIDs_CharacterCharStats T on M.CharacterStatTypeId=T.TypeID WHERE M.CharacterStatTypeId=T.TypeID

	SELECT M.* FROM TileConfig M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileID=T.ID WHERE M.CharacterTileID=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	INSERT INTO @TmpIDs_CharacterLink
	SELECT M.AbilityId,M.SpellID,M.ItemID FROM CharacterLinkTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT M.* FROM CharacterLinkTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)


	SELECT M.*,A.AbilityID,A.RulesetID,A.[Name],A.Command,A.ImageUrl,A.ParentAbilityID,A.IsDeleted,A.[Description] FROM CharacterAbilities M 
	LEFT JOIN @TmpIDs_CharacterLink T on M.CharacterAbilityId=T.AbilityId 
	LEFT JOIN Abilities A on A.AbilityId=M.AbilityId 
	WHERE M.CharacterAbilityId=T.AbilityId AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT M.*,S.SpellID,S.RulesetID,S.[Name],S.Command,S.ImageUrl,S.ParentSpellId,S.IsDeleted,S.[Description] FROM CharacterSpells M 
	LEFT JOIN @TmpIDs_CharacterLink T on M.CharacterSpellID=T.SpellID 
	LEFT JOIN Spells S on S.SpellId=M.SpellId
	WHERE M.CharacterSpellID=T.SpellID AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)
 
	SELECT M.ItemID,M.Name,M.ItemImage,M.CharacterID,M.ItemMasterID,M.ParentItemID,M.IsDeleted,M.Command,M.[description]
	FROM Items M LEFT JOIN @TmpIDs_CharacterLink T on M.ItemID=T.ItemID WHERE M.ItemID=T.ItemID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	INSERT INTO @TmpIDs_CharacterExecute
	SELECT M.AbilityId,M.SpellID,M.ItemID FROM CharacterExecuteTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	SELECT M.* FROM CharacterExecuteTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT M.*,A.AbilityID,A.RulesetID,A.[Name],A.Command,A.ImageUrl,A.ParentAbilityID,A.IsDeleted,A.CommandName FROM CharacterAbilities M 
	LEFT JOIN @TmpIDs_CharacterExecute T on M.CharacterAbilityId=T.AbilityId 
	LEFT JOIN Abilities A on A.AbilityId=M.AbilityId 
	WHERE M.CharacterAbilityId=T.AbilityId AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT M.*,S.SpellID,S.RulesetID,S.[Name],S.Command,S.ImageUrl,S.ParentSpellId,S.IsDeleted,S.CommandName FROM CharacterSpells M 
	LEFT JOIN @TmpIDs_CharacterExecute T on M.CharacterSpellID=T.SpellID 
	LEFT JOIN Spells S on S.SpellId=M.SpellId
	WHERE M.CharacterSpellID=T.SpellID AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)
 
	SELECT M.ItemID,M.Name,M.ItemImage,M.CharacterID,M.ItemMasterID,M.ParentItemID,M.IsDeleted,M.Command,M.CommandName
	 FROM Items M LEFT JOIN @TmpIDs_CharacterExecute T on M.ItemID=T.ItemID WHERE M.ItemID=T.ItemID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	SELECT M.* FROM CharacterTextTiles M LEFT JOIN @TmpIDs_CharacterTiles T on M.CharacterTileId=T.ID WHERE M.CharacterTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
END
GO
