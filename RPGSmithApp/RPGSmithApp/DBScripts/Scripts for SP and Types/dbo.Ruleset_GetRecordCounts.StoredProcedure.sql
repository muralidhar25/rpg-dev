USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ruleset_GetRecordCounts]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Ruleset_GetRecordCounts]
(
@RulesetID INT
)
AS
BEGIN
DECLARE @ParentRulesetID INT ,@SpellCount INT,@AbilityCount INT,@ItemMasterCount INT,@CharacterStatCount INT,@LayoutCount INT

SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

IF( @ParentRulesetID IS NULL)
BEGIN 
SET @ParentRulesetID=@RulesetID
END

SELECT @SpellCount=COUNT(*) FROM Spells WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND SpellId NOT IN (SELECT ParentSpellId FROM Spells WHERE  (RulesetID=@RulesetID AND ParentSpellId IS NOT NULL))

SELECT @AbilityCount=COUNT(*) FROM Abilities WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND AbilityID NOT IN (SELECT ParentAbilityID FROM Abilities WHERE  (RulesetID=@RulesetID AND ParentAbilityID IS NOT NULL))

SELECT @ItemMasterCount=COUNT(*) FROM ItemMasters WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND ItemMasterId NOT IN (SELECT ParentItemMasterId FROM ItemMasters WHERE  (RulesetID=@RulesetID AND ParentItemMasterId IS NOT NULL))

--------------Add Bundles Count--------------
SELECT @ItemMasterCount=@ItemMasterCount+(SELECT COUNT(*) FROM ItemMasterBundles WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND BundleId NOT IN (SELECT ParentItemMasterBundleId FROM ItemMasterBundles WHERE  (RulesetID=@RulesetID AND ParentItemMasterBundleId IS NOT NULL))
)
------------Add Bundles Count END-------------

SELECT @CharacterStatCount=COUNT(*) FROM CharacterStats WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND CharacterstatID NOT IN (SELECT ParentCharacterstatID FROM CharacterStats WHERE  (RulesetID=@RulesetID AND ParentCharacterstatID IS NOT NULL))

SELECT @LayoutCount=COUNT(*) FROM RulesetDashboardLayouts WHERE  
(RulesetID=@RulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL)

SELECT @SpellCount AS SpellCount,@AbilityCount AS AbilityCount,@ItemMasterCount AS ItemMasterCount,@CharacterStatCount AS CharacterStatCount,@LayoutCount AS LayoutCount
END
GO
