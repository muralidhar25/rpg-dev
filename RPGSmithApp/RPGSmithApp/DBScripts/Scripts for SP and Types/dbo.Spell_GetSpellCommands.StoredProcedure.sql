USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Spell_GetSpellCommands]    Script Date: 3/28/2019 1:15:36 PM ******/
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
