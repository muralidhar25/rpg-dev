USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Core_UpdateItemMasterIDs]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[Core_UpdateItemMasterIDs]
(
@CharacterID int,
@ItemMasterId int,
@NewItemMasterId int,
@Type char(1)
)
AS
BEGIN TRAN
IF (@Type='I')
BEGIN
UPDATE ITEMS SET ItemMasterId=@NewItemMasterId,ParentItemId=@NewItemMasterId WHERE CharacterId=@CharacterID AND ItemMasterId=@ItemMasterId
END
ELSE IF(@Type='S')
BEGIN
UPDATE CharacterSpells SET SpellId=@NewItemMasterId WHERE CharacterId=@CharacterID AND SpellId=@ItemMasterId
END
ELSE IF(@Type='A')
BEGIN
UPDATE CharacterAbilities SET AbilityId=@NewItemMasterId WHERE CharacterId=@CharacterID AND AbilityId=@ItemMasterId
END
ELSE IF(@Type='C')
BEGIN
UPDATE CharactersCharacterStats SET CharacterStatId=@NewItemMasterId WHERE CharacterId=@CharacterID AND CharacterStatId=@ItemMasterId
END
COMMIT TRAN
GO
