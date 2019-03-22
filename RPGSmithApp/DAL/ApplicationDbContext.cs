// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using DAL.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using DAL.Models.Interfaces;
using Microsoft.EntityFrameworkCore.Design;
using DAL.Models.CharacterTileModels;
using DAL.Models.RulesetTileModels;

namespace DAL
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>
    {
        public string CurrentUserId { get; set; }

        public virtual DbSet<RuleSetGenre> RuleSetGenres { get; set; }
        public virtual DbSet<RuleSet> RuleSets { get; set; }
        public virtual DbSet<UserRuleSet> Users_RuleSets { get; set; }
        public virtual DbSet<Character> Characters { get; set; }
        public virtual DbSet<CharacterStat> CharacterStats { get; set; }
        public virtual DbSet<CharacterStatType> CharacterStatTypes { get; set; }
        public virtual DbSet<CharacterStatCalc> CharacterStatCalcs { get; set; }
        public virtual DbSet<CharacterStatChoice> CharacterStatChoices { get; set; }
        public virtual DbSet<CharacterStatCombo> CharacterStatCombos { get; set; }
        public virtual DbSet<CharacterStatToggle> CharacterStatToggle { get; set; }
        public virtual DbSet<CustomToggle> CustomToggle { get; set; }
        public virtual DbSet<CharacterCustomToggle> CharacterCustomToggle { get; set; }

        public virtual DbSet<Ability> Abilities { get; set; }
        public virtual DbSet<ItemMaster> ItemMasters { get; set; }
        public virtual DbSet<ItemMasterPlayer> ItemMasterPlayers { get; set; }
        public virtual DbSet<ItemMasterAbility> ItemMasterAbilities { get; set; }
        public virtual DbSet<Spell> Spells { get; set; }
        public virtual DbSet<ItemMasterSpell> ItemMasterSpells { get; set; }

        public virtual DbSet<ItemMasterCommand> ItemMasterCommands { get; set; }
        public virtual DbSet<SpellCommand> SpellCommands { get; set; }
        public virtual DbSet<AbilityCommand> AbilityCommands { get; set; }

        public virtual DbSet<Item> Items { get; set; }
        public virtual DbSet<CharacterAbility> CharacterAbilities { get; set; }
        public virtual DbSet<CharacterSpell> CharacterSpells { get; set; }

        //public virtual DbSet<Container> Containers { get; set; }
        public virtual DbSet<PageLastView> PageLastViews { get; set; }
        public virtual DbSet<CharacterCommand> CharacterCommands { get; set; }

        public virtual DbSet<ItemCommand> ItemCommands { get; set; }
        public virtual DbSet<ItemAbility> ItemAbilities { get; set; }
        public virtual DbSet<ItemSpell> ItemSpells { get; set; }

        //public virtual DbSet<Tile> Tiles { get; set; }
        //public virtual DbSet<NoteTile> NoteTiles { get; set; }
        //public virtual DbSet<ExecuteTile> ExecuteTiles { get; set; }
        //public virtual DbSet<LinkTile> LinkTiles { get; set; }
        //public virtual DbSet<ImageTile> ImageTiles { get; set; }
        //public virtual DbSet<CounterTile> CounterTiles { get; set; }
        //public virtual DbSet<CommandTile> CommandTiles { get; set; }
        //public virtual DbSet<CharacterStatTile> CharacterStatTiles { get; set; }

        public virtual DbSet<TileType> TileTypes { get; set; }
        //Character tiles
        public virtual DbSet<CharacterDashboardLayout> CharacterDashboardLayouts { get; set; }
        public virtual DbSet<CharacterDashboardPage> CharacterDashboardPages { get; set; }
        public virtual DbSet<CharactersCharacterStat> CharactersCharacterStats { get; set; }
        public virtual DbSet<CharacterTile> CharacterTiles { get; set; }
        public virtual DbSet<CharacterNoteTile> CharacterNoteTiles { get; set; }
        public virtual DbSet<CharacterExecuteTile> CharacterExecuteTiles { get; set; }
        public virtual DbSet<CharacterLinkTile> CharacterLinkTiles { get; set; }
        public virtual DbSet<CharacterImageTile> CharacterImageTiles { get; set; }
        public virtual DbSet<CharacterTextTile> CharacterTextTiles { get; set; }
        public virtual DbSet<CharacterCounterTile> CharacterCounterTiles { get; set; }
        public virtual DbSet<CharacterCommandTile> CharacterCommandTiles { get; set; }
        public virtual DbSet<CharacterCharacterStatTile> CharacterCharacterStatTiles { get; set; }
        public virtual DbSet<TileColor> TileColors { get; set; }
        public virtual DbSet<TileConfig> TileConfig { get; set; }

        //Ruleset tiles
        public virtual DbSet<RulesetDashboardLayout> RulesetDashboardLayouts { get; set; }
        public virtual DbSet<RulesetDashboardPage> RulesetDashboardPages { get; set; }
        public virtual DbSet<RulesetTile> RulesetTiles { get; set; }
        public virtual DbSet<RulesetNoteTile> RulesetNoteTiles { get; set; }
        public virtual DbSet<RulesetImageTile> RulesetImageTiles { get; set; }
        public virtual DbSet<RulesetTextTile> RulesetTextTiles { get; set; }
        public virtual DbSet<RulesetCounterTile> RulesetCounterTiles { get; set; }
        public virtual DbSet<RulesetCommandTile> RulesetCommandTiles { get; set; }
        public virtual DbSet<RulesetCharacterStatTile> RulesetCharacterStatTiles { get; set; }
        public virtual DbSet<RulesetTileColor> RulesetTileColors { get; set; }
        public virtual DbSet<RulesetTileConfig> RulesetTileConfig { get; set; }

        public virtual DbSet<RPGCoreColor> RPGCoreColors { get; set; }
        public virtual DbSet<CustomDice> CustomDices { get; set; }
        public virtual DbSet<CustomDiceResult> CustomDiceResults { get; set; }
        public virtual DbSet<DefaultDice> DefaultDices { get; set; }
        public virtual DbSet<DiceTray> DiceTrays { get; set; }
        public virtual DbSet<CharacterStatDefaultValue> CharacterStatDefaultValues { get; set; }
        public virtual DbSet<CharacterStatCondition> CharacterStatConditions { get; set; }
        public virtual DbSet<ConditionOperator> ConditionOperators { get; set; }
        public virtual DbSet<SearchFilter> SearchFilter { get; set; }
        public virtual DbSet<ItemMasterBundle> ItemMasterBundles { get; set; }
        public virtual DbSet<ItemMasterBundleItem> ItemMasterBundleItems { get; set; }
        

        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
            Database.SetCommandTimeout(3600);
        }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>().Property(c => c.Id).HasMaxLength(50);
            builder.Entity<ApplicationUser>().Property(c => c.FullName).HasMaxLength(150);
            builder.Entity<ApplicationUser>().Property(c => c.JobTitle).HasMaxLength(150);
            builder.Entity<ApplicationUser>().Property(c => c.PasswordHash).HasMaxLength(500);
            builder.Entity<ApplicationUser>().Property(c => c.PhoneNumber).HasMaxLength(30);
            builder.Entity<ApplicationUser>().Property(c => c.CreatedBy).HasMaxLength(50);
            builder.Entity<ApplicationUser>().Property(c => c.UpdatedBy).HasMaxLength(50);
            builder.Entity<ApplicationUser>().Property(c => c.ProfileImage).HasMaxLength(2048);
            builder.Entity<ApplicationUser>().HasMany(u => u.Claims).WithOne().HasForeignKey(c => c.UserId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.Entity<ApplicationUser>().HasMany(u => u.Roles).WithOne().HasForeignKey(r => r.UserId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            //builder.Entity<ApplicationRole>().Property(p => p.Id).HasMaxLength(50);
            builder.Entity<ApplicationRole>().HasMany(r => r.Claims).WithOne().HasForeignKey(c => c.RoleId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.Entity<ApplicationRole>().HasMany(r => r.Users).WithOne().HasForeignKey(r => r.RoleId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            //builder.Entity<RuleSet>().HasKey(f => f.RuleSetId);
            builder.Entity<RuleSet>().HasKey(g => new { g.RuleSetId });
            builder.Entity<RuleSet>().Property(c => c.RuleSetName).HasMaxLength(255).IsRequired();
            builder.Entity<RuleSet>().Property(c => c.RuleSetDesc).HasMaxLength(4000);
            //builder.Entity<RuleSet>().Property(c => c.DefaultDice).HasMaxLength(255);
            //builder.Entity<RuleSet>().Property(c => c.CurrencyLabel).HasMaxLength(20);
            //builder.Entity<RuleSet>().Property(c => c.WeightLabel).HasMaxLength(20);
            //builder.Entity<RuleSet>().Property(c => c.DistanceLabel).HasMaxLength(20);
            //builder.Entity<RuleSet>().Property(c => c.VolumeLabel).HasMaxLength(20);
            builder.Entity<RuleSet>().Property(c => c.ImageUrl).HasMaxLength(2048);
            builder.Entity<RuleSet>().Property(c => c.ThumbnailUrl).HasMaxLength(2048);
            builder.Entity<RuleSet>().Property(c => c.isActive).IsRequired();

            builder.Entity<RuleSet>().Property(c => c.OwnerId).HasMaxLength(50).IsRequired();
            builder.Entity<RuleSet>().Property(c => c.CreatedBy).HasMaxLength(50).IsRequired();
            builder.Entity<RuleSet>().Property(c => c.CreatedDate).IsRequired();
            builder.Entity<RuleSet>().Property(c => c.ModifiedBy).HasMaxLength(50);
            builder.Entity<RuleSet>().Property(c => c.ModifiedDate);
            builder.Entity<RuleSet>().ToTable($"{nameof(this.RuleSets)}");

            builder.Entity<RuleSet>(entity => { entity.HasIndex(e => e.ShareCode).IsUnique(); });

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.RuleSets).WithOne(x => x.AspNetUser)
                .HasForeignKey(e => e.OwnerId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.RuleSets1).WithOne(x => x.AspNetUser1)
                .HasForeignKey(e => e.CreatedBy).IsRequired().OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.RuleSets2).WithOne(x => x.AspNetUser2)
                .HasForeignKey(e => e.ModifiedBy);

            builder.Entity<RuleSet>()
           .HasMany(e => e.RuleSets1).WithOne(x => x.RuleSet1)
           .HasForeignKey(e => e.ParentRuleSetId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Spell>()
          .HasMany(e => e.Spells1).WithOne(x => x.Spell1)
          .HasForeignKey(e => e.ParentSpellId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Ability>()
            .HasMany(e => e.Abilities1).WithOne(x => x.Ability1)
            .HasForeignKey(e => e.ParentAbilityId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Character>()
           .HasMany(e => e.Characters1).WithOne(x => x.Character1)
           .HasForeignKey(e => e.ParentCharacterId).OnDelete(DeleteBehavior.Restrict);


            builder.Entity<ItemMaster>()
           .HasMany(e => e.ItemMasters1).WithOne(x => x.ItemMaster1)
           .HasForeignKey(e => e.ParentItemMasterId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserRuleSet>().HasKey(ur => new { ur.RuleSetId, ur.UserId });

            builder.Entity<UserRuleSet>()
                .HasOne(bc => bc.RuleSet)
                .WithMany(b => b.UserRuleSets)
                .HasForeignKey(bc => bc.RuleSetId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserRuleSet>()
                .HasOne(bc => bc.AppUser)
                .WithMany(c => c.UserRuleSets)
                .HasForeignKey(bc => bc.UserId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CharacterStatCondition>()
                   .HasOne(m => m.CharacterStat)
                   .WithMany(t => t.CharacterStatConditions)
                   .HasForeignKey(m => m.CharacterStatId);
                   


            builder.Entity<RuleSetGenre>().Property(c => c.RuleSetGenreId);
            builder.Entity<RuleSetGenre>().Property(c => c.GenreName).HasMaxLength(100).IsRequired();
            builder.Entity<RuleSetGenre>().ToTable($"{nameof(this.RuleSetGenres)}");

            builder.Entity<CharacterStatType>().HasKey(c => c.CharacterStatTypeId);
            builder.Entity<CharacterStatType>().Property(c => c.StatTypeName).HasMaxLength(255).IsRequired();
            builder.Entity<CharacterStatType>().Property(c => c.StatTypeDesc).HasMaxLength(4000);
            builder.Entity<CharacterStatType>().Property(c => c.isNumeric);
            builder.Entity<CharacterStatType>().ToTable($"{nameof(this.CharacterStatTypes)}");

            builder.Entity<CharacterStat>().HasKey(c => c.CharacterStatId);
            builder.Entity<CharacterStat>().Property(c => c.RuleSetId).IsRequired();
            builder.Entity<CharacterStat>().Property(c => c.isActive);
            builder.Entity<CharacterStat>().Property(c => c.StatName).HasMaxLength(100).IsRequired();
            builder.Entity<CharacterStat>().Property(c => c.StatDesc).HasMaxLength(4000);
            builder.Entity<CharacterStat>().Property(c => c.isMultiSelect);
            builder.Entity<CharacterStat>().Property(c => c.SortOrder);
            builder.Entity<CharacterStat>().Property(c => c.OwnerId).HasMaxLength(50).IsRequired();
            builder.Entity<CharacterStat>().Property(c => c.CreatedBy).HasMaxLength(50);//.IsRequired();
            builder.Entity<CharacterStat>().Property(c => c.CreatedDate).IsRequired();
            builder.Entity<CharacterStat>().Property(c => c.ModifiedBy).HasMaxLength(50);
            builder.Entity<CharacterStat>().Property(c => c.ModifiedDate);
            builder.Entity<CharacterStat>().ToTable($"{nameof(this.CharacterStats)}");

            builder.Entity<ApplicationUser>()
               .HasMany(e => e.CharacterStat).WithOne(x => x.AspNetUser)
               .HasForeignKey(e => e.OwnerId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.CharacterStat1).WithOne(x => x.AspNetUser1)
                .HasForeignKey(e => e.CreatedBy).IsRequired().OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.CharacterStat2).WithOne(x => x.AspNetUser2)
                .HasForeignKey(e => e.ModifiedBy);

            builder.Entity<RuleSet>()
                .HasMany(e => e.CharacterStats).WithOne(x => x.RuleSet)
                .HasForeignKey(e => e.RuleSetId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CharacterStat>()
                .HasMany(e => e.CharacterStats1).WithOne(x => x.CharacterStat1)
                .HasForeignKey(e => e.ParentCharacterStatId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CharacterStatType>()
                .HasMany(e => e.CharacterStats).WithOne(x => x.CharacterStatType)
                .HasForeignKey(e => e.CharacterStatTypeId).OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CharacterStatCalc>().HasKey(c => c.CharacterStatCalcId);
            builder.Entity<CharacterStatCalc>().Property(c => c.StatCalculation).HasMaxLength(500).IsRequired();
            builder.Entity<CharacterStatCalc>().ToTable($"{nameof(this.CharacterStatCalcs)}");

            builder.Entity<CharacterStat>()
                .HasMany(e => e.CharacterStatCalcs).WithOne(x => x.CharacterStat)
                .HasForeignKey(e => e.CharacterStatId).OnDelete(DeleteBehavior.Cascade);


            builder.Entity<CharacterStatChoice>().HasKey(c => c.CharacterStatChoiceId);
            builder.Entity<CharacterStatChoice>().Property(c => c.StatChoiceValue).HasMaxLength(100);
            builder.Entity<CharacterStatChoice>().ToTable($"{nameof(this.CharacterStatChoices)}");

            builder.Entity<CharacterStat>()
                .HasMany(e => e.CharacterStatChoices).WithOne(x => x.CharacterStat)
                .HasForeignKey(e => e.CharacterStatId).OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Character>().HasKey(c => c.CharacterId);
            builder.Entity<Character>().Property(c => c.CharacterName).HasMaxLength(100).IsRequired();
            builder.Entity<Character>().Property(c => c.CharacterDescription).HasMaxLength(4000);
            builder.Entity<Character>().Property(c => c.ImageUrl).HasMaxLength(2048);
            builder.Entity<Character>().Property(c => c.ThumbnailUrl).HasMaxLength(2048);
            builder.Entity<Character>().Property(c => c.UserId).HasMaxLength(50).IsRequired();
            builder.Entity<Character>().Property(c => c.RuleSetId).IsRequired();
            builder.Entity<Character>().ToTable($"{nameof(this.Characters)}");

            //builder.Entity<Character>()
            //    .HasIndex(x => new { x.UserId, x.CharacterName, x.IsDeleted })
            //    .HasName("UIX_Characters_UserId_CharacterName")
            //    .IsUnique();

            builder.Entity<ApplicationUser>()
                .HasMany(e => e.Characters).WithOne(x => x.AspNetUser)
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("FK_Characters_AspNetUsers");

            builder.Entity<RuleSet>()
                 .HasMany(e => e.Characters).WithOne(x => x.RuleSet)
                 .HasForeignKey(e => e.RuleSetId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("FK_Characters_RuleSets");

            //builder.Entity<ItemMaster>()
            //    .HasOne(i => i.RuleSet)
            //    .WithMany(r => r.ItemMasters)
            //    .HasForeignKey(i => i.RuleSetId)
            //    .HasConstraintName("ForeignKey_ItemMasters_Rulsets");

            builder.Entity<ItemMasterAbility>()
                .ToTable("ItemMaster_Abilities")
                .HasKey(ia => new { ia.AbilityId, ia.ItemMasterId });

            builder.Entity<ItemMasterPlayer>()
                .ToTable("ItemMaster_Players")
                .HasKey(ip => new { ip.PlayerId, ip.ItemMasterId });

            builder.Entity<ItemMasterSpell>()
                .ToTable("ItemMaster_Spells")
                .HasKey(ims => new { ims.SpellId, ims.ItemMasterId });


            builder.Entity<ItemSpell>()
                .ToTable("ItemSpells")
                .HasKey(spell => new { spell.SpellId, spell.ItemId });

            builder.Entity<ItemAbility>()
                .ToTable("ItemAbilities")
                .HasKey(ability => new { ability.AbilityId, ability.ItemId });


            builder.Entity<ApplicationUser>()
                .HasMany(u => u.ItemMasterPlayers).WithOne(x => x.Player)
                .HasForeignKey(p => p.PlayerId).OnDelete(DeleteBehavior.Restrict);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.CharacterStat)
            //    .WithRequired(e => e.AspNetUser)
            //    .HasForeignKey(e => e.OwnerId)
            //    .WillCascadeOnDelete(false);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.CharacterStats1)
            //    .WithRequired(e => e.AspNetUser1)
            //    .HasForeignKey(e => e.CreatedBy)
            //    .WillCascadeOnDelete(false);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.CharacterStats2)
            //    .WithOptional(e => e.AspNetUser2)
            //    .HasForeignKey(e => e.ModifiedBy);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.RuleSets)
            //    .WithRequired(e => e.AspNetUser)
            //    .HasForeignKey(e => e.OwnerId)
            //    .WillCascadeOnDelete(false);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.RuleSets1)
            //    .WithRequired(e => e.AspNetUser1)
            //    .HasForeignKey(e => e.CreatedBy)
            //    .WillCascadeOnDelete(false);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.RuleSets2)
            //    .WithOptional(e => e.AspNetUser2)
            //    .HasForeignKey(e => e.ModifiedBy);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.Users_RuleSets)
            //    .WithRequired(e => e.AspNetUser)
            //    .HasForeignKey(e => e.UserId)
            //    .WillCascadeOnDelete(false);

            //builder.Entity<ApplicationUser>()
            //    .HasMany(e => e.Users_RuleSets1)
            //    .WithRequired(e => e.AspNetUser1)
            //    .HasForeignKey(e => e.UserId);

            //builder.Entity<CharacterStat>()
            //    .HasMany(e => e.CharacterStats1)
            //    .WithOptional(e => e.CharacterStat1)
            //    .HasForeignKey(e => e.ParentCharacterStatId);

            //builder.Entity<CharacterStatType>()
            //    .HasMany(e => e.CharacterStats)
            //    .WithRequired(e => e.CharacterStatType)
            //    .WillCascadeOnDelete(false);

            builder.Entity<TileConfig>()
                .HasIndex(u => u.UniqueId)
                .IsUnique();

            builder.Entity<TileConfig>()
                .HasIndex(u => u.CharacterTileId)
                .IsUnique();

            builder.Entity<RulesetTileConfig>()
               .HasIndex(u => u.UniqueId)
               .IsUnique();

            builder.Entity<RulesetTileConfig>()
                .HasIndex(u => u.RulesetTileId)
                .IsUnique();

        }




        public override int SaveChanges()
        {
            UpdateAuditEntities();
            return base.SaveChanges();
        }


        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            UpdateAuditEntities();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            UpdateAuditEntities();
            return base.SaveChangesAsync(cancellationToken);
        }


        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
        {
            UpdateAuditEntities();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }


        private void UpdateAuditEntities()
        {
            var modifiedEntries = ChangeTracker.Entries()
                .Where(x => x.Entity is IAuditableEntity && (x.State == EntityState.Added || x.State == EntityState.Modified));


            foreach (var entry in modifiedEntries)
            {
                var entity = (IAuditableEntity)entry.Entity;
                DateTime now = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    entity.CreatedDate = now;
                    entity.CreatedBy = CurrentUserId;
                }
                else
                {
                    base.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
                    base.Entry(entity).Property(x => x.CreatedDate).IsModified = false;
                }

                entity.UpdatedDate = now;
                entity.UpdatedBy = CurrentUserId;
            }
        }
    }
}



