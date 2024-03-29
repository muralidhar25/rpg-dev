USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[DuplicateRuleset]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[DuplicateRuleset]
(
@UserID nvarchar(50)
,@RulesetIDToDuplicate int

,@RuleSetName nvarchar(255)
,@RuleSetDesc nvarchar(max)
,@DefaultDice  nvarchar(255)
,@CurrencyLabel nvarchar(20)
,@WeightLabel nvarchar(20)
,@DistanceLabel nvarchar(20)
,@VolumeLabel nvarchar(20)
,@ImageUrl nvarchar(2048)
,@ThumbnailUrl     nvarchar(2048) 
,@SortOrder int
,@RuleSetGenreId smallint
,@ParentRuleSetId int
,@IsDeleted bit
,@IsAbilityEnabled bit
,@IsItemEnabled bit
,@IsSpellEnabled bit
,@IsAllowSharing bit 
,@IsCoreRuleset bit
,@ShareCode uniqueidentifier


)
AS

DECLARE @RulesetID int=0
BEGIN TRAN;
--Create RuleSet Start--

IF EXISTS(SELECT * FROM Rulesets WHERE RuleSetId=@RulesetIDToDuplicate AND ParentRuleSetId IS NOT NULL)
BEGIN
SELECT @ParentRuleSetId=ParentRuleSetId FROM Rulesets WHERE RuleSetId=@RulesetIDToDuplicate AND ParentRuleSetId IS NOT NULL
END

INSERT INTO RuleSets 
([RuleSetName],[RuleSetDesc],[DefaultDice],[CurrencyLabel],[WeightLabel],[DistanceLabel],[VolumeLabel],[ImageUrl],[ThumbnailUrl]      
,[SortOrder],[RuleSetGenreId],[ParentRuleSetId],[IsDeleted],[IsAbilityEnabled],[IsItemEnabled],[IsSpellEnabled],[IsAllowSharing],[IsCoreRuleset]
,[OwnerId],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[ShareCode],[isActive])
values
(@RuleSetName ,@RuleSetDesc ,@DefaultDice ,@CurrencyLabel ,@WeightLabel ,@DistanceLabel ,@VolumeLabel ,@ImageUrl,@ThumbnailUrl 
,@SortOrder ,@RuleSetGenreId,@ParentRuleSetId,@IsDeleted ,@IsAbilityEnabled ,@IsItemEnabled ,@IsSpellEnabled ,@IsAllowSharing  ,@IsCoreRuleset 
,@UserID,@UserID,getdate(),@UserID,getdate(),@ShareCode,1
)

Set @RulesetID=@@IDENTITY
--Create RuleSet End--

Declare @TempTable_CharacterStats as Type_CharacterStats

INSERT INTO @TempTable_CharacterStats  ([RuleSetId],[StatName],[StatDesc],[isActive],[CharacterStatTypeId],[isMultiSelect],[SortOrder]
,[OwnerId],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],OldStatID,[StatCalculation],StatChoiceValue,
[AddToModScreen],[IsChoiceNumeric],[IsChoicesFromAnotherStat]
) 
Select @RulesetID,stat.[StatName],stat.[StatDesc],stat.[isActive],stat.[CharacterStatTypeId],stat.[isMultiSelect],stat.[SortOrder]
,@UserID,@UserID,GETDATE(),@UserID,GETDATE(),stat.CharacterStatId,calc.[StatCalculation],choice.StatChoiceValue,
stat.[AddToModScreen],stat.[IsChoiceNumeric],stat.[IsChoicesFromAnotherStat]
FROM CharacterStats stat 
LEFT JOIN CharacterStatCalcs calc ON stat.CharacterStatId=calc.CharacterStatId
LEFT JOIN CharacterStatChoices choice ON stat.CharacterStatId=choice.CharacterStatId
Where stat.RuleSetId=@RulesetIDToDuplicate 
AND (stat.IsDeleted !=1 OR stat.IsDeleted is null) 
AND (calc.IsDeleted !=1 OR calc.IsDeleted is null) 
AND (choice.IsDeleted !=1 OR choice.IsDeleted is null)

 
DECLARE @Temp_CharacterStatsTable as Type_CharacterStats


INSERT INTO @Temp_CharacterStatsTable
(OldStatID, [RuleSetId],[StatName],[StatDesc],[isActive],[CharacterStatTypeId],[isMultiSelect],[SortOrder]
,[OwnerId],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[StatCalculation],StatChoiceValue,[AddToModScreen],[IsChoiceNumeric],[IsChoicesFromAnotherStat]
) 
SELECT distinct OldStatID, @RulesetID,[StatName],[StatDesc],[isActive],[CharacterStatTypeId],[isMultiSelect],[SortOrder]
,@UserID,@UserID,GETDATE(),@UserID,GETDATE(),null,null,[AddToModScreen],[IsChoiceNumeric],[IsChoicesFromAnotherStat]
FROM @TempTable_CharacterStats 



DECLARE @Temp_NewInsertedIds table (New_ID int)
DECLARE @Temp_NewInsertedIds_Mapping table (New_ID int, [rowNum] int)
DECLARE @Temp_Map_OldNew_Characterstat table ([NewID] int, [OldID] int)


INSERT INTO CharacterStats  ([RuleSetId],[StatName],[StatDesc],[isActive],[CharacterStatTypeId],[isMultiSelect],[SortOrder]
,[OwnerId],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[AddToModScreen],[IsChoiceNumeric],[IsChoicesFromAnotherStat]) OUTPUT Inserted.characterStatID into @Temp_NewInsertedIds (New_ID) 
SELECT @RulesetID,[StatName],[StatDesc],[isActive],[CharacterStatTypeId],[isMultiSelect],[SortOrder]
,@UserID,@UserID,GETDATE(),@UserID,GETDATE(),[AddToModScreen],[IsChoiceNumeric],[IsChoicesFromAnotherStat]
FROM @Temp_CharacterStatsTable

INSERT INTO @Temp_NewInsertedIds_Mapping	select  New_ID,ROW_NUMBER() OVER(order by New_ID) as rowNum from @Temp_NewInsertedIds 

INSERT INTO @Temp_Map_OldNew_Characterstat
SELECT a.New_ID,c.OldStatID FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID

INSERT INTO [CharacterStatCalcs] ([CharacterStatId],[StatCalculation])
SELECT distinct a.New_ID,c.[StatCalculation]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID --can be improve see others
where c.[StatCalculation] is not null

INSERT INTO [CharacterStatChoices] ([CharacterStatId],[StatChoiceValue])
SELECT a.New_ID,c.StatChoiceValue
FROM @Temp_NewInsertedIds_Mapping a 
left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID  --can be improve see others
where c.StatChoiceValue is not null ORDER BY c.RowNum

INSERT INTO [CharacterStatCombos] ([CharacterStatId],[Maximum],[Minimum],[DefaultValue],[DefaultText],[IsDeleted])
SELECT a.New_ID,csCombo.Maximum,csCombo.Minimum,csCombo.DefaultValue,csCombo.[DefaultText],csCombo.IsDeleted
FROM @Temp_NewInsertedIds_Mapping a 
left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID  --can be improve see others
left join [CharacterStatCombos] csCombo on b.OldStatID=csCombo.characterStatID
WHERE csCombo.DefaultValue is not null ORDER BY c.RowNum

INSERT INTO [CharacterStatToggle] ([CharacterStatId],[Display],[IsCustom],[OnOff],[ShowCheckbox],[YesNo],[IsDeleted])
SELECT a.New_ID,csToggle.[Display],csToggle.[IsCustom],csToggle.[OnOff],csToggle.[ShowCheckbox],csToggle.[YesNo],csToggle.[IsDeleted]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID  --can be improve see others
left join [CharacterStatToggle] csToggle on b.OldStatID=csToggle.characterStatID
WHERE csToggle.[Display] is not null ORDER BY c.RowNum

INSERT INTO [CharacterStatConditions] ([CharacterStatId],[CompareValue],[ConditionOperatorID],[IfClauseStatText],[IsNumeric],[Result],[SortOrder])
SELECT a.New_ID,csCondition.[CompareValue],csCondition.[ConditionOperatorID],csCondition.[IfClauseStatText],csCondition.[IsNumeric],csCondition.[Result],csCondition.[SortOrder]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID  --can be improve see others
left join [CharacterStatConditions] csCondition on b.OldStatID=csCondition.characterStatID
WHERE csCondition.[IsNumeric] is not null ORDER BY c.RowNum


INSERT INTO [CharacterStatDefaultValues] ([CharacterStatId],[DefaultValue],[Maximum],[Minimum],[Type])
SELECT a.New_ID,csDefVal.[DefaultValue],csDefVal.[Maximum],csDefVal.[Minimum],csDefVal.[Type]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID  --can be improve see others
left join [CharacterStatDefaultValues] csDefVal on b.OldStatID=csDefVal.characterStatID
WHERE csDefVal.[Type] is not null ORDER BY c.RowNum

----SELECT distinct a.New_ID,c.[StatCalculation]
----FROM @Temp_NewInsertedIds_Mapping a 
----LEFT join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
----left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID 
----where c.[StatCalculation] is not null

----SELECT distinct a.New_ID,c.StatChoiceValue
----FROM @Temp_NewInsertedIds_Mapping a 
----left join  @Temp_CharacterStatsTable b on a.rowNum = b.rowNum
----left join  @TempTable_CharacterStats c on b.OldStatID = c.OldStatID 
----where c.StatChoiceValue is not null




   


----Declare @TempTable_ItemMaster as Type_ItemMaster
Declare @TempTable_ItemMaster_Insert as Type_ItemMaster
----INSERT INTO @TempTable_ItemMaster
----([ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume],
----[Weight],[IsContainer],	[IsMagical],[IsConsumable],[ContainerWeightMax],[ContainerWeightModifier],[ContainerVolumeMax],
----[PercentReduced],[TotalWeightWithContents],[Metatags],[Rarity],[RuleSetId],[OldItemMasterId])

----Select Item.[ItemName],Item.[ItemImage],Item.[ItemStats],Item.[ItemVisibleDesc],Item.[Command],Item.[ItemCalculation],Item.[Value],Item.[Volume],
----Item.[Weight],Item.[IsContainer],	Item.[IsMagical],Item.[IsConsumable],Item.[ContainerWeightMax],Item.[ContainerWeightModifier],Item.[ContainerVolumeMax],
----Item.[PercentReduced],Item.[TotalWeightWithContents],Item.[Metatags],Item.[Rarity],@RulesetID,Item.ItemMasterId
----FROM ItemMasters Item
------LEFT JOIN ItemMaster_Spells ISpell ON Item.ItemMasterId = ISpell.ItemMasterId
------LEFT JOIN ItemMaster_Abilities IAbility ON Item.ItemMasterId = IAbility.ItemMasterId
----Where item.RuleSetId=@RulesetIDToDuplicate 
----AND (item.IsDeleted !=1 OR item.IsDeleted is null) 
------AND (ISpell.IsDeleted !=1 OR ISpell.IsDeleted is null) 
------AND (IAbility.IsDeleted !=1 OR IAbility.IsDeleted is null) 


insert into @TempTable_ItemMaster_Insert
([OldItemMasterId],[ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume],
[Weight],[IsContainer],	[IsMagical],[IsConsumable],[ContainerWeightMax],[ContainerWeightModifier],[ContainerVolumeMax],
[PercentReduced],[TotalWeightWithContents],[Metatags],[Rarity],[RuleSetId])
select distinct Item.ItemMasterId,[ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume],
[Weight],[IsContainer],	[IsMagical],[IsConsumable],[ContainerWeightMax],[ContainerWeightModifier],[ContainerVolumeMax],
[PercentReduced],[TotalWeightWithContents],[Metatags],[Rarity],@RulesetID
FROM ItemMasters Item
Where item.RuleSetId=@RulesetIDToDuplicate 
AND (item.IsDeleted !=1 OR item.IsDeleted is null) 

delete from @Temp_NewInsertedIds
delete from @Temp_NewInsertedIds_Mapping
INSERT INTO ItemMasters 
([ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume],
[Weight],[IsContainer],	[IsMagical],[IsConsumable],[ContainerWeightMax],[ContainerWeightModifier],[ContainerVolumeMax],
[PercentReduced],[TotalWeightWithContents],[Metatags],[Rarity],[RuleSetId]) OUTPUT Inserted.ItemMasterId into @Temp_NewInsertedIds (New_ID) 
select [ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume],
[Weight],[IsContainer],	[IsMagical],[IsConsumable],[ContainerWeightMax],[ContainerWeightModifier],[ContainerVolumeMax],
[PercentReduced],[TotalWeightWithContents],[Metatags],[Rarity],@RulesetID from @TempTable_ItemMaster_Insert Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	SELECT  New_ID,ROW_NUMBER() OVER(ORDER BY New_ID) AS rowNum FROM @Temp_NewInsertedIds 


Declare @ItemMaster_Spells AS TABLE ([ItemMasterId] INT, [SpellId] INT)
Declare @ItemMaster_Abilities AS TABLE ([ItemMasterId] INT, [AbilityId] INT)

--INSERT INTO [ItemMaster_Spells] ([ItemMasterId],[SpellId])
INSERT INTO @ItemMaster_Spells ([ItemMasterId],[SpellId])
SELECT distinct a.New_ID,c.[SpellId]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
left join   [ItemMaster_Spells] c on b.[OldItemMasterId] = c.[ItemMasterId] 
where c.[ItemMasterId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 

--INSERT INTO [ItemMaster_Abilities] ([ItemMasterId],[AbilityId])
INSERT INTO @ItemMaster_Abilities ([ItemMasterId],[AbilityId])
SELECT distinct a.New_ID,c.[AbilityId]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
left join  [ItemMaster_Abilities] c on b.[OldItemMasterId] = c.[ItemMasterId] 
where c.[ItemMasterId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


INSERT INTO [ItemMasterCommands] ([ItemMasterId],[Command],[Name])
SELECT   a.New_ID,c.Command,c.[Name]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
left join  [ItemMasterCommands] c on b.[OldItemMasterId] = c.[ItemMasterId] 
where c.[ItemMasterId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 

----select *  from @TempTable_ItemMaster_Insert


----SELECT distinct a.New_ID,c.[SpellId]
----FROM @Temp_NewInsertedIds_Mapping a 
----LEFT join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
----left join [ItemMaster_Spells] c on b.[OldItemMasterId] = c.[ItemMasterId] 
----where c.[ItemMasterId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 

----SELECT distinct a.New_ID,c.[AbilityId]
----FROM @Temp_NewInsertedIds_Mapping a 
----left join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
----left join [ItemMaster_Abilities] c on b.[OldItemMasterId] = c.[ItemMasterId] 
----where c.[ItemMasterId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 

----SELECT  a.New_ID,c.Command,c.[Name]
----FROM @Temp_NewInsertedIds_Mapping a 
----left join  @TempTable_ItemMaster_Insert b on a.rowNum = b.rowNum
----left join  [ItemMasterCommands] c on b.[OldItemMasterId] = c.[ItemMasterId] 
----where c.[ItemMasterId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


-----------------------------------------------------------------------------------
Declare @TempTable_Spell_Insert as Type_Spell

insert into @TempTable_Spell_Insert
(
[OldSpellId],[RuleSetId],[Name],[School],[Class],[Levels],[Command],[MaterialComponent],[IsSomaticComponent],[IsVerbalComponent],[CastingTime]
,[Description],[Stats],[HitEffect],[MissEffect],[EffectDescription],[ShouldCast],[ImageUrl],[Memorized],[Metatags],[IsMaterialComponent]
)
select SpellId,@RulesetID,[Name],[School],[Class],[Levels],[Command],[MaterialComponent],[IsSomaticComponent],[IsVerbalComponent],[CastingTime]
,[Description],[Stats],[HitEffect],[MissEffect],[EffectDescription],[ShouldCast],[ImageUrl],[Memorized],[Metatags],[IsMaterialComponent]
FROM Spells 
Where RuleSetId=@RulesetIDToDuplicate 
AND (IsDeleted !=1 OR IsDeleted is null) 

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping
INSERT INTO Spells 
(
	[RuleSetId],[Name],[School],[Class],[Levels],[Command],[MaterialComponent],[IsSomaticComponent],[IsVerbalComponent],[CastingTime]
	,[Description],[Stats],[HitEffect],[MissEffect],[EffectDescription],[ShouldCast],[ImageUrl],[Memorized],[Metatags],[IsMaterialComponent]
) OUTPUT Inserted.SpellId into @Temp_NewInsertedIds (New_ID) 
select @RulesetID,[Name],[School],[Class],[Levels],[Command],[MaterialComponent],[IsSomaticComponent],[IsVerbalComponent],[CastingTime]
	,[Description],[Stats],[HitEffect],[MissEffect],[EffectDescription],[ShouldCast],[ImageUrl],[Memorized],[Metatags],[IsMaterialComponent] 
	
	from @TempTable_Spell_Insert Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	SELECT  New_ID,ROW_NUMBER() OVER(ORDER BY New_ID) AS rowNum FROM @Temp_NewInsertedIds 


INSERT INTO [ItemMaster_Spells] ([ItemMasterId],[SpellId])	
SELECT   c.ItemMasterId,a.New_ID
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempTable_Spell_Insert b on a.rowNum = b.rowNum
left join  @ItemMaster_Spells c on b.[OldSpellId] = c.[SpellId] 
WHERE c.ItemMasterId IS NOT NULL AND c.[SpellId] IS NOT NULL

INSERT INTO [SpellCommands] ([SpellId],[Command],[Name])
SELECT   a.New_ID,c.Command,c.[Name]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempTable_Spell_Insert b on a.rowNum = b.rowNum
left join  [SpellCommands] c on b.[OldSpellId] = c.[SpellId] 
where c.[SpellId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 



---------------------------------------------------------------------------------
Declare @TempTable_Ability_Insert as Type_Ability

INSERT INTO @TempTable_Ability_Insert
(
[OldAbilityId],[RuleSetId],[Name],[Level],[Command],[MaxNumberOfUses],[CurrentNumberOfUses],[Description],[Stats],[ImageUrl],[IsEnabled],[Metatags]
)
SELECT AbilityId,@RulesetID,[Name],[Level],[Command],[MaxNumberOfUses],[CurrentNumberOfUses],[Description],[Stats],[ImageUrl],[IsEnabled],[Metatags]
FROM Abilities 
WHERE RuleSetId=@RulesetIDToDuplicate 
AND (IsDeleted !=1 OR IsDeleted is null) 

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping
INSERT INTO Abilities 
(
	[RuleSetId],[Name],[Level],[Command],[MaxNumberOfUses],[CurrentNumberOfUses],[Description],[Stats],[ImageUrl],[IsEnabled],[Metatags]
) OUTPUT Inserted.AbilityId into @Temp_NewInsertedIds (New_ID) 
SELECT @RulesetID,[Name],[Level],[Command],[MaxNumberOfUses],[CurrentNumberOfUses],[Description],[Stats],[ImageUrl],[IsEnabled],[Metatags]
	
	FROM @TempTable_Ability_Insert Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	SELECT  New_ID,ROW_NUMBER() OVER(ORDER BY New_ID) AS rowNum FROM @Temp_NewInsertedIds 


INSERT INTO ItemMaster_Abilities ([ItemMasterId],[AbilityId]) 
SELECT   c.ItemMasterId,a.New_ID
FROM @Temp_NewInsertedIds_Mapping a 
LEFT JOIN  @TempTable_Ability_Insert b on a.rowNum = b.rowNum
LEFT JOIN  @ItemMaster_Abilities c on b.[OldAbilityId] = c.[AbilityId] 
WHERE c.ItemMasterId IS NOT NULL AND c.[AbilityId] IS NOT NULL

INSERT INTO [AbilityCommands] ([AbilityId],[Command],[Name])
SELECT   a.New_ID,c.Command,c.[Name]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT JOIN  @TempTable_Ability_Insert b on a.rowNum = b.rowNum
LEFT JOIN  [AbilityCommands] c on b.[OldAbilityId] = c.[AbilityId] 
WHERE c.[AbilityId]  IS NOT NULL AND (c.IsDeleted !=1 OR c.IsDeleted is null) 



---------------------------------------------------------------------------------------------
DECLARE @TempTable_DashLayout_Insert  AS TABLE(
[RowNum] [int] IDENTITY(1,1),
	[RulesetId] [int],
	[Name] [nvarchar](255),
	[IsDefaultLayout] [bit] ,
	[DefaultPageId] [int] ,
	[LayoutHeight] [int]  ,
	[LayoutWidth] [int]  ,
	[SortOrder] [int]  ,
	[IsDeleted] [bit]  ,
	[OldRulesetDashboardLayoutId] [int],
	[IsDefaultComputer] [bit],
	[IsDefaultTablet] [bit],
	[IsDefaultMobile] [bit]
	)

	INSERT INTO @TempTable_DashLayout_Insert
(
	[OldRulesetDashboardLayoutId],[RulesetId],[Name],[IsDefaultLayout],[DefaultPageId],[LayoutHeight],[LayoutWidth],[SortOrder],[IsDeleted],
	[IsDefaultComputer], [IsDefaultTablet], [IsDefaultMobile]
)
select [RulesetDashboardLayoutId],@RulesetID,[Name],[IsDefaultLayout],[DefaultPageId],[LayoutHeight],[LayoutWidth],[SortOrder],[IsDeleted],
		[IsDefaultComputer], [IsDefaultTablet], [IsDefaultMobile]
FROM [RulesetDashboardLayouts] 
Where RuleSetId=@RulesetIDToDuplicate 
AND (IsDeleted !=1 OR IsDeleted is null)

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping

INSERT INTO [RulesetDashboardLayouts] 
(
	[RulesetId],[Name],[LayoutHeight],[LayoutWidth],[SortOrder],[IsDeleted],[IsDefaultLayout],[DefaultPageId],
	[IsDefaultComputer], [IsDefaultTablet], [IsDefaultMobile]
) OUTPUT Inserted.[RulesetDashboardLayoutId] into @Temp_NewInsertedIds (New_ID) 
select @RulesetID,[Name],[LayoutHeight],[LayoutWidth],[SortOrder],0,[IsDefaultLayout] ,[DefaultPageId],
[IsDefaultComputer], [IsDefaultTablet], [IsDefaultMobile]
	
	from @TempTable_DashLayout_Insert

INSERT INTO @Temp_NewInsertedIds_Mapping	SELECT  New_ID,ROW_NUMBER() OVER(ORDER BY New_ID) AS rowNum FROM @Temp_NewInsertedIds 

DECLARE @Temp_NewInsertedPageIds table ([RowNum] [int] IDENTITY(1,1),New_ID int)

INSERT INTO [RulesetDashboardPages] (
[RulesetDashboardLayoutId],[RulesetId],[Name],[SortOrder],[ContainerHeight],[ContainerWidth],
[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[IsDeleted]) OUTPUT Inserted.[RulesetDashboardPageId] into @Temp_NewInsertedPageIds (New_ID) 
SELECT   a.New_ID,b.RulesetId,c.[Name],c.[SortOrder],c.ContainerHeight,c.ContainerWidth,
c.TitleBgColor,c.TitleBgColor,c.BodyTextColor,c.BodyBgColor,0
FROM @Temp_NewInsertedIds_Mapping a 
LEFT JOIN  @TempTable_DashLayout_Insert b on a.rowNum = b.rowNum
LEFT JOIN  [RulesetDashboardPages] c on b.[OldRulesetDashboardLayoutId] = c.[RulesetDashboardLayoutId] 
WHERE c.[RulesetDashboardLayoutId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


DECLARE @TempPageTbl AS TABLE ([RowNum] [int],New_ID int)

INSERT INTO @TempPageTbl
SELECT ROW_NUMBER() OVER(ORDER BY a.New_ID), c.RulesetDashboardPageId
FROM @Temp_NewInsertedPageIds a 
LEFT JOIN  @TempTable_DashLayout_Insert b on a.rowNum = b.rowNum
LEFT JOIN  [RulesetDashboardPages] c on b.[OldRulesetDashboardLayoutId] = c.[RulesetDashboardLayoutId] 
WHERE c.[RulesetDashboardLayoutId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


DECLARE @count int
SET @count = 1;
WHILE (@count <= (select COUNT(*) from @Temp_NewInsertedIds_Mapping a 
LEFT JOIN  @TempTable_DashLayout_Insert b on a.rowNum = b.rowNum
LEFT JOIN  [RulesetDashboardPages] c on b.[OldRulesetDashboardLayoutId] = c.[RulesetDashboardLayoutId] 
where c.[RulesetDashboardLayoutId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null)) )
begin
	DECLARE @OldPageID INT, @NewPageID INT
	select @NewPageID = A.New_ID,@OldPageID=B.New_ID from @Temp_NewInsertedPageIds A
	LEFT JOIN  @TempPageTbl B ON A.RowNum=B.RowNum WHERE   A.RowNum=@count

	UPDATE [RulesetDashboardLayouts] SET DefaultPageId=@NewPageID WHERE 
	RulesetDashboardLayoutId=(SELECT RulesetDashboardLayoutId FROM RulesetDashboardPages WHERE RulesetDashboardPageId=@NewPageID)
	AND DefaultPageId=@OldPageID
--   UPDATE [RulesetDashboardLayouts] SET DefaultPageId=(
   
--    select [RulesetDashboardPageId] from [RulesetDashboardPages] where [RulesetDashboardLayoutId]=(select New_ID from @Temp_NewInsertedIds_Mapping where RowNum=@count)
--   AND RulesetDashboardPageId=(
--		   select distinct d.New_ID from @Temp_NewInsertedIds_Mapping a 
--			LEFT JOIN  @Temp_NewInsertedPageIds d on a.rowNum = d.rowNum
--			LEFT JOIN  @TempTable_DashLayout_Insert b on a.rowNum = b.rowNum
--			LEFT JOIN  [RulesetDashboardPages] c on b.[OldRulesetDashboardLayoutId] = c.[RulesetDashboardLayoutId] 
--			where c.[RulesetDashboardLayoutId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null)
--			AND a.New_ID=(select distinct New_ID from @Temp_NewInsertedIds_Mapping where RowNum=@count)
--	)
--) WHERE [RulesetDashboardLayoutId]=(select New_ID from @Temp_NewInsertedIds_Mapping where RowNum=@count)

      set @count = @count + 1;
end

---------------------------------------------------------------------------------------------------------
Declare @TempTable_RulesetTile_Insert AS [Type_RulesetTile] 


declare @Pagecount int,
		@TempTable_NoteTiles_Insert AS Type_NoteTile, @TempTable_ImageTiles_Insert AS Type_ImageTile, @TempTable_TextTiles_Insert AS Type_TextTile,
		@TempTable_CounterTiles_Insert AS Type_CounterTile , @TempTable_CharacterStatTiles_Insert AS Type_CharacterStatTile,
		@TempTable_CommandTiles_Insert AS Type_CommandTile,
		@TileTypeId int,@CreatedBy nvarchar (max),	@RulesetTileId int,@BodyBgColor  nvarchar (50),
		@BodyTextColor nvarchar (50),@TitleBgColor nvarchar (50),@TitleTextColor nvarchar (50),
		@RuleSetIDInserted INT,
		@ConfigOld_RulesetTileId int ,@ConfigOld_SortOrder int,@ConfigOld_UniqueId nvarchar(max) ,
		@ConfigOld_Payload int ,@ConfigOld_Col int ,@ConfigOld_Row int ,@ConfigOld_SizeX int ,@ConfigOld_SizeY int ,@ConfigOld_IsDeleted bit ,
		@CurrentSavingPageID int,
		@NewCharcterStatID INT

		DECLARE @temp_page AS TABLE (RowNum int IDENTITY(1,1),OldPageID int)
		 
		DECLARE @Tilecount int=1, @TotalTileCount int, @TileType int, @CurrentRunning_OldRulesetTileID int

set @Pagecount = 1;
while (@Pagecount <= (select COUNT(*) from @Temp_NewInsertedPageIds ))
begin  
SELECT distinct @CurrentSavingPageID=New_ID FROM @Temp_NewInsertedPageIds  where RowNum=@Pagecount
INSERT INTO @temp_page
		SELECT c.RulesetDashboardPageId
			FROM @Temp_NewInsertedIds_Mapping a 
			LEFT JOIN  @TempTable_DashLayout_Insert b on a.rowNum = b.rowNum
			LEFT JOIN  [RulesetDashboardPages] c on b.[OldRulesetDashboardLayoutId] = c.[RulesetDashboardLayoutId] 			
			where c.[RulesetDashboardLayoutId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null)  

		
		SELECT @TileTypeId=null,@CreatedBy=null,@RulesetTileId=null,@BodyBgColor =null,@BodyTextColor =null,@TitleBgColor =null,@TitleTextColor=null,
		@ConfigOld_RulesetTileId =null ,@ConfigOld_SortOrder =null,@ConfigOld_UniqueId=null ,@ConfigOld_Payload =null ,@ConfigOld_Col =null ,
		@ConfigOld_Row =null ,@ConfigOld_SizeX =null ,@ConfigOld_SizeY =null ,@ConfigOld_IsDeleted =null

		
		DELETE FROM @TempTable_RulesetTile_Insert
		INSERT INTO @TempTable_RulesetTile_Insert
		([RowNum],[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[OldRulesetTileId])
		SELECT ROW_NUMBER() OVER(ORDER BY [TileTypeId]),[TileTypeId],[RulesetDashboardPageId],@RulesetID,[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[RulesetTileId]
		 from RulesetTiles 
		 where RulesetId=@RulesetIDToDuplicate AND RulesetDashboardPageId =(
				SELECT a.OldPageID FROM @temp_page a
				LEFT JOIN @Temp_NewInsertedPageIds b ON a.RowNum=b.RowNum
				WHERE b.New_ID=@CurrentSavingPageID
			)
		 AND (IsDeleted !=1 OR IsDeleted is null)
	
		SET @Tilecount = 1;
		SELECT @TotalTileCount= COUNT(*) from @TempTable_RulesetTile_Insert

		WHILE (@Tilecount <= @TotalTileCount)
		BEGIN 		

			SELECT @TileType= [TileTypeId],@CurrentRunning_OldRulesetTileID=OldRulesetTileId FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
			SET @RuleSetIDInserted=NULL
			IF (@TileType=1) --NOTE Tile
			BEGIN 
				Delete from @TempTable_NoteTiles_Insert

				INSERT INTO @TempTable_NoteTiles_Insert
				([RulesetTileId],[Title],[Content],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],[IsDeleted],[OldNoteTileId])
				SELECT [RulesetTileId],[Title],[Content],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],0,[NoteTileId] FROM RulesetNoteTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)

				
				IF((SELECT COUNT (*) FROM @TempTable_NoteTiles_Insert)>0)
				BEGIN	
					--Insert Ruleset //Same
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert NoteTile
					INSERT INTO RulesetNoteTiles
					([RulesetTileId],[Title],[Content],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
					[SortOrder],[IsDeleted])
					SELECT @RuleSetIDInserted,[Title],[Content],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
					[SortOrder],0 FROM @TempTable_NoteTiles_Insert 					 

					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_NoteTiles_Insert 					

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)

					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END

			END

			ELSE IF (@TileType=2) --IMAGE Tile
			BEGIN 
				Delete from @TempTable_ImageTiles_Insert

				INSERT INTO @TempTable_ImageTiles_Insert
				([RulesetTileId],[Title],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],[IsDeleted],[OldImageTileId])
				SELECT [RulesetTileId],[Title],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],0,[ImageTileId] FROM RulesetImageTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)
				
				IF((SELECT COUNT (*) FROM @TempTable_ImageTiles_Insert)>0)
				BEGIN	
					--Insert Ruleset
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert ImageTile
					INSERT INTO RulesetImageTiles
					([RulesetTileId],[Title],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],[IsDeleted])
					SELECT @RuleSetIDInserted,[Title],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],0 FROM @TempTable_ImageTiles_Insert 

					
					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_ImageTiles_Insert 

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)

					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END
			END

			ELSE IF (@TileType=3) --Counter Tile
			BEGIN 
				Delete FROM @TempTable_CounterTiles_Insert

				INSERT INTO @TempTable_CounterTiles_Insert
				([RulesetTileId],[Title],[DefaultValue],[CurrentValue],[Maximum],[Minimum],[Step],[TitleTextColor],[TitleBgColor],[BodyTextColor],
				[BodyBgColor],[Shape],[SortOrder],[IsDeleted],[OldCounterTileId])
				SELECT [RulesetTileId],[Title],[DefaultValue],[CurrentValue],[Maximum],[Minimum],[Step],[TitleTextColor],[TitleBgColor],[BodyTextColor],
				[BodyBgColor],[Shape],[SortOrder],[IsDeleted],[CounterTileId] FROM RulesetCounterTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)
				
				
				IF((SELECT COUNT (*) FROM @TempTable_CounterTiles_Insert)>0)
				BEGIN

					--Insert Ruleset
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert CounterTile
					INSERT INTO RulesetCounterTiles
					([RulesetTileId],[Title],[DefaultValue],[CurrentValue],[Maximum],[Minimum],[Step],[TitleTextColor],[TitleBgColor],[BodyTextColor],
					[BodyBgColor],[Shape],[SortOrder],[IsDeleted])
					SELECT @RuleSetIDInserted,[Title],[DefaultValue],[CurrentValue],[Maximum],[Minimum],[Step],[TitleTextColor],[TitleBgColor],[BodyTextColor],
					[BodyBgColor],[Shape],[SortOrder],0 FROM @TempTable_CounterTiles_Insert
					
					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_CounterTiles_Insert 

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End 

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)

					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END
			END

			ELSE IF (@TileType=4) --CharacterStat Tile
			BEGIN 
				Delete from @TempTable_CharacterStatTiles_Insert

				INSERT INTO @TempTable_CharacterStatTiles_Insert
				([RulesetTileId],[CharacterStatId],[ShowTitle],[titleTextColor],[titleBgColor],[bodyTextColor],[bodyBgColor],
				[Shape],[SortOrder],[IsDeleted],[OldCharacterStatTileId],[imageUrl])
				SELECT [RulesetTileId],[CharacterStatId],[ShowTitle],[titleTextColor],[titleBgColor],[bodyTextColor],[bodyBgColor],
				[Shape],[SortOrder],[IsDeleted],[CharacterStatTileId],[imageUrl] FROM RulesetCharacterStatTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)
				
				
				IF((SELECT COUNT (*) FROM @TempTable_CharacterStatTiles_Insert)>0)
				BEGIN
					
					SELECT @NewCharcterStatID=[NewID] FROM @Temp_Map_OldNew_Characterstat WHERE OldID=(
						SELECT CharacterStatId FROM @TempTable_CharacterStatTiles_Insert 
					)
					--Insert Ruleset
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert CharacterstatTile
					INSERT INTO RulesetCharacterStatTiles
					([RulesetTileId],[CharacterStatId],[ShowTitle],[titleTextColor],[titleBgColor],[bodyTextColor],[bodyBgColor],
					[Shape],[SortOrder],[IsDeleted],[imageUrl])
					SELECT @RuleSetIDInserted,@NewCharcterStatID,[ShowTitle],[titleTextColor],[titleBgColor],[bodyTextColor],[bodyBgColor],
					[Shape],[SortOrder],0,[imageUrl] FROM @TempTable_CharacterStatTiles_Insert 

					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_CharacterStatTiles_Insert 
					
					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)

					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END
			END

			ELSE IF (@TileType=7) --Command Tile
			BEGIN 
				Delete from @TempTable_CommandTiles_Insert

				INSERT INTO @TempTable_CommandTiles_Insert
				([RulesetTileId],[Title],[Command],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],
				[IsDeleted],[OldCommandTileId])
				SELECT [RulesetTileId],[Title],[Command],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],
				[IsDeleted],[CommandTileId] FROM RulesetCommandTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)
				
				
				IF((SELECT COUNT (*) FROM @TempTable_CommandTiles_Insert)>0)
				BEGIN

					--Insert Ruleset
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert CommandTile
					INSERT INTO RulesetCommandTiles
					([RulesetTileId],[Title],[Command],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],
					[IsDeleted])
					SELECT @RuleSetIDInserted,[Title],[Command],[ImageUrl],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],
					0 FROM @TempTable_CommandTiles_Insert 

					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_CommandTiles_Insert 

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)
					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END
			END

			ELSE IF (@TileType=8) --Text Tile
			BEGIN 
				Delete from @TempTable_TextTiles_Insert

				INSERT INTO @TempTable_TextTiles_Insert
				([RulesetTileId],[Title],[Text],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],[IsDeleted],[OldTextTileId])
				SELECT [RulesetTileId],[Title],[Text],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],
				[SortOrder],0,[TextTileId] FROM RulesetTextTiles WHERE RulesetTileId=@CurrentRunning_OldRulesetTileID AND (IsDeleted !=1 OR IsDeleted is null)
				
				IF((SELECT COUNT (*) FROM @TempTable_TextTiles_Insert)>0)
				BEGIN	
					--Insert Ruleset
					INSERT INTO RulesetTiles (
					[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted]
					)
					SELECT  [TileTypeId],@CurrentSavingPageID,[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder] ,0
					FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					SELECT @RuleSetIDInserted=@@IDENTITY

					--Insert TextTile
					INSERT INTO RulesetTextTiles
					([RulesetTileId],[Title],[Text],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],[IsDeleted])
					SELECT @RuleSetIDInserted,[Title],[Text],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],[Shape],[SortOrder],0 FROM @TempTable_TextTiles_Insert 

					
					--Save Tile Color //Same
					SELECT @TileTypeId=@TileType,
					@CreatedBy=@UserID,
					@RulesetTileId=@RuleSetIDInserted,
					@BodyBgColor =[BodyBgColor],
					@BodyTextColor =[BodyTextColor],
					@TitleBgColor =[TitleBgColor],
					@TitleTextColor=[TitleTextColor]
					FROM @TempTable_TextTiles_Insert 

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL) )
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@CreatedBy AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO RulesetTileColors ([RulesetTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@RulesetTileId,@CreatedBy,GETDATE(),@BodyBgColor, @BodyTextColor,  @TitleBgColor ,@TitleTextColor,0)
					END	
					--Save color End

					--Save TileConfig //Same
					
					SELECT  @ConfigOld_RulesetTileId =RulesetTileId ,@ConfigOld_SortOrder =SortOrder,@ConfigOld_UniqueId=UniqueId ,
					@ConfigOld_Payload =Payload ,@ConfigOld_Col =Col , @ConfigOld_Row =[Row] ,@ConfigOld_SizeX =SizeX ,@ConfigOld_SizeY =SizeY ,
					@ConfigOld_IsDeleted =0 FROM RulesetTileConfig 
					WHERE RulesetTileId=(
						SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount
					) AND (IsDeleted !=1 OR IsDeleted is null)

					IF EXISTS(SELECT TOP 1 TileConfigId FROM RulesetTileConfig WHERE RulesetTileId=(SELECT [OldRulesetTileId] FROM @TempTable_RulesetTile_Insert WHERE [RowNum]=@Tilecount) AND (IsDeleted !=1 OR IsDeleted is null))
					BEGIN
						INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
						VALUES (@RuleSetIDInserted,@ConfigOld_SortOrder,@ConfigOld_UniqueId,@ConfigOld_Payload,@ConfigOld_Col,@ConfigOld_Row,
						@ConfigOld_SizeX,@ConfigOld_SizeY,@ConfigOld_IsDeleted)
					END
					--Save TileConfig End
				END
			END
			SET @Tilecount = @Tilecount + 1;
		END
    set @Pagecount = @Pagecount + 1;
END
COMMIT TRAN;
SELECT  * from RuleSets where RuleSetId=@RulesetID
GO
