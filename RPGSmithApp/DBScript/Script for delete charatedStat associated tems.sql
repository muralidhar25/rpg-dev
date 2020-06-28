
ALTER TABLE [dbo].[CharacterStatCalcs] DROP CONSTRAINT [FK_CharacterStatCalcs_CharacterStats]
GO

ALTER TABLE [dbo].[CharacterStatCalcs]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStatCalcs_CharacterStats] FOREIGN KEY([CharacterStatId])
REFERENCES [dbo].[CharacterStats] ([CharacterStatId])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[CharacterStatCalcs] CHECK CONSTRAINT [FK_CharacterStatCalcs_CharacterStats]
GO


ALTER TABLE [dbo].[CharacterStatChoices] DROP CONSTRAINT [FK_CharacterStatChoices_CharacterStats]
GO

ALTER TABLE [dbo].[CharacterStatChoices]  WITH CHECK ADD  CONSTRAINT [FK_CharacterStatChoices_CharacterStats] FOREIGN KEY([CharacterStatId])
REFERENCES [dbo].[CharacterStats] ([CharacterStatId])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[CharacterStatChoices] CHECK CONSTRAINT [FK_CharacterStatChoices_CharacterStats]
GO




