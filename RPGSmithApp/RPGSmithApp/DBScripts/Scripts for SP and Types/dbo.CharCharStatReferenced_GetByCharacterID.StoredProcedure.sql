USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharCharStatReferenced_GetByCharacterID]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharCharStatReferenced_GetByCharacterID]
(
@CharacterID INT,
@page INT,
@size INT,
@getResultForAddModScreen BIT=0
)
AS

--DECLARE @CharacterID INT=2426  ,  @page INT=2, @size INT=30

BEGIN
	
	DECLARE @TmpIDs_CharacterCharStats AS TABLE (CharCharStatID INT, TypeID INT, CharStatID INT, [Index] INT)

	INSERT INTO @TmpIDs_CharacterCharStats	
	EXEC CharCharStatsIds_PaginationResult @CharacterID=@CharacterID, @page=@page, @size=@size,@getResultForAddModScreen=@getResultForAddModScreen

	--0 Characters
	SELECT * FROM Characters WHERE CharacterId=@CharacterID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	
	--1 CharacterStats + CharactersCharacterStats
	SELECT M.RulesetID,M.StatName,M.StatDesc,M.CharacterStatTypeId,m.isMultiSelect,M.ParentCharacterStatId,M.SortOrder,M.IsDeleted,M.isActive,
	M.CreatedBy,M.CreatedDate,m.OwnerId,m.addToModScreen,m.IsChoiceNumeric,m.IsChoicesFromAnotherStat,m.SelectedChoiceCharacterStatId,
	CCS.* FROM CharacterStats M 	
	LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.CharStatID 
	LEFT JOIN CharactersCharacterStats CCS ON CCS.characterstatID=M.CharacterStatId
	WHERE M.characterStatID=T.CharStatID AND CCS.CharactersCharacterStatId=T.CharCharStatID AND (CCS.IsDeleted !=1 OR CCS.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)



	--2 CharacterStatTypes
	SELECT DISTINCT M.* FROM CharacterStatTypes M LEFT JOIN @TmpIDs_CharacterCharStats T on M.CharacterStatTypeId=T.TypeID WHERE M.CharacterStatTypeId=T.TypeID
	
	--3 CharacterStatCalcs
	SELECT DISTINCT M.* FROM CharacterStatCalcs M LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.CharStatID WHERE M.characterStatID=T.CharStatID AND (IsDeleted !=1 OR IsDeleted IS NULL)

	--4 CharacterStatChoices
	--SELECT DISTINCT M.* FROM CharacterStatChoices M LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.CharStatID WHERE M.characterStatID=T.CharStatID AND (IsDeleted !=1 OR IsDeleted IS NULL)
	SELECT DISTINCT M.* FROM CharacterStatChoices M LEFT JOIN CharactersCharacterStats T on M.characterStatID=T.characterStatID 
	WHERE T.CharacterId=@CharacterID	 AND (T.IsDeleted !=1 OR T.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

	--5 CharacterStatConditions
	SELECT DISTINCT M.*,CO.ConditionOperatorId as CO_ConditionOperatorId,CO.[Name] as CO_Name,CO.Symbol as CO_Symbol,CO.[IsNumeric] as CO_IsNumeric FROM CharacterStatConditions M 
	LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.CharStatID 
	LEFT JOIN ConditionOperators CO on M.ConditionOperatorID=CO.ConditionOperatorId 
	WHERE M.characterStatID=T.CharStatID
	
	--6 CharacterStatDefaultValues
	SELECT DISTINCT M.* FROM CharacterStatDefaultValues M LEFT JOIN @TmpIDs_CharacterCharStats T on M.characterStatID=T.CharStatID WHERE M.characterStatID=T.CharStatID
	

END
GO
