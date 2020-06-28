// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using AutoMapper;
using DAL.Core;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using Microsoft.AspNetCore.Identity;
using RPGSmithApp.ViewModels.CreateModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{

    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<ApplicationUser, UserViewModel>()
                   .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<UserRegistraionViewModel, ApplicationUser>()
            .ForMember(d => d.Roles, map => map.Ignore())
            .ForMember(d => d.Claims, map => map.Ignore());

            CreateMap<RuleSetViewModel, RuleSet>().ForMember(d => d.RuleSetId, map => map.Ignore());

            CreateMap<CharacterStatEditModel, CharacterStat>()
                 .ForMember(d => d.CharacterStatId, map => map.Ignore())
                 .ForMember(d => d.RuleSetId, opt => opt.MapFrom(src => src.RuleSetId))
                 .ForMember(d => d.StatName, opt => opt.MapFrom(src => src.StatName))
                 .ForMember(d => d.StatDesc, opt => opt.MapFrom(src => src.StatDesc))
                 .ForMember(d => d.isMultiSelect, opt => opt.MapFrom(src => src.isMultiSelect))
                 .ForMember(d => d.isActive, opt => opt.MapFrom(src => src.isActive))
                 .ForMember(d => d.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
                 .ForMember(d => d.ModifiedDate, opt => opt.MapFrom(src => DateTime.Now))
                  .ForMember(d => d.ParentCharacterStatId, opt => opt.MapFrom(src => src.ParentCharacterStatId == 0 ? null : src.ParentCharacterStatId));

            CreateMap<CharacterEditModel, Character>()
              .ForMember(d => d.CharacterId, map => map.Ignore())
              .ForMember(d => d.RuleSetId, opt => opt.MapFrom(src => src.RuleSetId))
              .ForMember(d => d.CharacterName, opt => opt.MapFrom(src => src.CharacterName))
              .ForMember(d => d.InventoryWeight, opt => opt.MapFrom(src => src.InventoryWeight))
              .ForMember(d => d.CharacterDescription, opt => opt.MapFrom(src => src.CharacterDescription));

            CreateMap<UserViewModel, ApplicationUser>()
                .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<ApplicationUser, UserEditViewModel>()
                .ForMember(d => d.Roles, map => map.Ignore());
            CreateMap<UserEditViewModel, ApplicationUser>()
                .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<ApplicationUser, UserPatchViewModel>()
                .ReverseMap();

            CreateMap<ApplicationRole, RoleViewModel>()
                .ForMember(d => d.Permissions, map => map.MapFrom(s => s.Claims))
                .ForMember(d => d.UsersCount, map => map.ResolveUsing(s => s.Users?.Count ?? 0))
                .ReverseMap();
            CreateMap<RoleViewModel, ApplicationRole>();

            CreateMap<IdentityRoleClaim<string>, ClaimViewModel>()
                .ForMember(d => d.Type, map => map.MapFrom(s => s.ClaimType))
                .ForMember(d => d.Value, map => map.MapFrom(s => s.ClaimValue))
                .ReverseMap();

            CreateMap<ApplicationPermission, PermissionViewModel>()
                .ReverseMap();

            CreateMap<IdentityRoleClaim<string>, PermissionViewModel>()
                .ConvertUsing(s => Mapper.Map<PermissionViewModel>(ApplicationPermissions.GetPermissionByValue(s.ClaimValue)));

            CreateMap<CreateItemMasterModel, ItemMaster>()
              .ForMember(d => d.ItemMasterId, map => map.Ignore())
                .ForMember(d => d.ItemMasterCommand, map => map.Ignore());


            CreateMap<EditItemMasterModel, ItemMaster>()
             .ForMember(d => d.ItemMasterId, opt => opt.MapFrom(src => src.ItemMasterId))
             .ForMember(d => d.RuleSetId, map => map.Ignore());

            CreateMap<CreateSpellModel, Spell>()
            .ForMember(d => d.SpellId, map => map.Ignore());

            CreateMap<EditSpellModel, Spell>();

            CreateMap<Item, ItemListViewModel>()
            .ForMember(d => d.ContainerItems, map => map.Ignore());

            CreateMap<ItemEditModel, Item>();
            CreateMap<Item, ItemEditModel>()
            .ForMember(d => d.ContainerItems, map => map.Ignore());

            CreateMap<EditAbilityModel, Ability>();
            CreateMap<CreateAbilityModel, Ability>();
            CreateMap<Ability, AbilityViewModel>();

            CreateMap<EditBuffAndeffectModel, BuffAndEffect>();
            CreateMap<CreateBuffAndEffectModel, BuffAndEffect>();
            CreateMap<BuffAndEffect, BuffAndEffectViewModel>();
            CreateMap<BuffAndEffectVM, BuffAndEffectViewModel>();

            CreateMap<EditMonsterTemplateModel, MonsterTemplate>();
            CreateMap<CreateMonsterTemplateModel, MonsterTemplate>();
            CreateMap<MonsterTemplate, MonsterTemplateViewModel>().ForMember(d => d.MonsterTemplateCurrency, map => map.Ignore());
            CreateMap<Monster, MonsterViewModel>().ForMember(d => d.MonsterCurrency, map => map.Ignore());
            CreateMap<ItemMasterMonsterItem, ItemMasterMonsterItemVM>();

            CreateMap<Create_LootTemplate_ViewModel, LootTemplate>();
            CreateMap<LootTemplate, LootTemplate_ViewModel>();


            CreateMap<Spell, SpellViewModel>();
            CreateMap<CharacterCommand, CharacterCommandViewModel>();

            CreateMap<SpellViewModel, Spell>();
            CreateMap<CharacterCommandViewModel, CharacterCommand>();
            CreateMap<RulesetCommandViewModel, RulesetCommand>();

            CreateMap<CharactersCharacterStat, CharactersCharacterStatViewModel>()
                 .ForMember(d => d.SelectedCharacterChoices, map => map.Ignore()
              );

            CreateMap<CharacterTileCreateModel, CharacterTile>()
                //.ForMember(d => d.CharacterTileId, map => map.Ignore())
                .ForMember(d => d.TileType, map => map.Ignore())
                .ForMember(d => d.Character, map => map.Ignore())
                .ForMember(d => d.CharacterDashboardPage, map => map.Ignore())
                .ForMember(d => d.CharacterStatTiles, map => map.Ignore())
                .ForMember(d => d.CommandTiles, map => map.Ignore())
                .ForMember(d => d.CounterTiles, map => map.Ignore())
                .ForMember(d => d.NoteTiles, map => map.Ignore())
                .ForMember(d => d.ImageTiles, map => map.Ignore())
                .ForMember(d => d.LinkTiles, map => map.Ignore())
                .ForMember(d => d.ExecuteTiles, map => map.Ignore()
                );

            CreateMap<CharacterTileEditModel, CharacterTile>()
                //.ForMember(d => d.CharacterTileId, map => map.Ignore())
                .ForMember(d => d.Character, map => map.Ignore())
                .ForMember(d => d.TileType, map => map.Ignore())
                .ForMember(d => d.CharacterDashboardPage, map => map.Ignore())
                .ForMember(d => d.CharacterStatTiles, map => map.Ignore())
                .ForMember(d => d.CommandTiles, map => map.Ignore())
                .ForMember(d => d.CounterTiles, map => map.Ignore())
                .ForMember(d => d.NoteTiles, map => map.Ignore())
                .ForMember(d => d.ImageTiles, map => map.Ignore())
                .ForMember(d => d.LinkTiles, map => map.Ignore())
                .ForMember(d => d.ExecuteTiles, map => map.Ignore()
              );

            CreateMap<RulesetTileCreateModel, RulesetTile>()
                //.ForMember(d => d.RulesetTileId, map => map.Ignore())
                .ForMember(d => d.TileType, map => map.Ignore())
                .ForMember(d => d.Ruleset, map => map.Ignore())
                .ForMember(d => d.RulesetDashboardPage, map => map.Ignore())
                .ForMember(d => d.CharacterStatTiles, map => map.Ignore())
                .ForMember(d => d.CommandTiles, map => map.Ignore())
                .ForMember(d => d.CounterTiles, map => map.Ignore())
                .ForMember(d => d.NoteTiles, map => map.Ignore())
                .ForMember(d => d.ImageTiles, map => map.Ignore()
               );

            CreateMap<RulesetTileEditModel, RulesetTile>()
                //.ForMember(d => d.RulesetTileId, map => map.Ignore())
                .ForMember(d => d.Ruleset, map => map.Ignore())
                .ForMember(d => d.TileType, map => map.Ignore())
                .ForMember(d => d.RulesetDashboardPage, map => map.Ignore())
                .ForMember(d => d.CharacterStatTiles, map => map.Ignore())
                .ForMember(d => d.CommandTiles, map => map.Ignore())
                .ForMember(d => d.CounterTiles, map => map.Ignore())
                .ForMember(d => d.NoteTiles, map => map.Ignore())
                .ForMember(d => d.ImageTiles, map => map.Ignore()
              );
            CreateMap<ItemMasterBundleViewModel, ItemMasterBundle>()
                //.ForMember(d => d.RulesetTileId, map => map.Ignore())
                .ForMember(d => d.ItemMasterBundleItems, map => map.Ignore())
                .ForMember(d => d.RuleSet, map => map.Ignore()
              );

            CreateMap<MonsterTemplateBundleViewModel, MonsterTemplateBundle>();
            CreateMap<LootTemplate, LootTemplateVM>()
                .ForMember(d => d.LootTemplateCurrency, map => map.Ignore())
                .ForMember(d => d.CurrencyType, map => map.Ignore());
            CreateMap<LootTemplateVM, LootTemplate>()
                .ForSourceMember(d => d.LootTemplateCurrency, map => map.Ignore())
                .ForSourceMember(d => d.CurrencyType, map => map.Ignore());
        }
    }
}
