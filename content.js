// content.js - 内容脚本，检查URL并注入webmanifest链接

(function() {
    'use strict';

    // 检查是否已经添加了webmanifest链接
    function hasExistingManifest() {
        return document.querySelector('link[rel="manifest"]') !== null;
    }

    // 将JSON转换为base64
    function jsonToBase64(jsonString) {
        try {
            // 验证JSON格式
            JSON.parse(jsonString);
            return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (e) {
            console.error('Invalid JSON format:', e);
            return null;
        }
    }

    // 创建并添加manifest链接
    function addManifestLink(manifestJson) {
        const base64Data = jsonToBase64(manifestJson);
        if (!base64Data) {
            console.error('Failed to convert manifest to base64');
            return;
        }

        // 移除现有的manifest链接（如果有的话）
        const existingLink = document.querySelector('link[rel="manifest"][data-any-webmanifest="true"]');
        if (existingLink) {
            existingLink.remove();
        }

        // 创建新的manifest链接
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = `data:application/json;base64,${base64Data}`;
        link.setAttribute('data-any-webmanifest', 'true');

        // 添加到head
        document.head.appendChild(link);
        console.log('WebManifest link added successfully');
    }

    // 检查URL是否匹配配置的正则表达式
    function checkUrlMatch(configurations) {
        const currentUrl = window.location.href;
        
        for (const config of configurations) {
            try {
                const regex = new RegExp(config.urlPattern, 'i');
                if (regex.test(currentUrl)) {
                    console.log(`URL matched pattern: ${config.urlPattern}`);
                    return config.manifestJson;
                }
            } catch (e) {
                console.error(`Invalid regex pattern: ${config.urlPattern}`, e);
            }
        }
        
        return null;
    }

    // 主函数
    function init() {
        // 如果页面已经有manifest链接且不是我们添加的，则跳过
        const existingManifest = document.querySelector('link[rel="manifest"]');
        if (existingManifest && !existingManifest.getAttribute('data-any-webmanifest')) {
            console.log('Page already has a manifest link, skipping');
            return;
        }

        // 从storage中获取配置
        chrome.storage.local.get(['configurations'], function(result) {
            const configurations = result.configurations || [];
            
            if (configurations.length === 0) {
                console.log('No configurations found');
                return;
            }

            const matchedManifest = checkUrlMatch(configurations);
            if (matchedManifest) {
                addManifestLink(matchedManifest);
            } else {
                console.log('No URL pattern matched current page');
            }
        });
    }

    // 当DOM准备就绪时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 监听页面变化（适用于SPA应用）
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(init, 100); // 延迟执行以确保页面完全加载
        }
    }).observe(document, { subtree: true, childList: true });

})();
