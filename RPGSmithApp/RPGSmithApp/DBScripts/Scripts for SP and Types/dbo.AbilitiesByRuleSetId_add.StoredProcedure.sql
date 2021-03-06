USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[AbilitiesByRuleSetId_add]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[AbilitiesByRuleSetId_add]
(
 @RulesetID INT
)
AS

DECLARE @ParentRulesetID INT 
DECLARE @Temp_ItemMasterIds AS TABLE (ItemID INT)

SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

IF( @ParentRulesetID IS NULL)
BEGIN 
	SET @ParentRulesetID=@RulesetID
END


INSERT INTO @Temp_ItemMasterIds 
SELECT abilityid FROM Abilities WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND abilityid NOT IN (SELECT ParentAbilityId FROM Abilities WHERE  (RulesetID=@RulesetID AND ParentAbilityId IS NOT NULL))
ORDER BY [name]

SELECT * FROM Abilities WHERE abilityid IN (SELECT * FROM @Temp_ItemMasterIds) AND (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY [name]
GO
