
alter TABLE RuleSets

Add IsCoreContent bit NULL, ParentRuleSetId int NULL

ALTER TABLE [dbo].[RuleSets]  WITH CHECK ADD  CONSTRAINT [FK_RuleSets_RuleSets1] FOREIGN KEY([ParentRuleSetId])
REFERENCES [dbo].[RuleSets] ([RuleSetId])
GO

ALTER TABLE [dbo].[RuleSets] CHECK CONSTRAINT [FK_RuleSets_RuleSets1]
GO


