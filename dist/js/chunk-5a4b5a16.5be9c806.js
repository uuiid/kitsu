(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5a4b5a16"],{1736:function(t,e,s){},"3c84":function(t,e,s){},4537:function(t,e,s){"use strict";var i=s("8b26"),n=s.n(i);n.a},"53b8":function(t,e,s){},"748f":function(t,e,s){"use strict";var i=s("53b8"),n=s.n(i);n.a},"7fa6":function(t,e,s){},"81cf":function(t,e,s){"use strict";var i=s("7fa6"),n=s.n(i);n.a},"8b26":function(t,e,s){},9355:function(t,e,s){"use strict";var i=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("a",{staticClass:"button",attrs:{title:t.title,href:t.path,target:t.target}},["plus"===t.icon?s("plus-icon",{staticClass:"icon is-small"}):t._e(),"download"===t.icon?s("download-icon",{staticClass:"icon is-small"}):t._e(),"upload"===t.icon?s("upload-icon",{staticClass:"icon is-small"}):t._e(),s("span",{staticClass:"text is-hidden-touch"},[t._v("\n    "+t._s(t.text)+"\n  ")])],1)},n=[],a=s("0a35"),o={name:"button-href-link",components:{PlusIcon:a["w"],DownloadIcon:a["i"],UploadIcon:a["F"]},props:{text:{default:"",type:String},path:{default:"",type:String},icon:{default:"",type:String},title:{default:"",type:String},styleclass:{default:"",type:String},target:{default:"_self",type:String}}},c=o,r=(s("f4d2"),s("2877")),l=Object(r["a"])(c,i,n,!1,null,"a4487af4",null);e["a"]=l.exports},da7b:function(t,e,s){"use strict";var i=s("3c84"),n=s.n(i);n.a},e0ac:function(t,e,s){},f27f:function(t,e,s){"use strict";var i=s("e0ac"),n=s.n(i);n.a},f4d2:function(t,e,s){"use strict";var i=s("1736"),n=s.n(i);n.a},fd5f:function(t,e,s){"use strict";s.r(e);var i=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"breakdown page"},[s("div",{staticClass:"breakdown-columns"},[s("div",{staticClass:"breakdown-column casting-column"},[s("div",{staticClass:"flexrow mb1"},[s("combobox-styled",{staticClass:"mr1",attrs:{label:t.$t("main.for"),options:t.castingTypeOptions},model:{value:t.castingType,callback:function(e){t.castingType=e},expression:"castingType"}}),t.isShotCasting?s("combobox-styled",{attrs:{label:t.$t("shots.fields.sequence"),options:t.castingSequenceOptions},model:{value:t.sequenceId,callback:function(e){t.sequenceId=e},expression:"sequenceId"}}):t._e(),t.isAssetCasting?s("combobox-styled",{attrs:{label:t.$t("tasks.fields.asset_type"),options:t.castingAssetTypesOptions},model:{value:t.assetTypeId,callback:function(e){t.assetTypeId=e},expression:"assetTypeId"}}):t._e(),s("span",{staticClass:"filler"}),s("button-simple",{staticClass:"flexrow-item",attrs:{title:t.$t("main.csv.import_file"),icon:"upload","is-responsive":!0},on:{click:t.showImportModal}}),s("button-href-link",{staticClass:"flexrow-item",attrs:{title:t.$t("main.csv.export_file"),icon:"download","is-responsive":!0,path:t.exportUrlPath}})],1),t.isLoading?s("spinner",{staticClass:"mt1"}):s("div",{},t._l(t.castingEntities,(function(e){return s("shot-line",{key:e.id,attrs:{"entity-id":e.id,selected:t.selection[e.id],name:e.name,assets:t.castingByType[e.id]||[]},on:{"remove-one":t.removeOneAsset,"remove-ten":t.removeTenAssets,click:t.selectEntity}})})),1)],1),t.isCurrentUserManager?s("div",{directives:[{name:"scroll",rawName:"v-scroll",value:t.onAssetListScroll,expression:"onAssetListScroll"}],ref:"asset-list",staticClass:"breakdown-column assets-column"},[s("h2",{staticClass:"subtitle"},[t._v("\n        "+t._s(t.$t("breakdown.all_assets"))+"\n      ")]),s("div",{staticClass:"filters-area flexrow"},[s("search-field",{staticClass:"flexrow-item",on:{change:t.onSearchChange}})],1),t.isAssetsLoading?s("spinner"):t._l(t.availableAssetsByType,(function(e){return s("div",{key:e.length>0?e[0].asset_type_name:"",staticClass:"type-assets"},[s("div",{staticClass:"asset-type"},[t._v("\n          "+t._s(e.length>0?e[0].asset_type_name:"")+"\n        ")]),s("div",{staticClass:"asset-list"},t._l(e,(function(e){return s("available-asset-block",{key:e.id,attrs:{asset:e,active:Object.keys(t.selection).length>0},on:{"add-one":t.addOneAsset,"add-ten":t.addTenAssets}})})),1)])}))],2):t._e()]),s("import-modal",{attrs:{active:t.modals.importing,"is-loading":t.loading.importing,"is-error":t.errors.importing,"form-data":t.importCsvFormData,columns:t.csvColumns},on:{fileselected:t.selectFile,confirm:t.uploadImportFile,cancel:t.hideImportModal}})],1)},n=[],a=(s("8e6e"),s("7f7f"),s("20d6"),s("456d"),s("ac6a"),s("bd86")),o=s("2f62"),c=s("3657"),r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:{asset:!0,active:t.active},attrs:{id:"casting-"+t.asset.id,title:t.asset.name}},[s("div",{staticClass:"asset-add",on:{click:t.addOneAsset}},[t._v("\n  + 1\n  ")]),s("div",{staticClass:"asset-add-10",on:{click:t.addTenAssets}},[t._v("\n  + 10\n  ")]),t.asset.preview_file_id.length>0?s("div",{staticClass:"asset-picture"},[s("img",{directives:[{name:"lazy",rawName:"v-lazy",value:"/api/pictures/thumbnails-square/preview-files/"+t.asset.preview_file_id+".png",expression:"'/api/pictures/thumbnails-square/preview-files/' + asset.preview_file_id + '.png'"}]})]):s("div",{staticClass:"asset-picture"},[s("span",{staticClass:"empty-picture"},[t._v("\n      "+t._s(t.asset.name)+"\n    ")])])])},l=[],u={name:"available-asset-block",props:{asset:{default:function(){return{id:"",name:""}},type:Object},active:{default:!1,type:Boolean}},computed:{},methods:{addOneAsset:function(t){this.active&&(console.log(this.asset),this.$emit("add-one",this.asset.id))},addTenAssets:function(t){this.active&&this.$emit("add-ten",this.asset.id)}}},d=u,p=(s("da7b"),s("2877")),h=Object(p["a"])(d,r,l,!1,null,"78751488",null),f=h.exports,m=s("9355"),v=s("de40"),g=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"field"},[t.label.length>0?s("label",{staticClass:"label"},[t._v("\n    "+t._s(t.label)+"\n  ")]):t._e(),s("div",{class:{combo:!0,open:t.showList}},[s("div",{staticClass:"flexrow",on:{click:t.toggleList}},[s("div",{staticClass:"selected-line flexrow-item"},[t._v("\n        "+t._s(t.selectedOption.label)+"\n      ")]),s("chevron-down-icon",{staticClass:"down-icon flexrow-item"})],1),t.showList?s("div",{ref:"select",staticClass:"select-input"},t._l(t.options,(function(e){return s("div",{key:e.id,staticClass:"option-line",on:{click:function(s){return t.selectOption(e)},mouseup:function(s){return"button"in s&&1!==s.button?null:t.openRoute(e)}}},[t._v("\n        "+t._s(e.label)+"\n      ")])})),0):t._e()]),s("div",{class:{"c-mask":!0,"is-active":t.showList},on:{click:t.toggleList}})])},y=[],b=(s("7514"),s("0a35"));function _(t,e){var s=Object.keys(t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),s.push.apply(s,i)}return s}function O(t){for(var e=1;e<arguments.length;e++){var s=null!=arguments[e]?arguments[e]:{};e%2?_(s,!0).forEach((function(e){Object(a["a"])(t,e,s[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(s)):_(s).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(s,e))}))}return t}var C={name:"combobox-styled",components:{ChevronDownIcon:b["d"]},data:function(){return{selectedOption:{label:"",value:""},showList:!1}},props:{label:{default:"",type:String},options:{default:function(){return[]},type:Array},value:{default:"",type:String}},mounted:function(){this.options.length>0&&(this.selectedOption=this.options[0])},computed:O({},Object(o["c"])(["isDarkTheme"])),methods:{selectOption:function(t){this.$emit("input",t.value),this.selectedOption=t,this.showList=!1},openRoute:function(t){var e=this.$router.resolve(t.route).href,s="".concat(window.location.protocol,"//").concat(window.location.host).concat(e);window.open(s,"_blank")},toggleList:function(){this.showList=!this.showList}},watch:{options:function(){var t=this;if(this.options.length>0){var e=this.options.find((function(e){return e.value===t.value}));this.selectedOption=e||this.options[0]}},value:function(){var t=this;this.selectedOption=this.options.find((function(e){return e.value===t.value}))}}},w=C,A=(s("81cf"),Object(p["a"])(w,g,y,!1,null,"4def9f9c",null)),S=A.exports,T=s("440f"),I=s("4d04"),k=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:{shot:!0,selected:t.selected,unselectable:!0},attrs:{id:t.entityId},on:{click:function(e){return t.onClicked(e)}}},[s("div",{staticClass:"flexrow"},[s("div",{staticClass:"shot-name flexrow-item"},[t._v("\n      "+t._s(t.name)+"\n    ")]),s("div",{staticClass:"asset-list flexrow-item"},[t._l(t.assets,(function(e){return s("div",{key:e.length>0?e[0].asset_type_name:"",staticClass:"asset-type-line flexrow"},[s("span",{staticClass:"asset-type-name flexrow-item"},[t._v("\n          "+t._s(e.length>0?e[0].asset_type_name:"")+"\n        ")]),t._l(e,(function(e){return s("asset-block",{key:e.id,staticClass:"flexrow-item",attrs:{asset:e,"nb-occurences":e.nb_occurences},on:{"remove-one":t.removeOneAsset,"remove-ten":t.removeTenAssets}})}))],2)})),0===t.assets.length?s("div",{staticClass:"asset-type-line flexrow empty"},[t._v("\n        "+t._s(t.$t("breakdown.empty"))+"\n      ")]):t._e()],2)])])},x=[],E=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:{asset:!0,big:!0,casted:!0,active:t.active},attrs:{title:t.asset.name+" ("+t.nbOccurences+")"}},[s("div",{staticClass:"asset-add",on:{click:t.removeOneAsset}},[t._v("\n  - 1\n  ")]),s("div",{staticClass:"asset-add-10",on:{click:t.removeTenAssets}},[t._v("\n  - 10\n  ")]),t.asset.preview_file_id?s("div",{staticClass:"asset-picture"},[s("img",{directives:[{name:"lazy",rawName:"v-lazy",value:"/api/pictures/thumbnails-square/preview-files/"+t.asset.preview_file_id+".png",expression:"'/api/pictures/thumbnails-square/preview-files/' + asset.preview_file_id + '.png'"}]}),t.nbOccurences>1?s("span",{staticClass:"nb-occurences"},[t._v("\n      "+t._s(t.nbOccurences)+"\n    ")]):t._e()]):s("div",{staticClass:"asset-picture"},[s("span",{staticClass:"empty-picture"},[t._v("\n      "+t._s(t.shortenName(t.asset.name))+" ("+t._s(t.nbOccurences)+")\n    ")])])])},q=[],j=(s("c5f6"),s("8c97")),$={name:"asset-block",props:{asset:{default:function(){return{id:"",name:""}},type:Object},nbOccurences:{default:1,type:Number},active:{default:!0,type:Boolean}},computed:{},methods:{removeOneAsset:function(t){this.$emit("remove-one",this.asset.asset_id)},removeTenAssets:function(t){this.$emit("remove-ten",this.asset.asset_id)},shortenName:function(t){return j["a"].shortenText(t,13)}}},L=$,P=(s("f27f"),Object(p["a"])(L,E,q,!1,null,"6c305118",null)),D=P.exports,F={name:"shot-line",props:{entityId:{default:"",type:String},selected:{default:!1,type:Boolean},name:{default:"",type:String},assets:{default:function(){return[]},type:Array}},components:{AssetBlock:D},methods:{onClicked:function(t){this.$emit("click",this.entityId,t)},removeOneAsset:function(t){this.$emit("remove-one",t,this.entityId)},removeTenAssets:function(t){this.$emit("remove-ten",t,this.entityId)}}},M=F,B=(s("748f"),Object(p["a"])(M,k,x,!1,null,"09550f96",null)),N=B.exports,U=s("be83");function K(t,e){var s=Object.keys(t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),s.push.apply(s,i)}return s}function z(t){for(var e=1;e<arguments.length;e++){var s=null!=arguments[e]?arguments[e]:{};e%2?K(s,!0).forEach((function(e){Object(a["a"])(t,e,s[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(s)):K(s).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(s,e))}))}return t}var R={name:"breakdown",components:{AvailableAssetBlock:f,ButtonHrefLink:m["a"],ButtonSimple:v["a"],ComboboxStyled:S,ImportModal:T["a"],SearchField:I["a"],ShotLine:N,Spinner:U["a"]},data:function(){return{assetTypeId:"",castingType:"shot",castingTypeOptions:[{label:this.$t("shots.title"),value:"shot"},{label:this.$t("assets.title"),value:"asset"}],csvColumns:["Episode","Parent","Name","Asset Type","Asset","Occurences","Label"],episodeId:"",importCsvFormData:{},isLoading:!1,selection:{},sequenceId:"",errors:{importing:!1},loading:{importing:!1},modals:{importing:!1}}},mounted:function(){this.isLoading||this.reset(),this.setLastProductionScreen("breakdown")},computed:z({},Object(o["c"])(["assetMap","assetsByType","casting","castingAssetTypeAssets","castingAssetTypesOptions","castingByType","castingCurrentShot","castingSequenceId","castingSequenceOptions","castingSequenceShots","currentEpisode","currentProduction","displayedShots","getEpisodeOptions","isCastingSaveActive","isCurrentUserManager","isAssetsLoading","isShotsLoading","isTVShow","sequences","sequenceMap","shots","shotMap"]),{availableAssetsByType:function(){var t=[];return this.assetsByType.forEach((function(e){var s=e.filter((function(t){return!t.canceled}));s.length>0&&t.push(s)})),t},exportUrlPath:function(){return"/api/export/csv/projects/".concat(this.currentProduction.id,"/casting.csv")},isAssetCasting:function(){return"asset"===this.castingType},isShotCasting:function(){return"shot"===this.castingType},castingEntities:function(){return this.isShotCasting?this.castingSequenceShots:this.castingAssetTypeAssets}}),methods:z({},Object(o["b"])(["addAssetToCasting","displayMoreAssets","loadShots","loadAssets","removeAssetFromCasting","saveCasting","setAssetSearch","setCastingAssetType","setCastingAssetTypes","setCastingEpisode","setCastingSequence","setCastingShot","setLastProductionScreen","uploadCastingFile"]),{reset:function(){var t=this;this.isLoading=!0,setTimeout((function(){t.reloadShots()}),100)},reloadShots:function(){var t=this;this.isLoading=!0,this.loadShots((function(){t.isTVShow?(t.currentEpisode&&(t.episodeId=t.currentEpisode.id),t.setCastingEpisode(t.episodeId)):t.setCastingEpisode(null),t.loadAssets((function(){t.isLoading=!1,t.displayMoreAssets(),t.setCastingAssetTypes(),t.resetSelection()}))}))},resetSelection:function(){var t={};this.isShotCasting?this.castingSequenceShots.forEach((function(e){t[e.id]=!1})):this.castingAssetTypeAssets.forEach((function(e){t[e.id]=!1})),this.selection=t},onSearchChange:function(t){this.setAssetSearch(t)},selectEntity:function(t,e){e.ctrlKey||e.shitKey||this.clearSelection(),this.previousEntityId&&e.shiftKey&&this.selectRange(this.previousEntityId,t),this.previousEntityId&&e.shiftKey||(this.previousEntityId=t),this.selection[t]=!0},clearSelection:function(){var t=this;Object.keys(this.selection).filter((function(e){return t.selection[e]})).forEach((function(e){t.selection[e]=!1}))},selectRange:function(t,e){var s=this,i=Object.keys(this.selection),n=i.findIndex((function(e){return e===t})),a=i.findIndex((function(t){return t===e})),o=[];o=n<a?Object(c["f"])(n,a):Object(c["f"])(a,n),o.forEach((function(t){t>=0&&(s.selection[i[t]]=!0)}))},addOneAsset:function(t){var e=this;Object.keys(this.selection).filter((function(t){return e.selection[t]})).forEach((function(s){e.addAssetToCasting({entityId:s,assetId:t,nbOccurences:1}),e.saveCasting(s).catch(console.error)}))},addTenAssets:function(t){var e=this;Object.keys(this.selection).filter((function(t){return e.selection[t]})).forEach((function(s){e.addAssetToCasting({entityId:s,assetId:t,nbOccurences:10}),e.saveCasting(s).catch(console.error)}))},removeOneAsset:function(t,e){this.removeAssetFromCasting({entityId:e,assetId:t,nbOccurences:1}),this.saveCasting(e).catch(console.error)},removeTenAssets:function(t,e){this.removeAssetFromCasting({entityId:e,assetId:t,nbOccurences:10}),this.saveCasting(e).catch(console.error)},onAssetListScroll:function(t,e){var s=this.$refs["asset-list"],i=s.scrollHeight-s.offsetHeight;i<e.scrollTop+100&&this.displayMoreAssets()},showImportModal:function(){this.modals.importing=!0},hideImportModal:function(){this.modals.importing=!1},selectFile:function(t){this.importCsvFormData=t},uploadImportFile:function(){var t=this;this.loading.importing=!0,this.errors.importing=!1,this.uploadCastingFile(this.importCsvFormData).then((function(){t.loading.importing=!1,t.hideImportModal(),t.reloadShots()})).catch((function(){t.loading.importing=!1,t.errors.importing=!0}))},updateUrl:function(){var t=!1,e={};if(this.isAssetCasting){var s=this.$route.params.asset_type_id;s!==this.assetTypeId&&(t=!0,e={name:"breakdown-asset-type",params:{production_id:this.currentProduction.id,asset_type_id:this.assetTypeId}})}else{var i=this.$route.params.sequence_id;i!==this.sequenceId&&(t=!0,e={name:"breakdown-sequence",params:{production_id:this.currentProduction.id,sequence_id:this.sequenceId}})}t&&(this.currentEpisode&&(e.name="episode-".concat(e.name),e.params.episode_id=this.currentEpisode.id),this.$router.push(e))}}),watch:{$route:function(){},castingType:function(){if(this.isShotCasting&&this.sequences.length>0&&(this.sequenceId=this.sequences[0].id),this.isAssetCasting&&this.castingAssetTypesOptions.length>0){var t=this.$route.params.asset_type_id;this.castingType="asset",t?this.assetTypeId=t:this.castingAssetTypesOptions.length>0&&(this.assetTypeId=this.castingAssetTypesOptions[0].value)}},sequenceId:function(){this.sequences&&this.sequences.length>0&&(this.setCastingSequence(this.sequenceId),this.updateUrl(),this.resetSelection())},assetTypeId:function(){this.castingAssetTypesOptions&&(this.setCastingAssetType(this.assetTypeId),this.updateUrl(),this.resetSelection())},episodeId:function(){},castingSequenceOptions:function(){if(this.$route.path.indexOf("asset-type")<0){var t=this.$route.params.sequence_id;t&&this.sequenceMap[t]?this.sequenceId=t:this.castingSequenceOptions.length>0?this.sequenceId=this.castingSequenceOptions[0].value:this.sequenceId=""}},castingAssetTypesOptions:function(){if(this.$route.path.indexOf("asset-type")>0){var t=this.$route.params.asset_type_id;this.castingType="asset",t?this.assetTypeId=t:this.castingAssetTypesOptions.length>0?this.assetTypeId=this.castingAssetTypesOptions[0].value:this.assetTypeId=""}},currentProduction:function(){this.reset()},currentEpisode:function(){this.currentEpisode&&this.episodeId!==this.currentEpisode.id&&!this.isLoading&&this.reset()},sequences:function(){this.$store.commit("CASTING_SET_SEQUENCES",this.sequences)}},metaInfo:function(){return{title:"".concat(this.currentProduction.name," ").concat(this.$t("breakdown.title")," - Kitsu")}}},H=R,J=(s("4537"),Object(p["a"])(H,i,n,!1,null,"8c2935cc",null));e["default"]=J.exports}}]);
//# sourceMappingURL=chunk-5a4b5a16.5be9c806.js.map