USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[SpellsByRuleSetId_add]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SpellsByRuleSetId_add]
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
SELECT spellid FROM spells WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND spellid NOT IN (SELECT ParentspellId FROM Spells WHERE  (RulesetID=@RulesetID AND ParentspellId IS NOT NULL))
ORDER BY [name]

SELECT * FROM spells WHERE spellid IN (SELECT * FROM @Temp_ItemMasterIds) AND (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY [name]
GO
