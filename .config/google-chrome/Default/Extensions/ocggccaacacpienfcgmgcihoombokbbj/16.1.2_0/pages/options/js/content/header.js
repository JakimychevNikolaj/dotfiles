/**
 * Application options header
 */

    /**
     * Display active options tab
     *
     * @param tabId
     */
    function displayActiveOptionsTab(tabId) {
        var $tab = $(".settings-tab-button[data-settings-tabid=" + tabId + "]");
        if($tab) {
            $(".settings-tab-button").removeClass("active");
            var $content = $(".settings-tabs[data-settings-content-tabid=" + tabId + "]");
            if($content)
                $content.show(0);
        }
    }

    /**
     * Display top share buttons
     */
    function displayTopShareButtons() {
        if(getShareAppStatus()) {
            var $shareTopContainer = $("#share42init-top");
            if(!$("#shareTopContainer").is(":visible"))
                $shareTopContainer.show();
        }
    }

    /**
     * Set back to new tab page link url
     */
    function displayBackToNewtabPageLink() {
        $("#back-to-newtab-link").show();
        $(document).on("click", "#back-to-newtab-link", function(e) {
            e.preventDefault();
            openUrlInCurrentTab(extensionGetUrl("/pages/newtab/newtab.html"));
        });
    }

    /**
     * Add help link button handler
     */
    function addHelpLinkClickButtonHandler() {
        //chrome.i18n.getAcceptLanguages(function(languages){
        BRW_getAcceptLanguages(function(languages){
            
            var url = languages.indexOf("ru") != -1 ? optionsHelpUrlRu : optionsHelpUrlEn;
            $("#help-link").attr("href", url);
            $(document).on("click", "#help-link", function(e) {
                e.preventDefault();
                openUrlInNewTab(url);
            });
        });
    }