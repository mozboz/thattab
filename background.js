/*
    Code to manage global view of which windowIds have registered names, and
    which tabs have registered windowNames they'd like to open new tabs in:

    API's to understand:

    https://developer.chrome.com/extensions/tabs
    https://developer.chrome.com/extensions/windows
 */

// Global record of association of a window ID with a window name
var windowLabelById = {};
// lazy, avoid having to search for values by keeping array both ways round.
var windowIdByLabel = {};

// Global record of association of a tab ID with a window name
var transfers = {};

// Detect new tab, if it's registered for transfer and there is a valid destination window, move it
chrome.tabs.onCreated.addListener(function(tab){
    if (tab.openerTabId in transfers) {
        if (transfers[tab.openerTabId] in windowIdByLabel) {
            windowId = windowIdByLabel[transfers[tab.openerTabId]];
            chrome.tabs.move(tab.id, {"windowId" : windowId, "index" : -1});
        }
    }
});

// ---------------- Functions to support UI

function saveWindowLabel(windowId, label) {
    if (label=="") {
        if (windowId in windowLabelById) {
            delete windowIdByLabel[windowLabelById[windowId]];
            delete windowLabelById[windowId];
        }
    } else {
        windowIdByLabel[label] = windowId;
        windowLabelById[windowId] = label;
        updateMenu();
    }
}

function getWindowName(windowId) {
    if (windowId in windowLabelById) {
        return windowLabelById[windowId];
    } else {
        return null;
    }
}
function saveTransferNewTabsToWindow(tabId, label) {
    if (label=="") {
        delete transfers[tabId];
    } else {
        transfers[tabId] = label;
    }
}

function getTransferWindowName(tabId) {
    if (tabId in transfers) {
        return transfers[tabId];
    } else {
        return null;
    }
}

// ----------------- End UI functions


// ----------------- Functions for the right-click functionality

// Return a function which can be assigned to onClick event in right click
function tabOpenerFunction (windowId) {
    // Fuck you javascript. Who knows how the fuck this got to be a string. I'm sure there's some rational explanation, but still, fuck you javascript.
    if (typeof windowId == "string") windowId = parseInt(windowId);

    return function (onClickEvent) {
        var url = onClickEvent.linkUrl;

        chrome.tabs.create({
            'windowId': windowId,
            'url': url,
            'active': false
        });
    };
}

// Function to be called to populate right click menu
function updateMenu (focusChangedEvent) {
    chrome.contextMenus.removeAll(function () {
        if (Object.keys(windowLabelById).length > 0) {
            var mainMenu = chrome.contextMenus.create({
                title: 'Open in specific window',
                contexts: ['link']
            });

            for (var id in windowLabelById) {
                if (windowLabelById.hasOwnProperty(id)) {
                    chrome.contextMenus.create({
                        title: windowLabelById[id],
                        contexts: ['link'],
                        onclick: tabOpenerFunction(id),
                        parentId: mainMenu
                    });
                }
            }
        }
    });
}

// Run right click menu once when we load - not sure why, copied from elsewhere
updateMenu();

// Add listener to update right click menu on focus
chrome.windows.onFocusChanged.addListener(updateMenu);