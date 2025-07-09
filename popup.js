// popup.js - 弹出窗口的JavaScript

(function() {
    'use strict';

    // DOM元素
    const statusDiv = document.getElementById('status');
    const currentUrlDiv = document.getElementById('currentUrl');
    const configCountSpan = document.getElementById('configCount');
    const matchInfoDiv = document.getElementById('matchInfo');
    const matchedPatternSpan = document.getElementById('matchedPattern');
    const openOptionsBtn = document.getElementById('openOptions');
    const refreshPageBtn = document.getElementById('refreshPage');

    // 获取当前标签页信息
    function getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

    // 检查URL是否匹配配置
    function checkUrlMatch(url, configurations) {
        for (const config of configurations) {
            try {
                const regex = new RegExp(config.urlPattern, 'i');
                if (regex.test(url)) {
                    return config;
                }
            } catch (e) {
                console.error(`Invalid regex pattern: ${config.urlPattern}`, e);
            }
        }
        return null;
    }

    // 更新状态显示
    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    // 显示当前URL
    function displayCurrentUrl(url) {
        const displayUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
        currentUrlDiv.textContent = displayUrl;
        currentUrlDiv.title = url;
    }

    // 显示匹配信息
    function showMatchInfo(pattern) {
        matchedPatternSpan.textContent = pattern;
        matchInfoDiv.style.display = 'block';
    }

    // 隐藏匹配信息
    function hideMatchInfo() {
        matchInfoDiv.style.display = 'none';
    }

    // 主函数 - 检查当前页面状态
    async function checkCurrentPageStatus() {
        try {
            const tab = await getCurrentTab();
            
            if (!tab || !tab.url) {
                updateStatus('无法获取当前页面信息', 'inactive');
                currentUrlDiv.textContent = '未知';
                return;
            }

            // 显示当前URL
            displayCurrentUrl(tab.url);

            // 检查是否是支持的页面
            if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
                updateStatus('当前页面不支持注入', 'inactive');
                configCountSpan.textContent = '-';
                return;
            }

            // 获取配置
            chrome.storage.local.get(['configurations'], (result) => {
                const configurations = result.configurations || [];
                configCountSpan.textContent = configurations.length;

                if (configurations.length === 0) {
                    updateStatus('未找到任何配置', 'inactive');
                    hideMatchInfo();
                    return;
                }

                // 检查是否有匹配的配置
                const matchedConfig = checkUrlMatch(tab.url, configurations);
                
                if (matchedConfig) {
                    updateStatus('✓ WebManifest已注入', 'active');
                    showMatchInfo(matchedConfig.urlPattern);
                } else {
                    updateStatus('当前页面无匹配配置', 'info');
                    hideMatchInfo();
                }
            });

        } catch (error) {
            console.error('Error checking page status:', error);
            updateStatus('检查状态时出错', 'inactive');
        }
    }

    // 打开配置页面
    function openOptionsPage() {
        chrome.runtime.openOptionsPage();
        window.close();
    }

    // 刷新当前页面
    async function refreshCurrentPage() {
        try {
            const tab = await getCurrentTab();
            if (tab && tab.id) {
                chrome.tabs.reload(tab.id);
                window.close();
            }
        } catch (error) {
            console.error('Error refreshing page:', error);
        }
    }

    // 事件监听器
    openOptionsBtn.addEventListener('click', openOptionsPage);
    refreshPageBtn.addEventListener('click', refreshCurrentPage);

    // 监听配置变化
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.configurations) {
            checkCurrentPageStatus();
        }
    });

    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', () => {
        checkCurrentPageStatus();
    });

})();
