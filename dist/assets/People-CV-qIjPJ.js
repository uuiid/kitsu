import{l as p,q as h,m as l,a as n,n as d,z as m,B as f,H as u,G as v,I as g,V as _,W as w,J as C,K as P,a2 as b,v as o}from"./index-BcL-PEpH.js";import{B as x}from"./ButtonHrefLink-CUG6hrIL.js";import{E,a as I,P as $}from"./PeopleList-i2LKx-tv.js";import"./DepartmentNamesCell-DDkvWjD9.js";import"./PeopleNameCell-59xjcpWb.js";const A={name:"change-password-modal",mixins:[p],props:{active:{type:Boolean,default:!1},person:{type:Object,default:()=>{}}},data(){return{form:{password:"",password2:""},isLoading:!1,isError:!1,isErrorDisableTwoFactorAuthentication:!1,isValid:!0}},components:{TextField:h},computed:{...l([])},methods:{...n(["changePasswordPerson","disableTwoFactorAuthenticationPerson"]),confirmClicked(){this.isErrorDisableTwoFactorAuthentication=!1,this.isError=!1,this.isLoading=!0,this.changePasswordPerson({person:this.person,form:this.form}).then(()=>{this.$emit("confirm")}).catch(t=>{t.isValidPassword===!1?this.isValid=!1:this.isError=!0}).finally(()=>{this.isLoading=!1})},disableTwoFactorAuthenticationClicked(){this.isErrorDisableTwoFactorAuthentication=!1,this.isError=!1,this.isLoading=!0,this.disableTwoFactorAuthenticationPerson(this.person).catch(()=>{this.isErrorDisableTwoFactorAuthentication=!0}).finally(()=>{this.isLoading=!1})},resetForm(){this.person&&(this.form={password:"",password2:""},this.isLoading=!1,this.isError=!1,this.isErrorDisableTwoFactorAuthentication=!1,this.isValid=!0)}},watch:{person(){this.resetForm()},active(){this.active&&(this.resetForm(),setTimeout(()=>{this.$refs["first-password"].focus()},100))}}};var y=function(){var e=this,s=e._self._c;return s("div",{class:{modal:!0,"is-active":e.active}},[s("div",{staticClass:"modal-background",on:{click:function(r){return e.$emit("cancel")}}}),s("div",{staticClass:"modal-content"},[s("div",{staticClass:"box"},[s("h1",{staticClass:"title"},[e._v(" "+e._s(e.$t("people.change_password_for"))+" "+e._s(e.person.name)+" ")]),s("form",{on:{submit:function(r){r.preventDefault()}}},[s("text-field",{ref:"first-password",attrs:{disabled:e.person.is_generated_from_ldap,label:e.$t("people.fields.password"),type:"password"},on:{enter:function(r){return e.confirmClicked()}},model:{value:e.form.password,callback:function(r){e.$set(e.form,"password",r)},expression:"form.password"}}),s("text-field",{attrs:{disabled:e.person.is_generated_from_ldap,label:e.$t("people.fields.password_2"),type:"password"},on:{enter:function(r){return e.confirmClicked()}},model:{value:e.form.password2,callback:function(r){e.$set(e.form,"password2",r)},expression:"form.password2"}})],1),s("div",{staticClass:"flexrow"},[s("button",{class:{button:!0,"is-primary":!0,"flexrow-item":!0,"is-loading":e.isLoading},attrs:{disabled:e.person.is_generated_from_ldap},on:{click:e.confirmClicked}},[e._v(" "+e._s(e.$t("profile.change_password.button"))+" ")]),s("button",{class:{button:!0,"flexrow-item":!0,"is-loading":e.isLoading,"is-warning":!0},attrs:{disabled:!(e.person.totp_enabled||e.person.email_otp_enabled)},on:{click:e.disableTwoFactorAuthenticationClicked}},[e._v(" "+e._s(e.$t("people.disable_2FA"))+" ")]),s("div",{staticClass:"filler"}),s("button",{staticClass:"button is-link flexrow-item",on:{click:function(r){return e.$emit("cancel")}}},[e._v(" "+e._s(e.$t("main.cancel"))+" ")])]),e.isValid?e._e():s("div",{staticClass:"error has-text-right mt1"},[e._v(" "+e._s(e.$t("profile.change_password.unvalid"))+" ")]),e.isError?s("div",{staticClass:"error has-text-right mt1"},[e._v(" "+e._s(e.$t("people.change_password_error"))+" ")]):e._e(),e.isErrorDisableTwoFactorAuthentication?s("div",{staticClass:"error has-text-right mt1"},[e._v(" "+e._s(e.$t("people.disable_2FA_error"))+" ")]):e._e()])])])},D=[],T=d(A,y,D,!1,null,"ab00d0de",null,null);const S=T.exports,L={name:"people",mixins:[m],components:{ButtonHrefLink:x,ButtonSimple:f,ChangePasswordModal:S,ComboboxStyled:u,ComboboxDepartment:v,EditAvatarModal:E,EditPersonModal:I,HardDeleteModal:g,ImportModal:_,ImportRenderModal:w,PageTitle:C,PeopleList:$,SearchField:P,SearchQueryList:b},data(){return{csvColumns:["First Name","Last Name"],optionalCsvColumns:["Phone","Role","Contract Type","Active"],dataMatchers:["Email"],role:"all",roleOptions:[{label:"all",value:"all"},{label:"admin",value:"admin"},{label:"client",value:"client"},{label:"manager",value:"manager"},{label:"supervisor",value:"supervisor"},{label:"user",value:"user"},{label:"vendor",value:"vendor"}],errors:{avatar:!1,del:!1,edit:!1,invite:!1,userLimit:!1},loading:{createAndInvite:!1,del:!1,deletingAvatar:!1,edit:!1,invite:!1,savingSearch:!1,updatingAvatar:!1},modals:{avatar:!1,changePassword:!1,del:!1,edit:!1,importModal:!1,isImportRenderDisplayed:!1},parsedCSV:[],personToDelete:{},personToEdit:{role:"user"},personToChangePassword:{},selectedDepartment:"",success:{invite:!1}}},mounted(){this.role=this.$route.query.role||"all",this.selectedDepartment=this.$route.query.department||"",this.loadPeople(()=>{this.setSearchFromUrl(),this.onSearchChange()})},watch:{"modals.edit"(){this.modals.edit&&(this.loading.createAndInvite=!1,this.errors.edit=!1,this.errors.invite=!1,this.errors.userLimit=!1,this.loading.edit=!1,this.loading.invite=!1,this.success.invite=!1)},selectedDepartment(){this.updateRoute()},role(){this.updateRoute()}},computed:{...l(["displayedPeople","isCurrentUserAdmin","isPeopleLoading","isPeopleLoadingError","isImportPeopleModalShown","isImportPeopleLoading","isImportPeopleLoadingError","peopleSearchQueries","personCsvFormData"]),currentPeople(){let t=this.displayedPeople.filter(e=>!e.is_bot);return this.role!=="all"&&(t=t.filter(e=>e.role===this.role)),this.selectedDepartment&&(t=t.filter(e=>e.departments.includes(this.selectedDepartment))),t},deleteText(){var e;const t=(e=this.personToDelete)==null?void 0:e.full_name;return t?this.$t("people.delete_text",{personName:t}):""},filteredPeople(){const t={};return this.displayedPeople.forEach(e=>{const s=e.email;t[s]=!0}),t},searchField(){return this.$refs["people-search-field"]}},methods:{...n(["clearPersonAvatar","deletePeople","editPerson","invitePerson","loadDepartments","loadPeople","newPerson","newPersonAndInvite","removePeopleSearch","savePeopleSearch","setPeopleSearch","uploadPersonAvatar","uploadPersonFile","updatePersonToEdit"]),renderImport(t,e){this.loading.importing=!0,this.errors.importing=!1,this.formData=t,e==="file"&&(t=t.get("file")),o.processCSV(t).then(s=>{this.parsedCSV=s,this.hideImportModal(),this.loading.importing=!1,this.showImportRenderModal()})},uploadImportFile(t,e){const s=new FormData,r="import.csv",a=o.turnEntriesToCsvString(t),i=new File([a],r,{type:"text/csv"});s.append("file",i),this.loading.importing=!0,this.errors.importing=!1,this.$store.commit("PERSON_CSV_FILE_SELECTED",s),this.uploadPersonFile(e).then(()=>{this.$store.dispatch("loadPeople"),this.hideImportRenderModal()}).catch(c=>{console.error(c),this.loading.importing=!1,this.errors.importing=!0})},resetImport(){this.errors.importing=!1,this.hideImportRenderModal(),this.$store.commit("PERSON_CSV_FILE_SELECTED",null),this.$refs["import-modal"].reset(),this.showImportModal()},async deleteAvatar(){this.loading.deletingAvatar=!0;try{await this.clearPersonAvatar(this.personToEdit),this.modals.avatar=!1}catch{this.errors.avatar=!0}this.loading.deletingAvatar=!1},async updateAvatar(t){this.loading.updatingAvatar=!0;try{await this.uploadPersonAvatar({person:this.personToEdit,formData:t}),this.modals.avatar=!1}catch{this.errors.avatar=!0}this.loading.updatingAvatar=!1},confirmEditPeople(t){let e="editPerson";this.personToEdit.id===void 0?e="newPerson":t.id=this.personToEdit.id,this.loading.edit=!0,this.errors.edit=!1,this.errors.userLimit=!1,this[e](t).then(()=>{this.loading.edit=!1,this.modals.edit=!1}).catch(s=>{var i;const r=(i=s.body)==null?void 0:i.message;typeof r=="string"&&r.includes("limit")?this.errors.userLimit=!0:this.errors.edit=!0,this.loading.edit=!1})},confirmCreateAndInvite(t){this.loading.createAndInvite=!0,this.errors.edit=!1,this.errors.userLimit=!1,this.newPersonAndInvite(t).then(()=>{this.loading.createAndInvite=!1,this.modals.edit=!1}).catch(e=>{e.body&&e.body.message&&e.body.message.indexOf("limit")>0?this.errors.userLimit=!0:this.errors.edit=!0,this.errors.edit=!0,this.loading.createAndInvite=!1}),this.onSearchChange()},confirmInvite(t){t.id=this.personToEdit.id,this.loading.invite=!0,this.errors.invite=!1,this.invitePerson(t).then(()=>{this.loading.invite=!1,this.success.invite=!0}).catch(e=>{console.error(e),this.loading.invite=!1,this.success.invite=!1,this.errors.invite=!0}),this.onSearchChange()},confirmDeletePeople(){this.loading.del=!0,this.errors.del=!1,this.deletePeople(this.personToDelete).then(()=>{this.loading.del=!1,this.modals.del=!1}).catch(t=>{console.error(t),this.loading.del=!1,this.errors.del=!0})},onSearchChange(){if(!this.searchField)return;const t=this.searchField.getValue();t.length!==1&&(this.setPeopleSearch(t),this.updateRoute())},onAvatarClicked(t){this.personToEdit=t,this.errors.avatar=!1,this.modals.avatar=!0},onDeleteClicked(t){this.personToDelete=t,this.modals.del=!0},onEditClicked(t){this.errors.invite=!1,this.success.invite=!1,this.personToEdit=t,this.modals.edit=!0},onChangePasswordClicked(t){this.personToChangePassword=t,this.modals.changePassword=!0},onNewClicked(){this.errors.invite=!1,this.success.invite=!1,this.personToEdit={role:"user"},this.modals.edit=!0},showImportModal(){this.modals.importModal=!0},hideImportModal(){this.modals.importModal=!1},showImportRenderModal(){this.modals.isImportRenderDisplayed=!0},hideImportRenderModal(){this.modals.isImportRenderDisplayed=!1},saveSearchQuery(t){this.loading.savingSearch||(this.loading.savingSearch=!0,this.savePeopleSearch(t).catch(console.error).finally(()=>{this.loading.savingSearch=!1}))},removeSearchQuery(t){this.removePeopleSearch(t).catch(console.error)},updateRoute(){const t=this.searchField.getValue(),e=this.selectedDepartment,s=this.role;this.$router.push({query:{search:t,department:e,role:s}})}},metaInfo(){return{title:`${this.$t("people.title")} - Kitsu`}}};var k=function(){var e=this,s=e._self._c;return s("div",{staticClass:"people page fixed-page"},[s("div",{staticClass:"flexrow page-header"},[s("page-title",{staticClass:"flexrow-item filler",attrs:{text:e.$t("people.title")}}),e.isCurrentUserAdmin?s("button-simple",{staticClass:"flexrow-item",attrs:{title:e.$t("main.csv.import_file"),"is-responsive":!0,icon:"import"},on:{click:e.showImportModal}}):e._e(),s("button-href-link",{staticClass:"flexrow-item",attrs:{title:e.$t("main.csv.export_file"),icon:"export",path:"/api/export/csv/persons.csv"}}),e.isCurrentUserAdmin?s("button-simple",{staticClass:"flexrow-item",attrs:{text:e.$t("people.new_person"),"is-responsive":!0,icon:"plus"},on:{click:e.onNewClicked}}):e._e()],1),s("div",{staticClass:"flexrow search-options"},[s("search-field",{ref:"people-search-field",staticClass:"search flexrow-item",attrs:{"can-save":!0,placeholder:"ex: John Doe"},on:{change:e.onSearchChange,save:e.saveSearchQuery}}),s("combobox-department",{staticClass:"combobox-department flexrow-item",attrs:{label:e.$t("main.department")},model:{value:e.selectedDepartment,callback:function(r){e.selectedDepartment=r},expression:"selectedDepartment"}}),s("combobox-styled",{staticClass:"flexrow-item",attrs:{label:e.$t("people.fields.role"),options:e.roleOptions,"locale-key-prefix":"people.role.","no-margin":""},model:{value:e.role,callback:function(r){e.role=r},expression:"role"}})],1),s("div",{staticClass:"query-list"},[e.isPeopleLoading?e._e():s("search-query-list",{attrs:{queries:e.peopleSearchQueries,type:"people"},on:{"change-search":e.changeSearch,"remove-search":e.removeSearchQuery}})],1),s("people-list",{attrs:{entries:e.currentPeople,"is-loading":e.isPeopleLoading,"is-error":e.isPeopleLoadingError},on:{"avatar-clicked":e.onAvatarClicked,"delete-clicked":e.onDeleteClicked,"edit-clicked":e.onEditClicked,"change-password-clicked":e.onChangePasswordClicked}}),s("import-render-modal",{attrs:{active:e.modals.isImportRenderDisplayed,"is-loading":e.isImportPeopleLoading,"is-error":e.isImportPeopleLoadingError,"parsed-csv":e.parsedCSV,"form-data":e.personCsvFormData,columns:[...e.dataMatchers,...e.csvColumns,...e.optionalCsvColumns],dataMatchers:e.dataMatchers,database:e.filteredPeople},on:{reupload:e.resetImport,cancel:e.hideImportRenderModal,confirm:e.uploadImportFile}}),s("import-modal",{ref:"import-modal",attrs:{active:e.modals.importModal,"is-loading":e.isImportPeopleLoading,"is-error":e.isImportPeopleLoadingError,"form-data":e.personCsvFormData,columns:[...e.dataMatchers,...e.csvColumns],"optional-columns":e.optionalCsvColumns},on:{cancel:e.hideImportModal,confirm:e.renderImport}}),s("edit-avatar-modal",{attrs:{active:e.modals.avatar,"error-text":e.$t("people.edit_avatar_error"),"is-deleting":e.loading.deletingAvatar,"is-error":e.errors.avatar,"is-updating":e.loading.updatingAvatar,person:e.personToEdit},on:{close:function(r){e.modals.avatar=!1},delete:e.deleteAvatar,update:e.updateAvatar}}),s("edit-person-modal",{attrs:{active:e.modals.edit,"is-create-invite-loading":e.loading.createAndInvite,"is-error":e.errors.edit,"is-invite-loading":e.loading.invite,"is-invitation-success":e.success.invite,"is-invitation-error":e.errors.invite,"is-loading":e.loading.edit,"is-user-limit-error":e.errors.userLimit,"person-to-edit":e.personToEdit},on:{cancel:function(r){e.modals.edit=!1},confirm:e.confirmEditPeople,"confirm-invite":e.confirmCreateAndInvite,invite:e.confirmInvite}}),s("change-password-modal",{attrs:{active:e.modals.changePassword,person:e.personToChangePassword},on:{cancel:function(r){e.modals.changePassword=!1},confirm:function(r){e.modals.changePassword=!1}}}),s("hard-delete-modal",{attrs:{active:e.modals.del,"error-text":e.$t("people.delete_error"),"is-loading":e.loading.del,"is-error":e.errors.del,"lock-text":e.personToDelete?e.personToDelete.full_name:"",text:e.deleteText},on:{cancel:function(r){e.modals.del=!1},confirm:e.confirmDeletePeople}})],1)},F=[],M=d(L,k,F,!1,null,"72b20354",null,null);const N=M.exports;export{N as default};
//# sourceMappingURL=People-CV-qIjPJ.js.map