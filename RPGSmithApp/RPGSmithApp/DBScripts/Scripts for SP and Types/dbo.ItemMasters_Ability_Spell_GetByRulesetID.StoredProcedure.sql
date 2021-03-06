USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[ItemMasters_Ability_Spell_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ItemMasters_Ability_Spell_GetByRulesetID]
(
 @RulesetID int,@ItemMasterID INT
)
AS
BEGIN

	IF EXISTS( SELECT RulesetID FROM Rulesets WHERE RuleSetId=@RulesetID AND ParentRulesetID IS NOT NULL AND (IsDeleted !=1 OR IsDeleted IS NULL))
	BEGIN 
		DECLARE @ParentRulesetID INT 

		SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

		IF( @ParentRulesetID IS NULL)
		BEGIN 
			SET @ParentRulesetID=@RulesetID
		END

		SELECT AbilityID,RulesetID,[Name],ImageUrl FROM Abilities WHERE  
		(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
		AND (IsDeleted !=1 OR IsDeleted IS NULL) 
		AND AbilityID NOT IN (SELECT ParentAbilityID FROM Abilities WHERE  (RulesetID=@RulesetID AND ParentAbilityID IS NOT NULL))
		ORDER BY [Name]

		SELECT SpellId,RulesetID,[Name],ImageUrl FROM Spells WHERE  
		(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
		AND (IsDeleted !=1 OR IsDeleted IS NULL) 
		AND SpellId NOT IN (SELECT ParentSpellId FROM Spells WHERE  (RulesetID=@RulesetID AND ParentSpellId IS NOT NULL))
		ORDER BY [Name]
	END
	ELSE
	BEGIN
		SELECT AbilityID,RulesetID,[Name],ImageUrl FROM Abilities WHERE RulesetID=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY [Name]
		SELECT SpellId,RulesetID,[Name],ImageUrl FROM Spells WHERE RulesetID=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY [Name]
	END


	SELECT A.AbilityID,A.RulesetID,A.[Name],A.ImageUrl FROM Abilities A 
	LEFT JOIN ItemMaster_Abilities IM_A ON IM_A.AbilityId=A.AbilityId
	LEFT JOIN ItemMasters IM ON IM_A.ItemMasterID=IM.ItemMasterId
	WHERE IM.RulesetID=@RulesetID  AND IM_A.ItemMasterID=@ItemMasterID
	AND (A.IsDeleted !=1 OR A.IsDeleted IS NULL)
	AND (IM_A.IsDeleted !=1 OR IM_A.IsDeleted IS NULL)
	AND (IM.IsDeleted !=1 OR IM.IsDeleted IS NULL)

	SELECT S.SpellId,S.RulesetID,S.[Name],S.ImageUrl FROM Spells S 
	LEFT JOIN ItemMaster_Spells IM_S ON IM_S.SpellId=S.SpellId
	LEFT JOIN ItemMasters IM ON IM_S.ItemMasterID=IM.ItemMasterId
	WHERE IM.RulesetID=@RulesetID AND IM_S.ItemMasterID=@ItemMasterID
	AND (S.IsDeleted !=1 OR S.IsDeleted IS NULL)
	AND (IM_S.IsDeleted !=1 OR IM_S.IsDeleted IS NULL)
	AND (IM.IsDeleted !=1 OR IM.IsDeleted IS NULL)
	
	SELECT IM_C.* FROM ItemMasterCommands IM_C 
	LEFT JOIN ItemMasters IM ON IM_C.ItemMasterId=IM.ItemMasterId 
	WHERE IM.RulesetID=@RulesetID AND IM_C.ItemMasterID=@ItemMasterID
	
END
GO
