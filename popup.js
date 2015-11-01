// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

    var p = chrome.extension.getBackgroundPage();

    var link = document.getElementById('saveButton');
    // onClick's logic below:
    link.addEventListener('click', function() {
        saveInfo();
    });

    getCurrentTab(function(tab) {
        document.getElementById("thisWindowName").value = p.getWindowName(tab.windowId);
        document.getElementById("destWindowName").value = p.getTransferWindowName(tab.id);
    })

});

function saveInfo() {
    var p = chrome.extension.getBackgroundPage();

    getCurrentTab(function(tab) {
        p.saveWindowLabel(tab.windowId, document.getElementById("thisWindowName").value);
        p.saveTransferNewTabsToWindow(tab.id, document.getElementById("destWindowName").value);
    });

    renderStatus("Saved");
}

function getCurrentTab(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        callback(tab);
    });

}