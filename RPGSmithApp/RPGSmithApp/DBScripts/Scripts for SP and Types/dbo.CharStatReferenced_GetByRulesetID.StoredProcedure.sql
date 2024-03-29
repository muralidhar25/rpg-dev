USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharStatReferenced_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharStatReferenced_GetByRulesetID]
(
@RulesetID INT,
@ParentRulesetID INT,
@page INT,
@size INT,
@getResultForAddModScreen BIT=0
)
AS
BEGIN
	
	DECLARE @TmpIDs_CharStats AS TABLE (TypeID INT, CharStatID INT, [Index] INT)

	INSERT INTO @TmpIDs_CharStats	
	EXEC CharStatsIds_PaginationResult @ParentRulesetID=@ParentRulesetID, @RulesetID=@RulesetID, @page=@page, @size=@size,@getResultForAddModScreen=@getResultForAddModScreen

	--0 RuleSets
	SELECT * FROM RuleSets WHERE RuleSetId=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	--1 CharacterStats
	SELECT M.*	FROM CharacterStats M 	
	LEFT JOIN @TmpIDs_CharStats T on M.characterStatID=T.CharStatID 	
	WHERE M.characterStatID=T.CharStatID AND  (M.IsDeleted !=1 OR M.IsDeleted IS NULL)



	--2 CharacterStatTypes
	SELECT DISTINCT M.* FROM CharacterStatTypes M LEFT JOIN @TmpIDs_CharStats T on M.CharacterStatTypeId=T.TypeID WHERE M.CharacterStatTypeId=T.TypeID
	
	--3 CharacterStatCalcs
	SELECT DISTINCT M.* FROM CharacterStatCalcs M LEFT JOIN @TmpIDs_CharStats T on M.characterStatID=T.CharStatID WHERE M.characterStatID=T.CharStatID AND (IsDeleted !=1 OR IsDeleted IS NULL)

END
GO
