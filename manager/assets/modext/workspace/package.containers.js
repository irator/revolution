/**
 * The packages list main container
 * 
 * @class MODx.panel.Packages
 * @extends MODx.Panel
 * @param {Object} config An object of options.
 * @xtype modx-panel-packages
 */
MODx.panel.Packages = function(config) {
    config = config || {};
	
	Ext.applyIf(config,{					
		layout:'card'
		,defaults:{ border: false }
		,border:false
		,layoutConfig:{ deferredRender:true }
		,defaults:{
			autoHeight: true
		}
		,activeItem: 0
		,items:[{
			xtype:'modx-package-grid'
			,id:'modx-package-grid'	
			,bodyCssClass: 'grid-with-buttons'	
		},{
			xtype: 'modx-package-beforeinstall'
			,id:'modx-package-beforeinstall'	
		},{
			xtype: 'modx-package-details'
			,id:'modx-package-details'
			,bodyCssClass: 'modx-template-detail'			
		}]	
		,buttons: [{
			text: 'Cancel'
			,id:'package-list-reset'
			,iconCls:'icon-back'
			,hidden: true
			,handler: function(btn, e){
				Ext.getCmp('modx-panel-packages').activate();
			}
			,scope: this
		},{
			text: 'Continue'
			,id:'package-install-btn'
			,iconCls:'icon-install'
			,hidden: true
			,handler: this.install
			,scope: this
		},{
			text: 'Setup options'
			,id:'package-show-setupoptions-btn'
			,iconCls:'icon-install'
			,hidden: true
			,handler: this.onSetupOptions
			,scope: this
		}]
	});
	MODx.panel.Packages.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.Packages,MODx.Panel,{
	activate: function(){
		Ext.getCmp('modx-layout').showLeftbar();
		Ext.getCmp('card-container').getLayout().setActiveItem(this.id);
		Ext.getCmp('modx-package-grid').activate();
		Ext.each(this.buttons, function(btn){ Ext.getCmp(btn.id).hide(); });		
	}
	
	,loadConsole: function(btn,topic) {
    	if (this.console === null || this.console == undefined) {
            this.console = MODx.load({
               xtype: 'modx-console'
               ,register: 'mgr'
               ,topic: topic
            });
        } else {
            this.console.setRegister('mgr',topic);
        }
        this.console.show(btn);
    }
	
	,install: function(va){
		record = Ext.getCmp('modx-package-grid').getSelectionModel().getSelected();
		r = record.data;		
		var topic = '/workspace/package/install/'+r.signature+'/';
        this.loadConsole(Ext.getBody(),topic);
		
		va = va || {};		
        Ext.apply(va,{
            action: 'install'
            ,signature: r.signature
            ,register: 'mgr'
            ,topic: topic
        });
		
		var c = this.console;        
        MODx.Ajax.request({
            url: MODx.config.connectors_url+'workspace/packages.php'
            ,params: va
            ,listeners: {
                'success': {fn:function() {
                    this.activate();
					Ext.getCmp('modx-package-grid').getStore().load();
					setTimeout(function(){ c.hide(); }, 5000);
                },scope:this}
                ,'failure': {fn:function() {
                    this.activate();
                },scope:this}
            }
        });
	}
	
	,onSetupOptions: function(btn){
		if(this.win == undefined){
			this.win = new MODx.window.SetupOptions({
				id: 'modx-window-setupoptions'
			});
		}
		this.win.show(btn.id);
		var opts = Ext.getCmp('modx-package-beforeinstall').getOptions();
		this.win.fetch(opts);
	}
});
Ext.reg('modx-panel-packages',MODx.panel.Packages);

/**
 * The package browser container
 * 
 * @class MODx.panel.PackagesBrowser
 * @extends MODx.Panel
 * @param {Object} config An object of options.
 * @xtype modx-panel-packages-browser
 */
MODx.panel.PackagesBrowser = function(config) {
    config = config || {};
	
	Ext.applyIf(config,{
		layout: 'column'
		,border: false
		,items:[{
			xtype: 'modx-package-browser-tree'
			,id: 'modx-package-browser-tree'
			,width: 250
		},{			
			layout:'card'
			,columnWidth: 1
			,defaults:{ border: false }
			,border:false
			,id:'package-browser-card-container'
			,layoutConfig:{ deferredRender:true }
			,items:[{
				xtype:'modx-package-browser-home'
				,id:'modx-package-browser-home'	
			},{
				xtype: 'modx-package-browser-repositories'
				,id: 'modx-package-browser-repositories'
			},{
				xtype:'modx-package-browser-grid'
				,id:'modx-package-browser-grid'
				,bodyCssClass: 'grid-with-buttons'				
			},{
				xtype: 'modx-package-browser-details'
				,id: 'modx-package-browser-details'
				,bodyCssClass: 'modx-template-detail'
			},{
				xtype: 'modx-package-browser-view'
				,id: 'modx-package-browser-view'
				,bodyCssClass: 'modx-template-detail'
			}]	
		}]
	});
	MODx.panel.PackagesBrowser.superclass.constructor.call(this,config);
};
Ext.extend(MODx.panel.PackagesBrowser,MODx.Panel,{
	activate: function(){
		Ext.getCmp('modx-layout').hideLeftbar();
		Ext.getCmp('card-container').getLayout().setActiveItem(this.id);
		Ext.getCmp('modx-package-browser-home').activate();
		/* @TODO : lexiconify */
		this.updateBreadcrumbs('Select a category from the left to view the packages available in this provider for your version of MODx');
	}
	
	,updateBreadcrumbs: function(msg, highlight){
		var bd = { text: msg };
        if(highlight){ bd.className = 'highlight'; }
		
		bd.trail = [{ text : _('package_browser') }];
		Ext.getCmp('packages-breadcrumbs').updateDetail(bd);
	}
	
	,showWait: function(){
		if(typeof(this.wait) == "undefined"){
			this.wait = new MODx.PackageBrowserWaitWindow();
		}
		this.wait.show();
	}
	
	,hideWait: function(){
		this.wait.hide();
	}
});
Ext.reg('modx-panel-packages-browser',MODx.panel.PackagesBrowser);