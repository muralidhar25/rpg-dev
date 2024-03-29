USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Item_Ability_Spell_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC Item_Ability_Spell_GetByRulesetID @RulesetID=149 , @CharacterId=241,@ItemID=378
CREATE PROCEDURE [dbo].[Item_Ability_Spell_GetByRulesetID]
(
 @RulesetID INT,
 @CharacterId INT,
 @ItemID INT
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
	JOIN [dbo].[ItemAbilities] IA ON IA.AbilityId=A.AbilityId
	JOIN Items I ON IA.ItemId=I.ItemId
	WHERE I.CharacterId=@CharacterId  AND I.ItemId=@ItemID	
	AND (A.IsDeleted !=1 OR A.IsDeleted IS NULL)
	AND (IA.IsDeleted !=1 OR IA.IsDeleted IS NULL)
	AND (I.IsDeleted !=1 OR I.IsDeleted IS NULL)

	SELECT S.SpellId,S.RulesetID,S.[Name],S.ImageUrl FROM Spells S 
	JOIN [dbo].[ItemSpells] I_S ON I_S.SpellId=S.SpellId
	JOIN [dbo].[Items] I ON I_S.ItemID=I.ItemId
	WHERE I.CharacterId=@CharacterId  AND I.ItemId=@ItemID
	AND (S.IsDeleted !=1 OR S.IsDeleted IS NULL)
	AND (I_S.IsDeleted !=1 OR I_S.IsDeleted IS NULL)
	AND (I.IsDeleted !=1 OR I.IsDeleted IS NULL)
	
	SELECT I_C.* FROM [dbo].[ItemCommands] I_C 
	JOIN [dbo].[Items] I ON I_C.ItemId=I.ItemId 
	WHERE I.CharacterId=@CharacterId AND I_C.ItemID=@ItemID
	
END
GO
