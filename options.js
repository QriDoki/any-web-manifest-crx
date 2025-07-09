// options.js - 配置页面的JavaScript

(function() {
    'use strict';

    let configurations = [];

    // DOM元素
    const configurationsContainer = document.getElementById('configurations');
    const addConfigBtn = document.getElementById('addConfig');
    const saveConfigsBtn = document.getElementById('saveConfigs');
    const importConfigsBtn = document.getElementById('importConfigs');
    const exportConfigsBtn = document.getElementById('exportConfigs');
    const statusDiv = document.getElementById('status');
    const fileInput = document.getElementById('fileInput');

    // 显示状态消息
    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // 生成唯一ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 验证JSON格式
    function isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 创建配置项HTML
    function createConfigHTML(config) {
        return `
            <div class="config-item" data-id="${config.id}">
                <div class="config-header">
                    <div class="config-title">配置 #${config.id.slice(-4)}</div>
                    <button class="delete-btn" data-config-id="${config.id}">删除</button>
                </div>
                
                <div class="form-group">
                    <label for="urlPattern_${config.id}">URL正则表达式:</label>
                    <input type="text" 
                           id="urlPattern_${config.id}" 
                           class="url-pattern-input"
                           data-config-id="${config.id}"
                           value="${config.urlPattern || ''}" 
                           placeholder="例如: .*\\.example\\.com.*">
                    <div class="example">
                        <div class="example-title">示例:</div>
                        <div class="example-code">
                            .*\\.github\\.com.*<br>
                            ^https://www\\.google\\.com/<br>
                            .*localhost:3000.*
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="manifestJson_${config.id}">Manifest JSON内容:</label>
                    <textarea id="manifestJson_${config.id}" 
                              class="manifest-json-input"
                              data-config-id="${config.id}"
                              placeholder="请输入有效的JSON格式的manifest内容...">${config.manifestJson || getDefaultManifest()}</textarea>
                    <div class="example">
                        <div class="example-title">标准manifest.json示例:</div>
                        <div class="example-code">
                            {<br>
                            &nbsp;&nbsp;"name": "我的应用",<br>
                            &nbsp;&nbsp;"short_name": "MyApp",<br>
                            &nbsp;&nbsp;"start_url": "/",<br>
                            &nbsp;&nbsp;"display": "standalone",<br>
                            &nbsp;&nbsp;"background_color": "#ffffff",<br>
                            &nbsp;&nbsp;"theme_color": "#000000",<br>
                            &nbsp;&nbsp;"icons": [...]<br>
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 获取默认manifest模板
    function getDefaultManifest() {
        return JSON.stringify({
            "name": "我的应用",
            "short_name": "MyApp",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#000000",
            "icons": [
                {
                    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ]
        }, null, 2);
    }

    // 更新配置项
    function updateConfig(id, field, value) {
        const config = configurations.find(c => c.id === id);
        if (config) {
            config[field] = value;
        }
    }

    // 删除配置项
    function deleteConfig(id) {
        if (confirm('确定要删除这个配置吗？')) {
            configurations = configurations.filter(c => c.id !== id);
            renderConfigurations();
        }
    }

    // 绑定事件监听器到动态生成的元素
    function bindConfigEvents() {
        // 绑定删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const configId = this.getAttribute('data-config-id');
                deleteConfig(configId);
            });
        });

        // 绑定URL模式输入框事件
        document.querySelectorAll('.url-pattern-input').forEach(input => {
            input.addEventListener('input', function() {
                const configId = this.getAttribute('data-config-id');
                updateConfig(configId, 'urlPattern', this.value);
            });
        });

        // 绑定Manifest JSON输入框事件
        document.querySelectorAll('.manifest-json-input').forEach(textarea => {
            textarea.addEventListener('input', function() {
                const configId = this.getAttribute('data-config-id');
                updateConfig(configId, 'manifestJson', this.value);
            });
        });
    }

    // 添加新配置
    function addNewConfig() {
        const newConfig = {
            id: generateId(),
            urlPattern: '',
            manifestJson: getDefaultManifest()
        };
        configurations.push(newConfig);
        renderConfigurations();
    }

    // 渲染配置列表
    function renderConfigurations() {
        if (configurations.length === 0) {
            configurationsContainer.innerHTML = `
                <div class="empty-state">
                    还没有配置项，点击"添加新配置"开始设置。
                </div>
            `;
        } else {
            configurationsContainer.innerHTML = configurations.map(createConfigHTML).join('');
            // 重新绑定事件监听器
            bindConfigEvents();
        }
    }

    // 保存配置
    function saveConfigurations() {
        // 先从DOM中同步所有输入值到configurations数组
        syncConfigurationsFromDOM();

        // 验证所有配置
        for (const config of configurations) {
            if (!config.urlPattern || !config.urlPattern.trim()) {
                showStatus('请填写所有URL正则表达式', true);
                return;
            }

            // 验证正则表达式
            try {
                new RegExp(config.urlPattern);
            } catch (e) {
                showStatus(`无效的正则表达式: ${config.urlPattern}`, true);
                return;
            }

            // 验证JSON
            if (!config.manifestJson || !isValidJSON(config.manifestJson)) {
                showStatus('请确保所有Manifest JSON内容格式正确', true);
                return;
            }
        }

        // 保存到Chrome storage
        chrome.storage.local.set({ configurations }, function() {
            if (chrome.runtime.lastError) {
                showStatus('保存失败: ' + chrome.runtime.lastError.message, true);
            } else {
                showStatus('配置已保存成功！');
            }
        });
    }

    // 从DOM同步配置到数组
    function syncConfigurationsFromDOM() {
        configurations.forEach(config => {
            const urlInput = document.getElementById(`urlPattern_${config.id}`);
            const manifestTextarea = document.getElementById(`manifestJson_${config.id}`);
            
            if (urlInput) {
                config.urlPattern = urlInput.value;
            }
            if (manifestTextarea) {
                config.manifestJson = manifestTextarea.value;
            }
        });
    }

    // 导出配置
    function exportConfigurations() {
        const dataStr = JSON.stringify(configurations, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'any-webmanifest-config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus('配置已导出成功！');
    }

    // 导入配置
    function importConfigurations() {
        fileInput.click();
    }

    // 处理文件导入
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedConfigs = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedConfigs)) {
                    throw new Error('配置文件格式错误');
                }

                // 验证配置格式
                for (const config of importedConfigs) {
                    if (!config.urlPattern || !config.manifestJson) {
                        throw new Error('配置项缺少必要字段');
                    }
                    
                    // 确保每个配置都有ID
                    if (!config.id) {
                        config.id = generateId();
                    }
                }

                configurations = importedConfigs;
                renderConfigurations();
                showStatus('配置导入成功！');
                
            } catch (error) {
                showStatus('导入失败: ' + error.message, true);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // 清空文件输入
    }

    // 加载保存的配置
    function loadConfigurations() {
        chrome.storage.local.get(['configurations'], function(result) {
            configurations = result.configurations || [];
            renderConfigurations();
        });
    }

    // 事件监听器
    addConfigBtn.addEventListener('click', addNewConfig);
    saveConfigsBtn.addEventListener('click', saveConfigurations);
    exportConfigsBtn.addEventListener('click', exportConfigurations);
    importConfigsBtn.addEventListener('click', importConfigurations);
    fileInput.addEventListener('change', handleFileImport);

    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', loadConfigurations);

})();
