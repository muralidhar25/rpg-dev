USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Spell_GetSpellCommands]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Spell_GetSpellCommands]
(
 @SpellId INT
)
AS
BEGIN	
	SELECT * FROM [dbo].[SpellCommands]
	WHERE SpellId = @SpellId
END
GO
