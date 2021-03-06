USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[ItemMasterGetAllDetailsByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ItemMasterGetAllDetailsByRulesetID]
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
SELECT ItemMasterId FROM ItemMasters WHERE  
(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
AND (IsDeleted !=1 OR IsDeleted IS NULL) 
AND ItemMasterId NOT IN (SELECT ParentItemMasterId FROM ItemMasters WHERE  (RulesetID=@RulesetID AND ParentItemMasterId IS NOT NULL))
ORDER BY ItemName

SELECT * FROM ItemMasters WHERE ItemMasterId IN (SELECT * FROM @Temp_ItemMasterIds) AND (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY ItemName


SELECT * FROM ItemMaster_Abilities IMA
LEFT JOIN Abilities A ON IMA.AbilityId=A.AbilityId
 WHERE ItemMasterId IN (SELECT * FROM @Temp_ItemMasterIds) AND (IMA.IsDeleted !=1 OR IMA.IsDeleted IS NULL)


SELECT * FROM ItemMaster_Spells IMS
LEFT JOIN spells S ON IMS.SpellId=S.SpellId
WHERE ItemMasterId IN (SELECT * FROM @Temp_ItemMasterIds) AND (IMS.IsDeleted !=1 OR IMS.IsDeleted IS NULL)

SELECT * FROM ItemMasterCommands WHERE ItemMasterId IN (SELECT * FROM @Temp_ItemMasterIds) AND (IsDeleted !=1 OR IsDeleted IS NULL)

SELECT * FROM Items WHERE ItemMasterId IN (SELECT * FROM @Temp_ItemMasterIds) AND (IsDeleted !=1 OR IsDeleted IS NULL)

SELECT * FROM RULESETS WHERE RuleSetId =@RulesetID OR  RuleSetId =@ParentRulesetID
GO
