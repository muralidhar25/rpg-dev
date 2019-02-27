import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../core/services/search.service';
import { Search } from '../../core/models/search.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../core/common/alert.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { BsModalService } from 'ngx-bootstrap';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { Characters } from '../../core/models/view-models/characters.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    searchimage: string;
    isLoading = false;
    name: string;
    text: string;
    searchList: any = [];
    drpText: string;
    dropDownText: any;
    selected: boolean;
    value: number = 1;
    defaultText: string = 'Character';
    searchModal: Search = new Search();

    constructor(private searchService: SearchService, private router: Router, private alertService: AlertService, private sharedService: SharedService,
        private configurations: ConfigurationService, private route: ActivatedRoute, private modalService: BsModalService,
        private localStorage: LocalStoreManager, private authService: AuthService) {
        this.route.params.subscribe(params => { this.searchModal.searchText = params['q']; });
    }

    ngOnInit() {
        this.Initialize();
    }

    private Initialize() {

        this.search(this.searchModal.searchText);
        this.dropDownText = [
            { value: 1, text: 'Everything', selected: false },
            { value: 2, text: 'Character', selected: true },
            { value: 3, text: 'Rulesets', selected: false },
            { value: 4, text: 'Items', selected: false },
            { value: 5, text: 'Spells', selected: false },
            { value: 6, text: 'Abilities', selected: false },
            { value: 7, text: 'Character Stat', selected: false },
            { value: 8, text: 'Tiles', selected: false },
        ];
    }

    search(query: string) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            if (this.defaultText == 'Character') {
                this.isLoading = true;
                this.searchService.searchCharacters<any>(query, user.id)
                    .subscribe(data => {
                        this.searchList = [];
                        if (data.length > 0) {
                            this.searchList = data.map(x => {
                                return {
                                    searchimage: x.imageUrl,
                                    name: x.characterName,
                                    text: this.defaultText,
                                    characterId: x.characterId,
                                    rulesetId: x.rulesetId
                                };
                            });
                        }
                        this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                    }, () => { });
            } else {
                this.searchList = [];
            }
        }
    }

    setText(text) {
        this.defaultText = text.text;
        this.dropDownText.forEach(function (val) {
            val.selected = false;
        });
        text.selected = true;

        this.search(this.searchModal.searchText);
    }

    gotoPage(input: any) {
        if (this.defaultText == "Character") {
            this.setRulesetId(input.rulesetId);
            this.router.navigate(['/character/dashboard', input.characterId]);
        }
    }
    private setRulesetId(rulesetId: number) {
        this.localStorage.deleteData(DBkeys.RULESET_ID);
        this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
       // console.log(' rulesetId => ' + this.localStorage.getDataObject<number>(DBkeys.RULESET_ID));
    }

}
