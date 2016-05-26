/**
 * Application theme controller
 */
    var xhrBgImage = null;
    var xhrBgVideo = null;

    /**
     * Get theme local fs path
     *
     * @param fileName String
     * @param themeId String
     * @returns {string}
     */
    function getThemeFileSystemPath(fileName, themeId) {
        
        themeId = themeId || getLastInstalledThemeId();
        return getThemesFileSystemPath(themeId) + "/" + fileName;
    }

    /**
     * Get background image file
     *
     * @returns String
     */
    function getBackgroundImageFile() {
        
        var backgroundFile = localStorage.getItem("background-image-file");
        return backgroundFile ? getThemesFileSystemDir() + "/" + backgroundFile : "";
    }

    /**
     * Get background image file resolution
     *
     * @returns String
     */
    function getBackgroundImageFileResolution() {
        
        var backgroundFile = localStorage.getItem("background-image-resolution");
        return backgroundFile ? backgroundFile : "";
    }

    /**
     * Get background video file
     *
     * @returns String
     */
    var lastConsoleBackgroundVideoFile = false;
    function getBackgroundVideoFile() {
        var backgroundFile = localStorage.getItem("background-video-file");
        var answer = backgroundFile ? getThemesFileSystemDir() + "/" + backgroundFile : "";
        
        if(lastConsoleBackgroundVideoFile != answer){//Console Log
            //console.log ("BACKEND/theme.js (OK) - getBackgroundVideoFile: "+answer);
            lastConsoleBackgroundVideoFile = answer;
        }
        
        return answer;
    }

    /**
     * Get background file
     *
     * @param themeId String
     * @param fileName String
     * @returns {string}
     */
    function getBackgroundFile(themeId, fileName) {
        
        return themeId && fileName ? getThemesFileSystemDir() + "/" + themeId + "/" + fileName : "";
    }

    /**
     * Get background video file resolution
     *
     * @returns String
     */
    function getBackgroundVideoFileResolution() {
        
        var backgroundFile = localStorage.getItem("background-video-resolution");
        return backgroundFile ? backgroundFile : "";
    }

    /**
     * Send remove favorite mark message
     *
     * @param data Object
     */
    function sendRemoveFavoriteMarkMessage(data) {
        
        getOptionsTabPages(function(data) {
            var i, justCurrentTab=false;
            
            if(data.tabs){
                var tabs = data.tabs;
                var tabsCount = tabs.length
            }else justCurrentTab=true; //Firefox only
            
            data.command = "removeOptionsContentFavoriteMark";
            
            if(justCurrentTab) BRW_sendMessage(data); //Firefox only
            else{//For Chrome
                for(i = 0; i < tabsCount; i++) { 
                    chrome.tabs.sendMessage(tabs[i].id, data);
                }
            }
        }, data);
    }

    /**
     * Get current theme Id
     *
     * @param callback Function
     * @param data Object
     * @returns {*}
     */

    //m START
    /*Moved to browser choiser*/
    function currentThemeId(callback, data){
         BRW_currentThemeId(callback, data);
    }

    /**
     * Get installed themes data
     *
     * @param themeId String
     * @param data Object
     */
    function getInstalledThemesData(themeId, data) {
        
        data = getInstalledThemesResponse(themeId, data);

        if(typeof (data.getCurrentThumb) == "undefined") {
            if(getArrayLength(data.images))
                getThumbImageElementsUrl(data);
            else
                data.sendResponse(data.response);
        } else {
            if(!data.getCurrentThumb)
                data.sendResponse(data.response);
            else
                data.sendResponse({});
        }
    }

    /**
     * Get instaleld themes list
     *
     * @param themeId String
     * @param data Object
     * @returns {Object}
     */
    function getInstalledThemesResponse(themeId, data) {
        
        data.themes = getInstalledThemes();
        data.currentThemeId = themeId;
        data.images = {};

        var installedThemes = {};
        for(var i in data.themes) {
            var theme = data.themes[i];
            if(getArrayLength(theme.bgFilePath) || getArrayLength(theme.bgVideoPath)) {
                if(typeof (data.getCurrentTheme) != "undefined" && data.getCurrentTheme) {
                    installedThemes[theme.id] = theme;
                } else {
                    if(data.currentThemeId != theme.id)
                        installedThemes[theme.id] = theme;
                }
            }
        }

        data.response = {
            "installedThemes" : installedThemes,
            "currentThemeId" : data.currentThemeId,
            "currentImage" : getBackgroundImageFile(),
            "currentImageResolution" : getBackgroundImageFileResolution(),
            "currentVideo" : getBackgroundVideoFile(),
            "currentVideoResolution" : getBackgroundVideoFileResolution(),
            "videoContentAvailableResolutions" : ["640", "1024", "1920"],
            "flixelContentAvailableResolutions" : ["1280", "1920"]
        };
        return data;
    }

    /**
     * Get thumb image elements url
     *
     * @param data Object
     */
    function getThumbImageElementsUrl(data) {
        
        if(getArrayLength(data.images)) {
            data.loopThemeId = getArrayFirstKey(data.images);
            data.loopFilePath = data.images[data.loopThemeId];
            delete data.images[data.loopThemeId];
            getFileSystem(function(fs, data) {
                fs.root.getFile(data.loopFilePath, {}, function(fileEntry) {
                    data.response.installedThemes[data.loopThemeId]["thumbImage"] = fileEntry.toURL();
                    getThumbImageElementsUrl(data);
                }, function() { // background image not found on local fs and remove theme from installed themes list
                    delete data.response.installedThemes[data.loopThemeId];
                    getThumbImageElementsUrl(data);
                });
            }, data);
        } else
            data.sendResponse(data.response);
    }

    /**
     * Check display video theme offer
     *
     * @param themeId Int
     * @param data Object
     */
    function checkDisplayVideoThemeOffer(themeId, data) {
        
        var lastHideVideoThemeOffer = getHideVideoThemeOfferThemeId();

        data.display = false;
        data.currentDownloadImage = getDownloadImageThemeStatus();
        data.currentDownloadVideo = getDownloadVideoThemeStatus();

        if(themeId == lastHideVideoThemeOffer && !data.currentDownloadVideo)
            data.sendResponse(data);
        else
            loadThemeConfig(themeId, loadVideoThemeConfig, data);
    }

    /**
     * Check display video theme offer
     *
     * @param themeId Int
     * @param data Object
     */
    function getCurrentThemeInfo(themeId, data) {
        
        loadThemeConfig(themeId, getThemeConfig, data);
    }

    /**
     * Start download video theme
     * calculate video theme quality
     *
     * @param themeConfig Object
     */
    function startDownloadVideoTheme(themeConfig) {
        
        if(typeof(themeConfig.bgVideoPath) != "undefined") {
            var bg = getThemeBgUrl(themeConfig, "video", defaultThemeLiveBackgroundResolution);
            if(bg.url) {
                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(tryGetBackgroundVideoFile, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id,
                    "bg": bg
                });
            }
        }
    }

    /**
     * Try get background video file
     *
     * @param fs FileSystem
     * @param data Object
     */
    function tryGetBackgroundVideoFile(fs, data) {
        
        data = data || {};

        if(typeof (data.pageCallback) == "undefined")
            data.pageCallback = getNetTabPages;

        if(xhrBgVideo) {
            xhrBgVideo.onload = null;
            xhrBgVideo.onprogress = null;
            xhrBgVideo.onerror = null;
            xhrBgVideo.abort();
            xhrBgVideo = null;
            clearDownloadingVideoData();
        }

        fs.root.getFile(data.filePath, {}, function(fileEntry) {
            //console.log("exist");
            data.url = fileEntry.toURL();
            tryGetBackgroundVideoFileSuccess(data);
        }, function() { // background video not found on local fs and try download
            //console.log("download");
            downloadThemeVideoFile(data.bg, data.theme, data.pageCallback);
        });
    }

    /**
     * Try get background video file success
     *
     * @param data Object
     */
    function tryGetBackgroundVideoFileSuccess(data) {
        
        var url = data.url;
        data = {
            "path": getThemesFileSystemPath(data.theme.id),
            "name": data.bg.fileName,
            "data": data,
            "theme": data.theme,
            "resolution": data.bg.resolution,
            "pageCallback": data.pageCallback,
            "download" : false
        };
        saveVideoThemeComplete(url, data);
    }

    /**
     * Start download resolution video theme
     *
     * @param themeConfig Object
     * @param data Object
     */
    function startDownloadResolutionVideoTheme(themeConfig, data) {
        
        data.theme = themeConfig;
        if(typeof(themeConfig.bgVideoPath) != "undefined") {
            var backgrounds = themeConfig.bgVideoPath;
            var resolutionExist = false;

            for(var w in backgrounds) {
                if(data.resolution == w) {
                    resolutionExist = true;
                    break;
                }
            }

            if(resolutionExist) {
                var resolution = data.resolution;
                var fileName = "v" + data.resolution + "bg.mp4";
                var url = getThemeContentUrl(themeConfig.id, fileName);
                var bg = {
                    "fileName" : fileName,
                    "resolution" : resolution,
                    "url" : url
                };

                if(xhrBgVideo) {
                    xhrBgVideo.onload = null;
                    xhrBgVideo.onprogress = null;
                    xhrBgVideo.onerror = null;
                    xhrBgVideo.abort();
                    xhrBgVideo = null;
                    clearDownloadingVideoData();
                }

                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(changeBackgroundVideoFileLoad, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id,
                    "bg": bg
                });
            }
        }
    }

    /**
     * Download video theme file
     *
     * @param bg Object
     * @param theme Object
     * @param pageCallback Function
     */
    function downloadThemeVideoFile(bg, theme, pageCallback) {//console.log("downloadThemeVideoFile");
        
        var url = bg.url;
        var resolution = bg.resolution;
        var fileName = bg.fileName;

        

        var optionsPageRestart = false;
        if(pageCallback && pageCallback == getNetTabPages)
            optionsPageRestart = true;

        pageCallback = pageCallback || getNetTabPages;

        xhrBgVideo = new XMLHttpRequest();
        xhrBgVideo.open('GET', BRW_urlTunnel(url), true);
        xhrBgVideo.responseType = 'arraybuffer';

        xhrBgVideo.onload = function () {
            if(xhrBgVideo.readyState == 4) {
                downloadVideoThemeStatus = false;
                if (this.status == 200) {
                    increaseThemeStatistic(liveBackgroundType, theme.id, bg.resolution);
                    var data = new Blob([new Uint8Array(this.response)]);
                    getFileSystem(saveFile, {
                        "path": getThemesFileSystemPath(theme.id),
                        "name": fileName,
                        "data": data,
                        "theme": theme,
                        "resolution": resolution,
                        "callback": saveVideoThemeComplete,
                        "pageCallback": pageCallback,
                        "optionsPageRestart": optionsPageRestart,
                        "download" : true
                    });
                } else {
                    var errorMessage = translate("page_error_live_bg_not_found");
                    var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
                    var currentResolution = getBackgroundVideoFileResolution();
                    var installedResolution = getInstalledFileResolution(currentThemeId);
                    var installedThemeId = getLastInstalledThemeId();
                    var installedThemeResolution = getInstalledFileResolution(installedThemeId);
                    pageCallback(sendThemeDownloadError, {
                        "messageCommand" : "videoThemeSendDownloadErrorToPage",
                        "errorMessage" : errorMessage,
                        "downloadingFile" : getDownloadingVideoData(),
                        "currentThemeId" : currentThemeId,
                        "currentResolution" : currentResolution,
                        "installedResolution" : installedResolution,
                        "installedThemeId" : installedThemeId,
                        "installedThemeResolution" : installedThemeResolution
                    });
                    console.log('Error: ' + errorMessage + ' by path', url);
                }
            }
        };

        xhrBgVideo.onprogress = function(e) {
            if (e.lengthComputable) {
                var percentComplete = Math.ceil(e.loaded / e.total * 100);
                if(percentComplete > 0 && percentComplete <= 100) {
                    downloadVideoThemeStatus = true;
                    pageCallback(sendThemeDownloadProgress, {
                        "messageCommand" : "videoThemeSendDownloadProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : getDownloadingVideoData()
                    });
                }
            }
        };

        xhrBgVideo.onerror = function () {
            downloadVideoThemeStatus = false;
            var errorMessage = translate("page_error_live_bg_load_problem");
            var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
            var currentResolution = getBackgroundVideoFileResolution();
            var installedResolution = getInstalledFileResolution(currentThemeId);
            var installedThemeId = getLastInstalledThemeId();
            var installedThemeResolution = getInstalledFileResolution(installedThemeId);
            pageCallback(sendThemeDownloadError, {
                "messageCommand" : "videoThemeSendDownloadErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : getDownloadingVideoData(),
                "currentThemeId" : currentThemeId,
                "currentResolution" : currentResolution,
                "installedResolution" : installedResolution,
                "installedThemeId" : installedThemeId,
                "installedThemeResolution" : installedThemeResolution
            });
            console.log('Error: ' + errorMessage + ' by path', url);
        };
        setDownloadingVideoData(theme.id, fileName, resolution, liveBackgroundType);
        xhrBgVideo.send();
    }

    /**
     * Send video theme download error to page
     *
     * @param data Object
     */
    function sendThemeDownloadError(data) {
        
        var i, justCurrentTab=false;

        if(data.tabs){
            var tabs = data.tabs;
            var tabsCount = tabs.length
        }else justCurrentTab=true; //Firefox only
        
        var response = {
            "command" : data.messageCommand,
            "errorMessage" : data.errorMessage,
            "downloadingFile" : data.downloadingFile,
            "currentThemeId" : data.currentThemeId
        };
        if(typeof(data.currentResolution))
            response.currentResolution = data.currentResolution;
        if(typeof(data.installedResolution))
            response.installedResolution = data.installedResolution;
        if(typeof(data.installedThemeId))
            response.installedThemeId = data.installedThemeId;
        if(typeof(data.installedThemeResolution))
            response.installedThemeResolution = data.installedThemeResolution;
        
        if(justCurrentTab) BRW_sendMessage(response); //Firefox only
            else{//For Chrome
            for(i = 0; i < tabsCount; i++) {
                if(typeof (data.errorMessage) != "undefined")
                    chrome.tabs.sendMessage(tabs[i].id, response);
            }
        }
    }

    /**
     * Send background image|video theme
     * download progress to page
     *
     * @param data Object
     */
    
    /*Moved to browserchoiser*/
    function sendThemeDownloadProgress(data) {
         BRW_sendThemeDownloadProgress(data);
    }

    /**
     * Save video theme complete
     *
     * @param url String
     * @param data Object
     */
    function saveVideoThemeComplete(url, data) {
        
        
        
        addThemeInstalledElement(data.theme, data.name, data.resolution, "bgVideoPath", liveBackgroundType);

        setHideVideoThemeOfferThemeId(data.theme.id);
        localStorage.removeItem("background-image-file");
        localStorage.removeItem("background-image-resolution");
        localStorage.setItem("background-video-file", data.theme.id + "/" + data.name);
        localStorage.setItem("background-video-resolution", data.resolution);
        localStorage.setItem("background-video-content-type", liveBackgroundType);

        data.video = url;

        if(data.pageCallback.name == "getOptionsThemesTabPages")
            getNetTabPages(themeSendBackgroundVideoToPage, data);
        else {
            if(data.optionsPageRestart)
                getOptionsThemesTabPages(reloadTabPages);
        }
        data.pageCallback(themeSendBackgroundVideoToPage, data);
    }

    /**
     * Send theme background video
     * to all new tab pages
     *
     * @param data Object
     */
    function themeSendBackgroundVideoToPage(data) {
        
        
        var i, justCurrentTab=false;

        if(data.tabs){
            var tabs = data.tabs;
            var tabsCount = tabs.length
        }else justCurrentTab=true; //Firefox only
        
        
        
        
        if(justCurrentTab){
            BRW_sendMessage({
                "command" : "themeSendBackgroundVideoToPage",
                "video" : data.video,
                "display" : getDisplayVideoTheme(),
                "enableParallax" : getDisplayParallaxVideoTheme(),
                "parallaxValue" : getBackgroundParallaxValue(),
                "isFlixelVideoContent" : isBackgroundVideoFlixelContent(),
                "flixelVideoContentAuthor" : getBackgroundVideoFlixelContentAuthor()
            }); //Firefox only
        }else{//For Chrome
            for(i = 0; i < tabsCount; i++) {
                if(typeof (data.video) != "undefined") {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        "command" : "themeSendBackgroundVideoToPage",
                        "video" : data.video,
                        "display" : getDisplayVideoTheme(),
                        "enableParallax" : getDisplayParallaxVideoTheme(),
                        "parallaxValue" : getBackgroundParallaxValue(),
                        "isFlixelVideoContent" : isBackgroundVideoFlixelContent(),
                        "flixelVideoContentAuthor" : getBackgroundVideoFlixelContentAuthor()
                    });
                }
            }
        }//else
    }

    /**
     * Load video theme config
     *
     * @param themeConfig Object
     * @param data Object
     */
    function loadVideoThemeConfig(themeConfig, data) {
        
        data.theme = themeConfig;

        var response = {
            "display" : false,
            "currentDownloadImage" : data.currentDownloadImage,
            "currentDownloadVideo" : data.currentDownloadVideo
        };

        if(typeof (data.theme.bgVideoPath) != "undefined") {
            var videos = data.theme.bgVideoPath;
            checkVideoThemeElementsExist(videos, data, response, checkVideoThemeConfigSuccess, checkVideoThemeConfigFail);
        } else
            data.sendResponse(response);
    }

    /**
     * Check video theme elements exist
     *
     * @param videos Object
     * @param data Object
     * @param response Object
     * @param successCallback Function
     * @param failCallback Function
     */
    function checkVideoThemeElementsExist(videos, data, response, successCallback, failCallback) {
        
        var defaultCallback = function() { data.sendResponse(response) };
        successCallback = successCallback || defaultCallback;
        failCallback = failCallback || defaultCallback;

        if(getArrayLength(videos)) {
            var prop = getArrayFirstKey(videos);
            if(prop) {
                delete videos[prop];
                var url = getVideoThemeContentUrl(data.theme.id, prop);
                $.ajax({
                    type: 'HEAD',
                    url: url,
                    success: function(){
                        successCallback(data, response);
                    },
                    error: function() {
                        checkVideoThemeElementsExist(videos, data, response, successCallback, failCallback);
                    }
                });
            } else {
                checkVideoThemeElementsExist(videos, data, response, successCallback, failCallback);
            }
        } else
            failCallback(data, response);
    }

    /**
     * Get video theme elements list
     *
     * @param videos Object
     * @param data Object
     * @param response Object
     * @param callback Function
     */
    function getVideoThemeElementsList(videos, data, response, callback) {
        
        if(getArrayLength(videos)) {
            var prop = getArrayFirstKey(videos);
            if(prop) {
                var value = videos[prop];
                delete videos[prop];
                var url = getVideoThemeContentUrl(data.theme.id, prop);
                $.ajax({
                    type: 'HEAD',
                    url: url,
                    success: function(){
                        response.videoList = response.videoList || {};
                        response.videoList[prop] = value;
                        getVideoThemeElementsList(videos, data, response, callback);
                    },
                    error: function() {
                        getVideoThemeElementsList(videos, data, response, callback);
                    }
                });
            } else {
                getVideoThemeElementsList(videos, data, response, callback);
            }
        } else
            callback(data, response);
    }

    /**
     * Check video theme config success
     *
     * @param data Object
     * @param response Object
     */
    function checkVideoThemeConfigSuccess(data, response) {
        
        response.display = getDisplayVideoTheme() ? true : false;
        response.theme = data.theme;
        data.sendResponse(response);
    }

    /**
     * Check video theme config fail
     *
     * @param data Object
     * @param response Object
     */
    function checkVideoThemeConfigFail(data, response) {
        
        data.sendResponse(response);
    }

    /**
     * Disable current image
     *
     * @return Bool
     */
    function disableCurrentImage() {
        
        localStorage.removeItem("background-image-file");
        localStorage.removeItem("background-image-resolution");
        getNetTabPages(reloadTabPages);
        return true;
    }

    /**
     * Disable current video
     *
     * @return Bool
     */
    function disableCurrentVideo() {
        
        localStorage.removeItem("background-video-file");
        localStorage.removeItem("background-video-resolution");
        getNetTabPages(function(data) {
            var i, justCurrentTab=false;

            if(data.tabs){
                var tabs = data.tabs;
                var tabsCount = tabs.length
            }else justCurrentTab=true; //Firefox only
            
            if(justCurrentTab){//Firefox only
                //BRW_sendMessage(response); //!!!Need for Reload
            }else{//For Chrome
                for(i = 0; i < tabsCount; i++)
                    chrome.tabs.reload(tabs[i].id);
            }
        }, {});
        return true;
    }

    /**
     * Load theme config
     *
     * @param themeId String
     * @param params Object
     * @param callback Function
     */
    function loadThemeConfig(themeId, callback, params) {
        
        if(themeId) {
            var url = getThemeConfigUrl(themeId);
            console.log("loadThemeConfig, url="+url);
                        
            BRW_ajax(url,
                function(data){//success
                    if(data && !parseInt(data.error)) {
                        data.body.thumbImage = getThemeContentThumbImage(data.body.id);
                        data.body.thumbVideo = getThemeContentThumbVideo(data.body.id);
                        callback(data.body, params);
                    }
                },
                function(error){//error
                    var errorMessage = translate("page_error_theme_config_not_found");
                    console.log('Error: ' + errorMessage + ' by path', url);
                }      
            );
        }
    }

    /**
     * Load flixer theme config
     *
     * @param themeId String
     * @param params Object
     * @param callback Function
     */
    function loadFlixerThemeConfig(themeId, callback, params) {
        
        
        var availableFlixerThemesData = localStorage.getItem("flixel-themes-data");
        var installedThemes = getInstalledThemes();
        
        var loadFlixelTehemeProblem = true;
        if(availableFlixerThemesData) {
            availableFlixerThemesData = JSON.parse(availableFlixerThemesData);
    
            if(typeof (availableFlixerThemesData['results']) != "undefined") {
                var availableFlixerThemes = availableFlixerThemesData['results'];
                var availableFlixerTheme = null;
                for(var i in availableFlixerThemes) {
                    var flixelTheme = availableFlixerThemes[i];
                    if(flixelTheme['id'] == themeId) {
                        availableFlixerTheme = flixelTheme;
                        availableFlixerTheme['thumbImage'] = availableFlixerTheme['bgFileThumb'];
                        availableFlixerTheme['thumbVideo'] = availableFlixerTheme['bgVideoThumb'];
                        if(typeof(installedThemes[themeId]) != "undefined") {
                            if(typeof(installedThemes[themeId]['lastInstallBgVideo']) != "undefined")
                                availableFlixerTheme['lastInstallBgVideo'] = installedThemes[themeId]['lastInstallBgVideo'];
                        }
                        break;
                    }
                }
                if(availableFlixerTheme) {
                    loadFlixelTehemeProblem = false;
                    callback(availableFlixerTheme, params);
                }
            }
        }


        if(loadFlixelTehemeProblem) {
            var favoriteThemesData = localStorage.getItem("favorite-themes-data");
            if(favoriteThemesData) {
                favoriteThemesData = JSON.parse(favoriteThemesData);
                if(typeof (favoriteThemesData) != "undefined") {
                    var favoriteFindTheme = null;
                    for(var i in favoriteThemesData) {
                        var favoriteTheme = favoriteThemesData[i];
                        if(favoriteTheme['id'] == themeId) {
                            favoriteFindTheme = favoriteTheme;
                            favoriteFindTheme['thumbImage'] = favoriteFindTheme['bgFileThumb'];
                            favoriteFindTheme['thumbVideo'] = favoriteFindTheme['bgVideoThumb'];
                            if(typeof(installedThemes[themeId]) != "undefined") {
                                if(typeof(installedThemes[themeId]['lastInstallBgVideo']) != "undefined")
                                    favoriteFindTheme['lastInstallBgVideo'] = installedThemes[themeId]['lastInstallBgVideo'];
                            }
                            break;
                        }
                    }
                    if(favoriteFindTheme) {
                        loadFlixelTehemeProblem = false;
                        callback(favoriteFindTheme, params);
                    }
                }
            }
        }

        if(loadFlixelTehemeProblem) {
            var errorMessage = translate("page_error_flixer_bg_not_found");
            var downloadingFile = getDownloadingVideoData();
            var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
            var currentResolution = getBackgroundVideoFileResolution();
            var installedResolution = getInstalledFileResolution(currentThemeId);
            var installedThemeId = getLastInstalledThemeId();
            var installedThemeResolution = getInstalledFileResolution(installedThemeId);
            getOptionsThemesTabPages(sendThemeDownloadError, {
                "messageCommand" : "changeBackgroundFlixerVideoFileErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : downloadingFile,
                "currentThemeId" : currentThemeId,
                "currentResolution" : currentResolution,
                "installedResolution" : installedResolution,
                "installedThemeId" : installedThemeId,
                "installedThemeResolution" : installedThemeResolution
            });
            console.log("load flixer theme problem", themeId);
        }
    }

    /**
     * Themes config load complete handler
     *
     * @param themeConfig Object
     */
    function themeConfigLoaded(themeConfig) {
        
        var bg = getThemeBgUrl(themeConfig);
        if(bg.url) {
            if(xhrBgImage) {
                xhrBgImage.onload = null;
                xhrBgImage.onprogress = null;
                xhrBgImage.onerror = null;
                xhrBgImage.abort();
                xhrBgImage = null;
                clearDownloadingImageData();
            }
            downloadThemeImageFile(bg, themeConfig, getNetTabPages);
        }
    }

    /**
     * Get themes config handler
     *
     * @param themeConfig Object
     * @param data Object
     */
    function getThemeConfig(themeConfig, data) {
        
        data.theme = themeConfig;

        var response = {};
        response.theme = themeConfig;
        response.videoList = {};
        response.fsThumbImage = "";
        response.videoResolution = localStorage.getItem("background-video-resolution");

        data.response = response;

        if(getArrayLength(themeConfig.bgFilePath)) {
            var filePath = null;
            var themes = getInstalledThemes();
            for(i in themes) {
                var theme = themes[i];
                if(getArrayLength(theme.bgFilePath))
                    if(themeConfig.id == theme.id)
                        filePath = getThemeFileSystemPath(theme.bgFilePath[getArrayFirstKey(theme.bgFilePath)], theme.id);
            }

            if(filePath) {
                data.loopFilePath = filePath;
                getFileSystem(function(fs, data) {
                    fs.root.getFile(data.loopFilePath, {}, function(fileEntry) {
                        data.response.fsThumbImage = fileEntry.toURL();
                        themeThumbImageLoaded(data);
                    }, function() { // background image not found on local fs and remove theme from installed themes list
                        themeThumbImageLoaded(data);
                    });
                }, data);
            } else
                themeThumbImageLoaded(data);
        }

    }

    /**
     * Get theme config success
     *
     * @param data Object
     */
    function themeThumbImageLoaded(data) {
        
        if(typeof (data.theme.bgVideoPath) != "undefined") {
            var videos = data.theme.bgVideoPath;
            getVideoThemeElementsList(videos, data, data.response, checkThumbImageExist);
        } else
            checkThumbImageExist(data, data.response);
    }

    /**
     * Check thumb image exist
     *
     * @param data Object
     * @param response Object
     */
    function checkThumbImageExist(data, response) {
        
        var url = getThemeContentThumbImage(response.theme.id);
        $.ajax({
            type: 'HEAD',
            url: url,
            success: function(){
                response.thumbImage = url;
                checkThumbVideoExist(data, response);
            },
            error: function() {
                response.thumbImage = null;
                checkThumbVideoExist(data, response);
            }
        });
    }

    /**
     * Check thumb video exist
     *
     * @param data Object
     * @param response Object
     */
    function checkThumbVideoExist(data, response) {
        
        var url = getThemeContentThumbVideo(data.theme.id);

        $.ajax({
            type: 'HEAD',
            url: url,
            success: function(){
                response.thumbVideo = url;
                if(data.sendResponse)
                    data.sendResponse(response);
            },
            error: function() {
                response.thumbVideo = null;
                if(data.sendResponse)
                    data.sendResponse(response);
            }
        });
    }

    /**
     * Change background image file
     *
     * @param fs FileSystem
     * @param data Object
     * @param defaultResponse Object
     */
    function changeBackgroundImageFile(fs, data, defaultResponse) {
        
        defaultResponse = defaultResponse || { image : "" };

        if(data.themeId) {
            loadThemeConfig(data.themeId, changeBackgroundImageFileStart);
        } else
            data.sendResponse(defaultResponse);
    }

    /**
     * Change background image file start
     * calculate video theme quality
     *
     * @param themeConfig Object
     */
    function changeBackgroundImageFileStart(themeConfig) {
        
        if(typeof(themeConfig.bgFilePath) != "undefined") {
            var bg = getThemeBgUrl(themeConfig);
            if(bg.url) {
                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(changeBackgroundImageFileLoad, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id,
                    "bg": bg,
                    "pageCallback": getOptionsThemesTabPages
                });
            }
        }
    }

    /**
     * Change background image file load
     *
     * @param fs FileSystem
     * @param data Object
     */
    function changeBackgroundImageFileLoad(fs, data) {
        
        data = data || {};

        if(typeof (data.pageCallback) == "undefined")
            data.pageCallback = getNetTabPages;

        if(xhrBgImage) {
            xhrBgImage.onload = null;
            xhrBgImage.onprogress = null;
            xhrBgImage.onerror = null;
            xhrBgImage.abort();
            xhrBgImage = null;
            clearDownloadingImageData();
        }
        
        BRW_fsGetFile(fs, data.filePath, 
            function(fileURL){//Success, file found
                data.url = fileURL;
                changeBackgroundImageFileLoadSuccess(data);
            },
            function(fileURL){//File NOT found
                changeBackgroundImageFileDownload(data.bg, data.theme, data.pageCallback);
            }         
        );
    }

    /**
     * Download video theme file
     *
     * @param bg Object
     * @param theme Object
     * @param pageCallback Function
     */
    function changeBackgroundImageFileDownload(bg, theme, pageCallback) {
        var url = bg.url;
        var resolution = bg.resolution;
        var fileName = bg.fileName;

        console.log("Start Static background theme download by path", url);

        pageCallback = pageCallback || getNetTabPages;
        xhrBgImage = new XMLHttpRequest();
        xhrBgImage.open('GET', BRW_urlTunnel(url), true);
        xhrBgImage.responseType = 'arraybuffer';

        xhrBgImage.onload = function () {
            if(xhrBgImage.readyState == 4) {
                downloadImageThemeStatus = false;
                if (this.status == 200) {
                    increaseThemeStatistic(staticBackgroundType, theme.id, bg.resolution);
                    var data = new Blob([new Uint8Array(this.response)]);
                    getFileSystem(saveFile, {
                        "path": getThemesFileSystemPath(theme.id),
                        "name": fileName,
                        "data": data,
                        "theme": theme,
                        "resolution": resolution,
                        "callback": changeBackgroundImageFileLoadComplete,
                        "pageCallback": pageCallback,
                        "download" : true
                    });
                } else {
                    var errorMessage = translate("page_error_static_bg_not_found");
                    var downloadingFile = getDownloadingVideoData();
                    var currentThemeId = getThemeIdByFilePath(getStorageBackgroundImageFile());
                    getNetTabPages(sendThemeDownloadError, {
                        "messageCommand" : "imageThemeSendDownloadErrorToPage",
                        "errorMessage" : errorMessage,
                        "downloadingFile" : downloadingFile,
                        "currentThemeId" : currentThemeId
                    });
                    getOptionsThemesTabPages(sendThemeDownloadError, {
                        "messageCommand" : "changeBackgroundImageFileErrorToPage",
                        "errorMessage" : errorMessage,
                        "downloadingFile" : downloadingFile,
                        "currentThemeId" : currentThemeId
                    });
                    console.log('Error: ' + errorMessage + ' by path', url);
                }
            }
        };

        xhrBgImage.onprogress = function(e) {
            if (e.lengthComputable) {
                downloadImageThemeStatus = true;
                var percentComplete = Math.ceil(e.loaded / e.total * 100);
                if(percentComplete > 0 && percentComplete <= 100) {
                    var downloadingFile = getDownloadingImageData();
                    getNetTabPages(sendThemeDownloadProgress, {
                        "messageCommand" : "imageThemeSendDownloadProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : downloadingFile
                    });
                    getOptionsThemesTabPages(sendThemeDownloadProgress, {
                        "messageCommand" : "changeBackgroundImageFileProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : downloadingFile
                    });
                }
            }
        };

        xhrBgImage.onerror = function () {
            downloadImageThemeStatus = false;
            var errorMessage = translate("page_error_static_bg_load_problem");
            var downloadingFile = getDownloadingImageData();
            var currentThemeId = getThemeIdByFilePath(getStorageBackgroundImageFile());
            getNetTabPages(sendThemeDownloadError, {
                "messageCommand" : "imageThemeSendDownloadErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : downloadingFile,
                "currentThemeId" : currentThemeId
            });
            getOptionsThemesTabPages(sendThemeDownloadError, {
                "messageCommand" : "changeBackgroundImageFileErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : downloadingFile,
                "currentThemeId" : currentThemeId
            });
            console.log('Error: ' + errorMessage + ' by path', url);
        };

        setDownloadingImageData(theme.id, fileName, resolution);
        xhrBgImage.send();
    }

    /**
     * Change background image file load success
     *
     * @param data Object
     */
    function changeBackgroundImageFileLoadSuccess(data) {
        
        var url = data.url;
        data = {
            "path": getThemesFileSystemPath(data.theme.id),
            "name": data.bg.fileName,
            "data": data,
            "theme": data.theme,
            "resolution": data.bg.resolution,
            "pageCallback": data.pageCallback,
            "download" : false
        };
        changeBackgroundImageFileLoadComplete(url, data);
    }

    /**
     * Change background image file load complete
     *
     * @param url String
     * @param data Object
     */
    function changeBackgroundImageFileLoadComplete(url, data) {
        
        console.log("Background image saved");

        addThemeInstalledElement(data.theme, data.name, data.resolution, "bgFilePath", staticBackgroundType);

        localStorage.removeItem("background-video-file");
        localStorage.removeItem("background-video-resolution");
        localStorage.setItem("background-image-file", data.theme.id + "/" + data.name);
        localStorage.setItem("background-image-resolution", data.resolution);

        data.image = url;
        data.contentType = staticBackgroundType;
        
        
        /*Moved partly to browser choiser*/
        BRW_PARTLY_changeBackgroundImageFileLoadComplete(data);
    }

    /**
     * Change background video file
     *
     * @param fs FileSystem
     * @param data Object
     * @param defaultResponse Object
     */
    function changeBackgroundVideoFile(fs, data, defaultResponse) {
        
        defaultResponse = defaultResponse || { image : "" };

        if(data.themeId) {
            loadThemeConfig(data.themeId, changeBackgroundVideoFileStart);
        } else
            data.sendResponse(defaultResponse);
    }

    /**
     * Change background flixer video file
     *
     * @param fs FileSystem
     * @param data Object
     * @param defaultResponse Object
     */
    function changeBackgroundFlixerVideoFile(fs, data, defaultResponse) {
        
        
        
        defaultResponse = defaultResponse || { image : "" };

        if(data.themeId) {
            loadFlixerThemeConfig(data.themeId, changeBackgroundFlixerVideoFileStart, data);
        } else
            data.sendResponse(defaultResponse);
    }

    /**
     * Change background video file start
     * calculate video theme quality
     *
     * @param themeConfig Object
     */
    function changeBackgroundVideoFileStart(themeConfig) {
        
        if(typeof(themeConfig.bgVideoPath) != "undefined") {
            var installThemes = getInstalledThemes();
            var bg = null;

            if(typeof(installThemes[themeConfig.id]) != "undefined") { // find installed video data
                var lastInstallThemeData = installThemes[themeConfig.id];
                if(lastInstallThemeData && typeof(lastInstallThemeData["lastInstallBgVideo"]) != "undefined") {
                    var lastInstallThemeVideoBg = lastInstallThemeData["lastInstallBgVideo"];
                    if(lastInstallThemeVideoBg) {
                        bg = {
                            "url" : getThemeContentUrl(themeConfig.id, lastInstallThemeVideoBg.fileName),
                            "fileName" : lastInstallThemeVideoBg.fileName,
                            "resolution" : lastInstallThemeVideoBg.resolution
                        };
                    }
                }
            }

            if(!bg) bg = getThemeBgUrl(themeConfig, "video"); // get video resolution by client display resolution

            if(bg && bg.url) {
                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(changeBackgroundVideoFileLoad, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id,
                    "bg": bg
                });
            }
        }
    }

    /**
     * Change background flixer video file start
     * calculate video theme quality
     *
     * @param themeConfig Object
     */
    function changeBackgroundFlixerVideoFileStart(themeConfig, data) {
        
        if(typeof(themeConfig.bgVideoPath) != "undefined") {
            var bg = {};
            if(data.resolution)
                bg["resolution"] = data.resolution;
            else {
                if(typeof(themeConfig['lastInstallBgVideo']) != "undefined")
                    bg["resolution"] = themeConfig['lastInstallBgVideo']['resolution'];
                else
                    bg["resolution"] = 1280;
            }


            if(bg["resolution"] == 1280) {
                if(themeConfig.handmade) {
                    bg["url"] =getThemeTabletVideo(themeConfig.id);
                    bg["fileName"] = getThemeTabletVideoFileName(themeConfig.id);
                } else {
                    bg["url"] =getFlixelTabletVideo(themeConfig.id);
                    bg["fileName"] = getFlixelTabletVideoFileName(themeConfig.id);
                }
            } else {
                if(themeConfig.handmade) {
                    bg["url"] = getThemeHdVideo(themeConfig.id);
                    bg["fileName"] = getThemeHdVideoFileName(themeConfig.id);
                } else {
                    bg["url"] = getFlixelHdVideo(themeConfig.id);
                    bg["fileName"] = getFlixelHdVideoFileName(themeConfig.id);
                }
            }

            if(bg && bg.url) {
                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(changeBackgroundFlixelVideoFileLoad, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id,
                    "bg": bg
                });
            }
        }
    }

    /**
     * Change background video file load
     *
     * @param fs FileSystem
     * @param data Object
     */
    function changeBackgroundVideoFileLoad(fs, data) {
        
        data = data || {};

        if(typeof (data.pageCallback) == "undefined")
            data.pageCallback = getNetTabPages;

        if(xhrBgVideo) {
            xhrBgVideo.onload = null;
            xhrBgVideo.onprogress = null;
            xhrBgVideo.onerror = null;
            xhrBgVideo.abort();
            xhrBgVideo = null;
            clearDownloadingVideoData();
        }
        
        BRW_fsGetFile(fs, data.filePath, 
            function(fileURL){//Success, file found
                data.url = fileURL;
                changeBackgroundVideoFileLoadSuccess(data);
            },
            function(fileURL){//File NOT found
                changeBackgroundVideoFileDownload(data.bg, data.theme, data.pageCallback);
            }         
        );
    }

    /**
     * Change background flixel video file load
     *
     * @param fs FileSystem
     * @param data Object
     */

    /*Moved to browser choiser*/
    function changeBackgroundFlixelVideoFileLoad(fs, data) {
        //alert("changeBackgroundFlixelVideoFileLoad");
        BRW_changeBackgroundFlixelVideoFileLoad(fs, data);
    }
    

    /**
     * Change background video file load success
     *
     * @param data Object
     */
    function changeBackgroundVideoFileLoadSuccess(data) {
        
        var url = data.url;
        data = {
            "path": getThemesFileSystemPath(data.theme.id),
            "name": data.bg.fileName,
            "data": data,
            "theme": data.theme,
            "resolution": data.bg.resolution,
            "pageCallback": data.pageCallback,
            "download" : false
        };
        changeBackgroundVideoFileComplete(url, data);
    }

    /**
     * Change background flixer video file load success
     *
     * @param data Object
     */
    function changeBackgroundFlixerVideoFileLoadSuccess(data) {
        
        var url = data.url;
        data = {
            "path": getThemesFileSystemPath(data.theme.id),
            "name": data.bg.fileName,
            "data": data,
            "theme": data.theme,
            "resolution": data.bg.resolution,
            "pageCallback": data.pageCallback,
            "download" : false
        };
        changeBackgroundFlixerVideoFileComplete(url, data);
    }

    /**
     * Change background video file download
     *
     * @param bg Object
     * @param theme Object
     * @param pageCallback Function
     */
    function changeBackgroundVideoFileDownload(bg, theme, pageCallback) {
        
        //console.trace(theme);
        
        var url = bg.url;
        var resolution = bg.resolution;
        var fileName = bg.fileName;

        console.log("Start Live background theme download by path", url);
        
        pageCallback = pageCallback || getNetTabPages;
        xhrBgVideo = new XMLHttpRequest();
        
        xhrBgVideo.open('GET', BRW_urlTunnel(url), true);
        xhrBgVideo.responseType = 'arraybuffer';
        
        xhrBgVideo.onload = function () {
            if(xhrBgVideo.readyState == 4) {
                downloadVideoThemeStatus = false;
                if (this.status == 200) {
                    increaseThemeStatistic(liveBackgroundType, theme.id, bg.resolution);
                    var data = new Blob([new Uint8Array(this.response)]);
                    getFileSystem(saveFile, {
                        "path": getThemesFileSystemPath(theme.id),
                        "name": fileName,
                        "data": data,
                        "theme": theme,
                        "resolution": resolution,
                        "callback": changeBackgroundVideoFileComplete,
                        "pageCallback": pageCallback,
                        "download" : true
                    });
                } else {
                    var errorMessage = translate("page_error_live_bg_not_found");
                    var downloadingFile = getDownloadingVideoData();
                    var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
                    var currentResolution = getBackgroundVideoFileResolution();
                    var installedResolution = getInstalledFileResolution(currentThemeId);
                    var installedThemeId = getLastInstalledThemeId();
                    var installedThemeResolution = getInstalledFileResolution(installedThemeId);

                    getOptionsThemesTabPages(sendThemeDownloadError, {
                        "messageCommand" : "changeBackgroundVideoFileErrorToPage",
                        "errorMessage" : errorMessage,
                        "downloadingFile" : downloadingFile,
                        "currentThemeId" : currentThemeId,
                        "currentResolution" : currentResolution,
                        "installedResolution" : installedResolution,
                        "installedThemeId" : installedThemeId,
                        "installedThemeResolution" : installedThemeResolution
                    });
                    console.log('Error: ' + errorMessage + ' by path', url);
                }
            }
        };

        xhrBgVideo.onprogress = function(e) {
            if (e.lengthComputable) {
                var percentComplete = Math.ceil(e.loaded / e.total * 100);
                if(percentComplete > 0 && percentComplete <= 100) {
                    downloadVideoThemeStatus = true;
                    var downloadingFile = getDownloadingVideoData();
                    getOptionsThemesTabPages(sendThemeDownloadProgress, {
                        "messageCommand" : "changeBackgroundVideoFileProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : downloadingFile
                    });
                }
            }else{
                console.log("Can't find value of 'lengthComputable'", e);
            }
        };

        xhrBgVideo.onerror = function () {
            downloadVideoThemeStatus = false;
            var errorMessage = translate("page_error_live_bg_load_problem");
            var downloadingFile = getDownloadingVideoData();
            var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
            var currentResolution = getBackgroundVideoFileResolution();
            var installedResolution = getInstalledFileResolution(currentThemeId);
            var installedThemeId = getLastInstalledThemeId();
            var installedThemeResolution = getInstalledFileResolution(installedThemeId);

            getOptionsThemesTabPages(sendThemeDownloadError, {
                "messageCommand" : "changeBackgroundVideoFileErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : downloadingFile,
                "currentThemeId" : currentThemeId,
                "currentResolution" : currentResolution,
                "installedResolution" : installedResolution,
                "installedThemeId" : installedThemeId,
                "installedThemeResolution" : installedThemeResolution
            });
            console.log('Error: ' + errorMessage + ' by path', url);
        };
        setDownloadingVideoData(theme.id, fileName, resolution, liveBackgroundType);
        xhrBgVideo.send();
    }

    /**
     * Change background flixer video file download
     *
     * @param bg Object
     * @param theme Object
     * @param pageCallback Function
     */
    function changeBackgroundFlixerVideoFileDownload(bg, theme, pageCallback) {
        var url = bg.url;
        var resolution = bg.resolution;
        var fileName = bg.fileName;
        
        console.log("Start Flixer background theme download by path", BRW_urlTunnel(url));

        pageCallback = pageCallback || getNetTabPages;
        xhrBgVideo = new XMLHttpRequest();
        xhrBgVideo.open('GET', BRW_urlTunnel(url), true);
        xhrBgVideo.responseType = 'arraybuffer';

        xhrBgVideo.onload = function () {
            if(xhrBgVideo.readyState == 4) {
                downloadVideoThemeStatus = false;
                if (this.status == 200 && this.response.byteLength) {//add this.response.byteLength for firefox
                    increaseThemeStatistic(flixelBackgroundType, theme.id, bg.resolution);
                    bg.tryLoadTablet = false;
                    var data = new Blob([new Uint8Array(this.response)]);
                    getFileSystem(saveFile, {
                        "path": getThemesFileSystemPath(theme.id),
                        "name": fileName,
                        "data": data,
                        "theme": theme,
                        "resolution": resolution,
                        "callback": changeBackgroundFlixerVideoFileComplete,
                        "pageCallback": pageCallback,
                        "download" : true
                    });
                } else {
                    if(bg.tryLoadTablet) {
                        bg.tryLoadTablet = false;
                        downloadVideoThemeStatus = false;
                        var errorMessage = translate("page_error_flixer_bg_not_found");
                         var downloadingFile = getDownloadingVideoData();
                         var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
                         var currentResolution = getBackgroundVideoFileResolution();
                         var installedResolution = getInstalledFileResolution(currentThemeId);
                         var installedThemeId = getLastInstalledThemeId();
                         var installedThemeResolution = getInstalledFileResolution(installedThemeId);
                        getOptionsThemesTabPages(sendThemeDownloadError, {
                         "messageCommand" : "changeBackgroundFlixerVideoFileErrorToPage",
                         "errorMessage" : errorMessage,
                         "downloadingFile" : downloadingFile,
                         "currentThemeId" : currentThemeId,
                         "currentResolution" : currentResolution,
                         "installedResolution" : installedResolution,
                         "installedThemeId" : installedThemeId,
                         "installedThemeResolution" : installedThemeResolution
                         });
                         console.log('Error: ' + errorMessage + ' by path', url);
                    } else {
                        changeBackgroundFlixerVideoFileDownload({
                            "url" : bg.url.replace(".hd.", ".tablet."),
                            "resolution" :  bg.resolution,
                            "fileName" : bg.fileName.replace(".hd.", ".tablet."),
                            "tryLoadTablet" : true
                        }, theme, pageCallback);
                    }
                }
            }
        };

        xhrBgVideo.onprogress = function(e) {
            //console.log(e);
            
            if (e.lengthComputable) {
                var percentComplete = Math.ceil(e.loaded / e.total * 100);
                
                //console.log("percentComplete: "+percentComplete);
                
                if(percentComplete > 0 && percentComplete <= 100) {
                    downloadVideoThemeStatus = true;
                    var downloadingFile = getDownloadingVideoData();
                    getOptionsThemesTabPages(sendThemeDownloadProgress, {
                        "messageCommand" : "changeBackgroundFlixerVideoFileProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : downloadingFile
                    });
                }
            }else{
                //progress { target: XMLHttpRequest, isTrusted: true, lengthComputable: false, loaded: 1160041, total: 1160041, currentTarget: XMLHttpRequest, eventPhase: 2, bubbles: false, cancelable: false, defaultPrevented: false, timeStamp: 1459898257762000 }
                
                if(e.loaded != e.total){
                    var MB = Math.round(e.loaded / (1024 * 102.4))/10+"MB";
                    
                    downloadVideoThemeStatus = true;
                    var downloadingFile = getDownloadingVideoData();
                    
                    getOptionsThemesTabPages(sendThemeDownloadProgress, {
                        "messageCommand" : "changeBackgroundFlixerVideoFileProgressToPage",
                        "percentComplete" : MB,
                        "downloadingFile" : downloadingFile
                    });
                } 
            }
        };

        xhrBgVideo.onerror = function () {
            if(bg.tryLoadTablet) {
                bg.tryLoadTablet = false;
                downloadVideoThemeStatus = false;
                 var errorMessage = translate("page_error_flixer_bg_not_found");
                 var downloadingFile = getDownloadingVideoData();
                 var currentThemeId = getThemeIdByFilePath(getStorageBackgroundVideoFile());
                 var currentResolution = getBackgroundVideoFileResolution();
                 var installedResolution = getInstalledFileResolution(currentThemeId);
                 var installedThemeId = getLastInstalledThemeId();
                 var installedThemeResolution = getInstalledFileResolution(installedThemeId);
                getOptionsThemesTabPages(sendThemeDownloadError, {
                 "messageCommand" : "changeBackgroundFlixerVideoFileErrorToPage",
                 "errorMessage" : errorMessage,
                 "downloadingFile" : downloadingFile,
                 "currentThemeId" : currentThemeId,
                 "currentResolution" : currentResolution,
                 "installedResolution" : installedResolution,
                 "installedThemeId" : installedThemeId,
                 "installedThemeResolution" : installedThemeResolution
                 });
                 console.log('Error: ' + errorMessage + ' by path', url);
            } else {
                changeBackgroundFlixerVideoFileDownload({
                    "url" : bg.url.replace(".hd.", ".tablet."),
                    "resolution" :  bg.resolution,
                    "fileName" : bg.fileName.replace(".hd.", ".tablet."),
                    "tryLoadTablet" : true
                }, theme, pageCallback);
            }
        };
        setDownloadingVideoData(theme.id, fileName, resolution, flixelBackgroundType);
        xhrBgVideo.send();
    }

    /**
     * Change background video file complete
     *
     * @param url String
     * @param data Object
     */
    function changeBackgroundVideoFileComplete(url, data) {
        
        console.log("Background video saved");
        
        addThemeInstalledElement(data.theme, data.name, data.resolution, "bgVideoPath", liveBackgroundType);

        if(!getHideVideoThemeOfferThemeId())
            currentThemeId(setHideVideoThemeOfferThemeId);

        localStorage.removeItem("background-image-file");
        localStorage.removeItem("background-image-resolution");
        localStorage.setItem("background-video-file", data.theme.id + "/" + data.name);
        localStorage.setItem("background-video-resolution", data.resolution);
        localStorage.setItem("background-video-content-type", liveBackgroundType);
        
        localStorage.setItem("background-video-url", url);
        
        BRW_setVideoPosterImage(data.theme.id, data.theme.bgPoster || data.theme.thumbImage);
        
        data.video = url;

        getNetTabPages(reloadTabPages);
        getOptionsThemesTabPages(function(data) {
            var i, justCurrentTab=false;
            
            if(data.tabs){
                var tabs = data.tabs;
                var tabsCount = tabs.length
            }else justCurrentTab=true; //Firefox only
            
            var response = {
                "command" : "changeLiveBackgroundToOptionsPage",
                "videoThemeId" : data.theme.id,
                "currentImage" : getBackgroundImageFile(),
                "currentImageResolution" : getBackgroundImageFileResolution(),
                "currentVideo" : getBackgroundVideoFile(),
                "currentVideoResolution" : getBackgroundVideoFileResolution()
            };
            
            if(justCurrentTab) BRW_sendMessage(response); //Firefox only
            else{
                for(i = 0; i < tabsCount; i++) { //For Chrome
                    if(typeof (data.video) != "undefined") {
                        chrome.tabs.sendMessage(tabs[i].id, response);
                    }
                }
            }
        }, data);
    }

/**
     * Change background flixer video file complete
     *
     * @param url String
     * @param data Object
     */
    function changeBackgroundFlixerVideoFileComplete(url, data) {
        //console.log(data); console.trace();
        console.log("Background flixer video saved");
        
        addThemeInstalledElement(data.theme, data.name, data.resolution, "bgVideoPath", flixelBackgroundType);

        if(!getHideVideoThemeOfferThemeId())
            currentThemeId(setHideVideoThemeOfferThemeId);

        localStorage.removeItem("background-image-file");
        localStorage.removeItem("background-image-resolution");
        localStorage.setItem("background-video-file", data.theme.id + "/" + data.name);
        localStorage.setItem("background-video-resolution", data.resolution);
        localStorage.setItem("background-video-content-type", flixelBackgroundType);
        localStorage.setItem("background-video-content-author", data.theme.author);
        
        localStorage.setItem("background-video-content-handmade", (data.theme.handmade ? 1 : 0));
        localStorage.setItem("background-video-content-author-url", (data.theme.author_url ? data.theme.author_url : ""));
        
        localStorage.setItem("background-video-url", url);
        
        if(data.theme) 
            BRW_setVideoPosterImage(data.theme.id, data.theme.bgPoster || data.theme.thumbImage);
        
        data.video = url;
        
        BRW_PARTLY_changeBackgroundFlixerVideoFileComplete(data);
    }

    /**
     * Download theme background image
     *
     * @param bg Object
     * @param theme Object
     * @param pageCallback Function
     */
    function downloadThemeImageFile(bg, theme, pageCallback) {
        
        var url = bg.url;
        var resolution = bg.resolution;
        var fileName = bg.fileName;

        console.log("Start image theme download by path", url);

        pageCallback = pageCallback || getNetTabPages;

        /*if(xhrBgImage && xhrBgImage.readystate != 4)
            xhrBgImage.abort();*/
        xhrBgImage = new XMLHttpRequest();
        xhrBgImage.open('GET', BRW_urlTunnel(url), true);
        xhrBgImage.responseType = 'arraybuffer';

        xhrBgImage.onload = function () {
            if(xhrBgImage.readyState == 4) {
                downloadImageThemeStatus = false;
                if (this.status == 200) {
                    var data = new Blob([new Uint8Array(this.response)]);
                    getFileSystem(saveFile, {
                        "path": getThemesFileSystemPath(theme.id),
                        "name": fileName,
                        "data": data,
                        "theme": theme,
                        "resolution": resolution,
                        "callback": saveImageThemeComplete,
                        "pageCallback": pageCallback
                    });
                } else {
                    var errorMessage = translate("page_error_static_bg_not_found");
                    pageCallback(sendThemeDownloadError, {
                        "messageCommand": "imageThemeSendDownloadErrorToPage",
                        "errorMessage": errorMessage,
                        "downloadingFile" : getDownloadingImageData(),
                        "currentThemeId" : getThemeIdByFilePath(getStorageBackgroundImageFile())
                    });
                    console.log('Error: ' + errorMessage + ' by path', url);
                }
            }
        };

        xhrBgImage.onprogress = function(e) {
            if (e.lengthComputable) {
                downloadImageThemeStatus = true;
                var percentComplete = Math.ceil(e.loaded / e.total * 100);
                if(percentComplete > 0 && percentComplete <= 100) {
                    pageCallback(sendThemeDownloadProgress, {
                        "messageCommand" : "imageThemeSendDownloadProgressToPage",
                        "percentComplete" : percentComplete,
                        "downloadingFile" : getDownloadingImageData()
                    });
                }
            }
        };

        xhrBgImage.onerror = function () {
            downloadImageThemeStatus = false;
            var errorMessage = translate("page_error_static_bg_load_problem");
            pageCallback(sendThemeDownloadError, {
                "messageCommand" : "imageThemeSendDownloadErrorToPage",
                "errorMessage" : errorMessage,
                "downloadingFile" : getDownloadingImageData(),
                "currentThemeId" : getThemeIdByFilePath(getStorageBackgroundImageFile())
            });
            console.log('Error: ' + errorMessage + ' by path', url);
        };
        setDownloadingImageData(theme.id, fileName, resolution);
        xhrBgImage.send();

    }

    /**
     * Theme background image save complete
     *
     * @param url String
     * @param data Object
     */
    function saveImageThemeComplete(url, data) {
        
        console.log("Background image saved");

        addThemeInstalledElement(data.theme, data.name, data.resolution, "bgFilePath", staticBackgroundType);

        localStorage.setItem("background-image-update", new Date().getTime());
        localStorage.setItem("background-image-file", data.theme.id + "/" + data.name);
        localStorage.setItem("background-image-resolution", data.resolution);

        data.image = url;
        data.parallaxValue = getBackgroundParallaxValue();
        data.enableParallax = getDisplayParallaxVideoTheme();
        data.pageCallback(themeSendBackgroundToPage, data);
        getOptionsThemesTabPages(reloadTabPages);
    }

    /**
     * Send theme background image
     * to all new tab pages
     *
     * @param data Object
     */
    function themeSendBackgroundToPage(data) {
        
        var response = {"display" : false};

        if(typeof (data.theme) != "undefined") {
            response.theme = data.theme;
            response.parallaxValue = getBackgroundParallaxValue();
            response.enableParallax = getDisplayParallaxVideoTheme();

            if(typeof (data.theme.bgVideoPath) != "undefined") {
                response.display = false;
                response.command = "sendVideoThemeOfferToPage";
                response.currentDownloadImage =  getDownloadImageThemeStatus();
                response.currentDownloadVideo = getDownloadVideoThemeStatus();

                var videos = data.theme.bgVideoPath;
                checkVideoThemeElementsExist(videos, data, response, themeSendBackgroundToPageSuccess, sendThemeBackgroundResponse);
            } else {
                sendThemeBackgroundResponse(data, response);
            }
        } else {
            sendThemeBackgroundResponse(data, response);
        }
    }

    /**
     * Theme Send Background To Page Success
     *
     * @param data Object
     * @param response Object
     */
    function themeSendBackgroundToPageSuccess(data, response) {
        
        sendThemeBackgroundResponse(data, response);
    }

    /**
     * Send theme background response
     *
     * @param data Object
     * @param response Object
     */
    function sendThemeBackgroundResponse(data, response) {
        
        
        var i, justCurrentTab=false;

        if(data.tabs){
            var tabs = data.tabs;
            var tabsCount = tabs.length
        }else justCurrentTab=true; //Firefox only

        var enableVideoTheme = getDisplayVideoTheme();
        var parallaxValue = getBackgroundParallaxValue();
        var enableParallax = getDisplayParallaxVideoTheme();
        
        
        if(justCurrentTab){//Firefox only
            if(typeof (data.image) != "undefined") {
                BRW_sendMessage({
                    "command" : "themeSendBackgroundToPage",
                    "image" : data.image,
                    "parallaxValue" : parallaxValue,
                    "enableParallax" : enableParallax
                });
            }
            if(typeof (response) != "undefined") {
                if(response.display && enableVideoTheme) {
                    response.parallaxValue = data.parallaxValue;
                    response.enableParallax = data.enableParallax;
                    BRW_sendMessage(response);
                }
            }
        }else{//For Chrome
            for(i = 0; i < tabsCount; i++) {
                if(typeof (data.image) != "undefined") {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        "command" : "themeSendBackgroundToPage",
                        "image" : data.image,
                        "parallaxValue" : parallaxValue,
                        "enableParallax" : enableParallax
                    });
                }
                if(typeof (response) != "undefined") {
                    if(response.display && enableVideoTheme) {
                        response.parallaxValue = data.parallaxValue;
                        response.enableParallax = data.enableParallax;
                        chrome.tabs.sendMessage(tabs[i].id, response);
                    }
                }
            }
        }
    }



    /**
     * Get theme background url
     *
     * @param data Object
     * @param bgType String
     * @param definedResolution Int
     * @returns {string}
     */
    function getThemeBgUrl(data, bgType, definedResolution) {
        
        bgType = bgType || "image";
        var bgPath;
        var resolution;
        var defaultFileName;
        var defaultResolution;
        switch (bgType) {
            case "image" : {
                bgPath = data.bgFilePath;
                defaultFileName = "bg.jpg";
                defaultResolution = 1920;
                break;
            }
            case "video" : {
                bgPath = data.bgVideoPath;
                defaultFileName = "v1920bg.mp4";
                defaultResolution = 1920;
                break;
            }
        }

        if(typeof (bgPath) != "string") {
            var screenWidth = window.screen.width;
            var minDelta = 999999999;
            var minDeltaValue = "";
            var selectedWidth = 0;
            var backgrounds = bgPath;
            var w, widths = [];
            for( w in backgrounds )
                widths.push( parseInt(w, 10));
            widths.sort();

            if(typeof (definedResolution) != "undefined" && definedResolution) {
                for(w in backgrounds) {
                    if(definedResolution == w) {
                        minDeltaValue = backgrounds[w];
                        resolution = w;
                        break;
                    }
                }
            } else {
                for(w in backgrounds) {
                    var delta = Math.abs(screenWidth - w);
                    if(delta === 0){
                        minDelta = delta;
                        minDeltaValue = backgrounds[w];
                        selectedWidth = w;
                        resolution = w;
                        break;
                    }
                    if(delta < minDelta) {
                        minDelta = delta;
                        minDeltaValue = backgrounds[w];
                        selectedWidth = w;
                        resolution = w;
                    }
                }

                if(minDelta !== 0 && selectedWidth < screenWidth){
                    for( var i = 0; i != widths.length; i++ ){
                        w = widths[i];
                        if( w > selectedWidth ){
                            selectedWidth = w;
                            minDeltaValue = backgrounds[w];
                            resolution = w;
                            break;
                        }
                    }
                }
            }
            bgPath = minDeltaValue;
        }

        var resultUrl = getThemeContentUrl(data.id, defaultFileName);
        var fileName = defaultFileName;

        if(bgPath) {
            resultUrl = getThemeContentUrl(data.id, bgPath);
            fileName = bgPath.replace(/\/+/, "");
        }

        var resultResolution = defaultResolution;
        if(resolution)
            resultResolution = resolution;

        return {
            "url" : resultUrl,
            "fileName" : fileName,
            "resolution" : resultResolution
        };
    }

    /**
     * Try load current theme background
     *
     * @param themeId
     */
    function tryLoadBackgroundImage(themeId) {
        
        
        if(themeId) {
            var filePath = getBackgroundImageFile();
            var videoPath = getBackgroundVideoFile();
            
            var lastInstalledTheme = localStorage.getItem("last_installed_theme");
            if(lastInstalledTheme && lastInstalledTheme == themeId) {
                if(filePath) { // get exist file path
                    getFileSystem(tryGetBackgroundImageFile, { "filePath" : filePath, "themeId" : themeId });
                } else if(videoPath) {
                    // automate display active video theme
                } else {
                    clearLastThemeBackgroundParams(themeId);
                    loadThemeConfig(themeId, themeConfigLoaded);
                }
            } else {
                clearLastThemeBackgroundParams(themeId);
                loadThemeConfig(themeId, checkNewImageFileSize);
            }
        }
    }

    /**
     * Check new image file size
     *
     * @param themeConfig Object
     */
    function checkNewImageFileSize(themeConfig) {
        
        if(typeof(themeConfig.bgFilePath) != "undefined") {
            var bg = getThemeBgUrl(themeConfig);
            if(bg.url) {
                var filePath = getThemesFileSystemPath(themeConfig.id) + "/" + bg.fileName;
                getFileSystem(tryGetBackgroundImageFile, {
                    "filePath" : filePath,
                    "theme" : themeConfig,
                    "themeId" : themeConfig.id
                });
            } else
                themeConfigLoaded(themeConfig);
        }
    }

    /**
     * Clear last saved theme
     * background params
     *
     * @param themeId Int
     */
    function clearLastThemeBackgroundParams(themeId) {
        
        localStorage.setItem("last_installed_theme", themeId);
        clearHideVideoThemeOfferThemeId();
        localStorage.removeItem("background-video-file");
        localStorage.removeItem("background-video-resolution");
        getNetTabPages(hideThemeVideoDownloadOffer, { "themeId" : themeId });
    }

    /**
     * Send theme background video offer hide
     * to all new tab pages
     *
     * @param data Object
     */
    function hideThemeVideoDownloadOffer(data) {
        
        var i, justCurrentTab=false;

        if(data.tabs){
            var tabs = data.tabs;
            var tabsCount = tabs.length
        }else justCurrentTab=true; //Firefox only
        
        if(justCurrentTab) BRW_sendMessage({"command" : "hideThemeVideoDownloadOffer", "themeId" : data.themeId}); //Firefox only
        else{//For Chrome
            for(i = 0; i < tabsCount; i++)
                chrome.tabs.sendMessage(tabs[i].id, {"command" : "hideThemeVideoDownloadOffer", "themeId" : data.themeId});
        }  
    }

    /**
     * Try get background image file
     *
     * @param fs FileSystem
     * @param data Object
     */
    function tryGetBackgroundImageFile(fs, data) {
        
        data = data || {};

        if(xhrBgImage) {
            xhrBgImage.onload = null;
            xhrBgImage.onprogress = null;
            xhrBgImage.onerror = null;
            xhrBgImage.abort();
            xhrBgImage = null;
            clearDownloadingImageData();
        }

        fs.root.getFile(data.filePath, {}, function(fileEntry) {
            data.image = fileEntry.toURL();
            getNetTabPages(tryGetBackgroundImageFileSuccess, data);
            getOptionsThemesTabPages(reloadTabPages);
        }, function() { // background image not found
            loadThemeConfig(data.themeId, themeConfigLoaded);
        });
    }

    /**
     * Try get background image file success
     *
     * @param data
     */
    function tryGetBackgroundImageFileSuccess(data) {
        
        var response = {"display" : false};
        if(typeof (data.theme) != "undefined") {
            response.theme = data.theme;
            response.parallaxValue = getBackgroundParallaxValue();
            response.enableParallax = getDisplayParallaxVideoTheme();

            if(typeof (data.theme.bgVideoPath) != "undefined") {

                var videoThemeEnable = getDisplayVideoTheme();
                var lastInstallVideoFile = getThemeLastInstallVideoFile(data.theme.id);
                if(videoThemeEnable && lastInstallVideoFile) { // try load video theme if it was enabled
                    var bg = getThemeLastInstallVideoFile(data.theme.id);
                    var filePath = getThemesFileSystemPath(data.theme.id) + "/" + bg.fileName;
                    getFileSystem(tryGetBackgroundVideoFile, {
                        "filePath" : filePath,
                        "theme" : data.theme,
                        "themeId" : data.theme.id,
                        "bg": bg
                    });
                } else { // display background image
                    response.display = false;
                    response.command = "sendVideoThemeOfferToPage";
                    response.currentDownloadImage = getDownloadImageThemeStatus();
                    response.currentDownloadVideo = getDownloadVideoThemeStatus();
                    response.lastInstalledBgVideo = "";

                    var videos = data.theme.bgVideoPath;
                    checkVideoThemeElementsExist(videos, data, response, themeSendBackgroundToPageSuccess, sendThemeBackgroundResponse);
                }
            } else {
                sendThemeBackgroundResponse(data, response);
            }
         } else {
            sendThemeBackgroundResponse(data, response);
        }
    }

    /**
     * Increase theme statistic
     *
     * @param bgType Int
     * @param contentId String
     * @param resolution Int
     */
    function increaseThemeStatistic(bgType, contentId, resolution) {
        
        
        var send = true;
        if(bgType == liveBackgroundType) {
            var installedThemes = getInstalledThemes();
            if(typeof installedThemes[contentId] != "undefined") {
                var installedTheme = installedThemes[contentId];
                if(typeof installedTheme['bgVideoPath'] != "undefined") {
                    if(getArrayLength(installedTheme['bgVideoPath'])) {
                        send = false;
                    }
                }
            }
        }

        if(send){
            //$.post(themesStatisticUrl, getThemeStatisticParams(bgType, contentId, resolution));
            BRW_post(themesStatisticUrl, getThemeStatisticParams(bgType, contentId, resolution), function(data){
                //console.log('Increase statistic - SUCCESSFULLY', data);
            });
        }
    }

     /**
     * Get app installed date
     *
     * @returns {*}
     */
    function getLastRandomThemesId() {
        return localStorage.getItem("last-random-themes-id");
    }

    /**
     * Set app installed date
     *
     * @param id String
     */
    function setLastRandomThemesId(id) {
        
        localStorage.setItem("last-random-themes-id", id);
    }


    /**
     * Theme install event handler
     * Theme enable handler
     */  
    //m START
    /*Moved BLOCK to browser choiser*/
    BRW_themeHandlerInstallAndEnable();


