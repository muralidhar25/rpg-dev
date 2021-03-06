USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ruleset_GetTilesByPageID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Ruleset_GetTilesByPageID]
(
@RulesetID INT,
@PageID INT
  )
AS
--DECLARE @RulesetID INT=208 ,@PageID INT=79

BEGIN
	DECLARE @TmpIDs_RulesetTiles AS TABLE (ID INT)
	DECLARE @TmpIDs_CharStats AS TABLE (ID INT, TypeID INT)
	INSERT INTO @TmpIDs_RulesetTiles  SELECT RulesetTileId FROM RuleSetTiles WHERE RulesetId=@RulesetID AND RulesetDashboardPageId=@PageID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT * FROM RuleSetTiles WHERE RulesetId=@RulesetID AND RulesetDashboardPageId=@PageID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT * FROM RuleSets WHERE RulesetId=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT * FROM RulesetDashboardPages WHERE RulesetId=@RulesetID AND RulesetDashboardPageId=@PageID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM RulesetCommandTiles M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM RulesetCounterTiles M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM RulesetNoteTiles M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM RulesetImageTiles M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	INSERT INTO @TmpIDs_CharStats 
	SELECT M.characterStatID,CS.CharacterStatTypeID FROM RulesetCharacterStatTiles M 
	LEFT JOIN @TmpIDs_RulesetTiles T ON M.RulesetTileId=T.ID 
	LEFT JOIN CharacterStats CS ON  CS.characterStatID=M.CharacterStatId
	WHERE M.RulesetTileId=T.ID AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	SELECT M.* FROM RulesetCharacterStatTiles M 
	LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID 
	WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT M.* FROM CharacterStats M LEFT JOIN @TmpIDs_CharStats T on M.characterStatID=T.ID WHERE M.characterStatID=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterStatCalcs M LEFT JOIN @TmpIDs_CharStats T on M.characterStatID=T.ID WHERE M.characterStatID=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT M.* FROM CharacterStatChoices M LEFT JOIN @TmpIDs_CharStats T on M.characterStatID=T.ID WHERE M.characterStatID=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT DISTINCT M.* FROM CharacterStatTypes M LEFT JOIN @TmpIDs_CharStats T on M.CharacterStatTypeId=T.TypeID WHERE M.CharacterStatTypeId=T.TypeID

	SELECT M.* FROM RulesetTileConfig M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	SELECT M.* FROM RulesetTextTiles M LEFT JOIN @TmpIDs_RulesetTiles T on M.RulesetTileId=T.ID WHERE M.RulesetTileId=T.ID AND (IsDeleted !=1 OR IsDeleted IS NULL)

END
GO
