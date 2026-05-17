// ========== Cloudflare Worker 版本 ==========
// 替代原 PHP 的所有功能

// 发布密码
const PUBLISH_PASSWORD = 'nullstone';

// 初始化默认数据
const DEFAULT_DATA = {
  game: {
    name: '🎮 游戏',
    apps: [
      { name: 'Minecraft', version: '版本：0.14', desc: '携带版经典，无限世界', icon: '⛏️', downloadUrl: '请输入链接' },
      { name: '植物大战僵尸', version: '版本：1.9.3', desc: '塔防经典，童年回忆', icon: '🌱', downloadUrl: '请输入链接' },
      { name: 'Minecraft', version: '版本：1.20', desc: '洞穴与悬崖，完整生存', icon: '🪓', downloadUrl: '请输入链接' }
    ]
  },
  audio: { name: '🎵 音频播放', apps: [] },
  video: { name: '📺 视频播放', apps: [] },
  filemanager: { name: '📁 文件管理', apps: [] },
  browser: {
    name: '🌐 浏览器',
    apps: [
      { name: 'Via 浏览器', version: '版本：4.5.0', desc: '轻量极速，自定义最强', icon: '🌐', downloadUrl: '请输入链接' }
    ]
  },
  modifier: { name: '⚙️ 修改器', apps: [] }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 获取数据（从 KV 读取）
    async function getData() {
      const stored = await env.APPS_DATA.get('categories');
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_DATA;
    }
    
    // 保存数据到 KV
    async function saveData(data) {
      await env.APPS_DATA.put('categories', JSON.stringify(data));
    }
    
    // ========== API 路由 ==========
    
    // 获取所有数据
    if (path === '/api/data' && request.method === 'GET') {
      const data = await getData();
      return new Response(JSON.stringify(data), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 登录验证
    if (path === '/api/login' && request.method === 'POST') {
      const body = await request.json();
      if (body.password === PUBLISH_PASSWORD) {
        // 生成简单 token（实际生产环境应用更安全的方式）
        const token = btoa(Date.now() + ':' + body.password);
        return new Response(JSON.stringify({ success: true, token }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      return new Response(JSON.stringify({ success: false, error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // 发布/编辑/删除（需要验证）
    if (path === '/api/save' && request.method === 'POST') {
      // 验证 token（简化版，实际应更严格）
      const auth = request.headers.get('Authorization');
      if (!auth || !auth.includes('nullstone')) {
        return new Response(JSON.stringify({ success: false, error: '未授权' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const body = await request.json();
      const { action, categoryId, appIndex, appData } = body;
      
      let categories = await getData();
      
      if (action === 'add' && categoryId && categories[categoryId]) {
        categories[categoryId].apps.push(appData);
        await saveData(categories);
        return new Response(JSON.stringify({ success: true, message: '添加成功' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (action === 'edit' && categoryId && appIndex !== undefined && categories[categoryId]?.apps[appIndex]) {
        categories[categoryId].apps[appIndex] = { ...categories[categoryId].apps[appIndex], ...appData };
        await saveData(categories);
        return new Response(JSON.stringify({ success: true, message: '编辑成功' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (action === 'delete' && categoryId && appIndex !== undefined && categories[categoryId]?.apps[appIndex]) {
        categories[categoryId].apps.splice(appIndex, 1);
        await saveData(categories);
        return new Response(JSON.stringify({ success: true, message: '删除成功' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ success: false, error: '无效操作' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 返回 HTML 页面（其他所有请求）
    return new Response(getHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

// HTML 页面内容
function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>老安卓应用下载站 | 经典怀旧市场</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            --bg-primary: #1a1a24;
            --bg-secondary: #252530;
            --bg-card: #353540;
            --bg-input: #2c2c36;
            --border-color: #4a4a58;
            --text-primary: #ececec;
            --text-secondary: #aaa;
            --text-muted: #7a7a8a;
            --accent: #f4a261;
            --accent-dark: #e76f51;
            --danger: #8b4a4a;
            --success: #2a6b3c;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            padding: 16px 12px 50px;
            transition: all 0.2s;
        }
        body.light {
            --bg-primary: #f0f0f0;
            --bg-secondary: #e0e0e0;
            --bg-card: #ffffff;
            --bg-input: #f5f5f5;
            --border-color: #cccccc;
            --text-primary: #222222;
            --text-secondary: #555;
            --text-muted: #888;
            --accent: #e67e22;
            --danger: #c0392b;
            --success: #27ae60;
        }
        body { background: var(--bg-primary); color: var(--text-primary); }
        .container { max-width: 620px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; background: var(--bg-secondary); padding: 14px; border-radius: 28px; border-bottom: 2px solid var(--accent); position: relative; }
        .header h1 { font-size: 1.7rem; color: var(--accent); }
        .theme-toggle { position: absolute; top: 12px; right: 16px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 30px; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; text-decoration: none; color: var(--text-primary); }
        .search-box { display: flex; margin-bottom: 20px; background: var(--bg-input); border-radius: 48px; overflow: hidden; }
        .search-box input { flex: 1; background: transparent; border: none; padding: 10px 16px; color: var(--text-primary); outline: none; }
        .search-box button { background: var(--accent); border: none; padding: 0 18px; font-weight: bold; cursor: pointer; }
        .admin-bar { background: var(--bg-secondary); border-radius: 20px; padding: 10px 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .admin-btn { background: var(--accent); color: #1e1e2a; padding: 6px 14px; border-radius: 40px; text-decoration: none; font-weight: bold; border: none; cursor: pointer; }
        .message { background: var(--success); padding: 8px 12px; border-radius: 16px; margin-bottom: 16px; color: white; }
        .error { background: var(--danger); padding: 8px 12px; border-radius: 16px; margin-bottom: 16px; color: white; }
        .category-section { background: var(--bg-secondary); border-radius: 24px; padding: 12px; margin-bottom: 20px; }
        .category-title { font-size: 1.2rem; font-weight: bold; padding-bottom: 6px; border-bottom: 2px solid var(--accent); display: inline-block; margin-bottom: 12px; color: var(--accent); }
        .app-card { background: var(--bg-card); border-radius: 18px; display: flex; align-items: center; gap: 12px; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border-color); flex-wrap: wrap; }
        .app-icon { width: 48px; height: 48px; background: var(--bg-input); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
        .app-info { flex: 1; min-width: 140px; }
        .app-name { font-weight: bold; }
        .app-version { font-size: 0.65rem; color: var(--accent); }
        .app-desc { font-size: 0.65rem; color: var(--text-secondary); }
        .download-btn { background: var(--accent); border: none; padding: 6px 14px; border-radius: 40px; font-weight: bold; cursor: pointer; }
        .edit-delete { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
        .edit-delete input { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 12px; padding: 4px 8px; font-size: 0.7rem; width: auto; }
        .edit-btn, .delete-btn { background: #5a6e4a; border: none; padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; cursor: pointer; color: white; text-decoration: none; display: inline-block; }
        .delete-btn { background: #8b4a4a; }
        .publish-form { background: var(--bg-secondary); border-radius: 20px; padding: 14px; margin-bottom: 20px; }
        .publish-form input, .publish-form select { width: 100%; padding: 8px; margin-bottom: 8px; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 24px; }
        .publish-form button { background: var(--accent); border: none; padding: 8px; border-radius: 40px; font-weight: bold; width: 100%; cursor: pointer; }
        .empty { text-align: center; padding: 20px; color: var(--text-muted); }
        .footer { text-align: center; font-size: 0.65rem; color: var(--text-muted); margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
        @media (max-width: 550px) { .app-card { flex-direction: column; align-items: flex-start; } .download-btn { align-self: flex-end; } }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>📀 老安智档案馆</h1>
        <a href="#" class="theme-toggle" onclick="toggleTheme()">🌙 夜间模式</a>
    </div>

    <div class="search-box">
        <input type="text" id="searchInput" placeholder="🔍 搜索应用..." onkeyup="filterApps()">
        <button onclick="filterApps()">搜索</button>
    </div>

    <div class="admin-bar" id="adminBar"></div>
    <div id="messageDiv"></div>
    <div id="publishForm" style="display:none;"></div>
    <div id="categoriesContainer"></div>
    <div class="footer">📌 下载链接需配置 | 管理员可发布/编辑/删除</div>
</div>

<script>
    let categories = {};
    let isAdmin = false;
    let adminToken = null;
    let searchKeyword = '';
    
    const WORKER_URL = ''; // 留空表示同域
    
    async function loadData() {
        const res = await fetch('/api/data');
        categories = await res.json();
        render();
    }
    
    async function login() {
        const pwd = prompt('请输入发布密码：');
        if (!pwd) return;
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        const result = await res.json();
        if (result.success) {
            isAdmin = true;
            adminToken = result.token;
            showMessage('登录成功！', 'success');
            render();
        } else {
            showMessage('密码错误！', 'error');
        }
    }
    
    function logout() {
        isAdmin = false;
        adminToken = null;
        showMessage('已登出', 'success');
        render();
    }
    
    async function saveAction(action, categoryId, appIndex, appData) {
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({ action, categoryId, appIndex, appData })
        });
        const result = await res.json();
        if (result.success) {
            showMessage(result.message, 'success');
            loadData();
        } else {
            showMessage(result.error || '操作失败', 'error');
        }
    }
    
    function showMessage(msg, type) {
        const div = document.getElementById('messageDiv');
        div.innerHTML = `<div class="${type}">${type === 'success' ? '✅' : '❌'} ${msg}</div>`;
        setTimeout(() => div.innerHTML = '', 3000);
    }
    
    function filterApps() {
        searchKeyword = document.getElementById('searchInput').value.toLowerCase();
        render();
    }
    
    function toggleTheme() {
        document.body.classList.toggle('light');
        localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    }
    
    function render() {
        // 管理栏
        const adminBar = document.getElementById('adminBar');
        if (isAdmin) {
            adminBar.innerHTML = '<span>✅ 管理员模式</span><button class="admin-btn" onclick="logout()">🔓 登出</button>';
            document.getElementById('publishForm').style.display = 'block';
            document.getElementById('publishForm').innerHTML = renderPublishForm();
        } else {
            adminBar.innerHTML = '<button class="admin-btn" onclick="login()">🔐 进入发布模式</button>';
            document.getElementById('publishForm').style.display = 'none';
        }
        
        // 分类列表
        let html = '';
        let hasAny = false;
        for (const [catId, cat] of Object.entries(categories)) {
            let apps = cat.apps;
            if (searchKeyword) {
                apps = apps.filter(app => app.name.toLowerCase().includes(searchKeyword));
            }
            if (apps.length === 0 && searchKeyword) continue;
            hasAny = true;
            html += '<div class="category-section"><div class="category-title">' + escapeHtml(cat.name) + '</div>';
            if (apps.length === 0) {
                html += '<div class="empty">📭 暂无应用</div>';
            } else {
                apps.forEach((app, idx) => {
                    html += renderAppCard(catId, idx, app);
                });
            }
            html += '</div>';
        }
        if (searchKeyword && !hasAny) {
            html = '<div class="empty">😭 没有找到 "' + escapeHtml(searchKeyword) + '" 相关应用</div>';
        }
        document.getElementById('categoriesContainer').innerHTML = html;
    }
    
    function renderAppCard(catId, idx, app) {
        let editControls = '';
        if (isAdmin) {
            editControls = '<div class="edit-delete">' +
                '<input type="text" id="edit_name_' + idx + '" value="' + escapeHtml(app.name) + '" placeholder="名称" style="width:80px;">' +
                '<input type="text" id="edit_version_' + idx + '" value="' + escapeHtml(app.version) + '" placeholder="版本" style="width:70px;">' +
                '<input type="text" id="edit_desc_' + idx + '" value="' + escapeHtml(app.desc) + '" placeholder="描述" style="width:90px;">' +
                '<input type="text" id="edit_icon_' + idx + '" value="' + escapeHtml(app.icon) + '" placeholder="图标" style="width:50px;">' +
                '<input type="text" id="edit_url_' + idx + '" value="' + escapeHtml(app.downloadUrl) + '" placeholder="链接" style="width:100px;">' +
                '<button class="edit-btn" onclick="editApp(\'' + catId + '\', ' + idx + ')">💾 保存</button>' +
                '<button class="delete-btn" onclick="deleteApp(\'' + catId + '\', ' + idx + ')">🗑️ 删除</button>' +
                '</div>';
        }
        return '<div class="app-card">' +
            '<div class="app-icon">' + escapeHtml(app.icon) + '</div>' +
            '<div class="app-info">' +
            '<div class="app-name">' + escapeHtml(app.name) + '</div>' +
            '<div class="app-version">' + escapeHtml(app.version) + '</div>' +
            '<div class="app-desc">' + escapeHtml(app.desc) + '</div>' +
            editControls +
            '</div>' +
            '<button class="download-btn" onclick="downloadApp(\'' + escapeHtml(app.downloadUrl) + '\', \'' + escapeHtml(app.name) + '\')">⬇️ 下载</button>' +
            '</div>';
    }
    
    function renderPublishForm() {
        let catOptions = '';
        for (const [catId, cat] of Object.entries(categories)) {
            catOptions += '<option value="' + catId + '">' + escapeHtml(cat.name) + '</option>';
        }
        return '<h3>📤 发布新应用</h3>' +
            '<form onsubmit="publishApp(event)">' +
            '<select id="publish_cat" required>' + catOptions + '</select>' +
            '<input type="text" id="publish_name" placeholder="应用名称 *" required>' +
            '<input type="text" id="publish_version" placeholder="版本">' +
            '<input type="text" id="publish_desc" placeholder="描述">' +
            '<input type="text" id="publish_icon" placeholder="图标emoji" value="📦">' +
            '<input type="text" id="publish_url" placeholder="下载链接">' +
            '<button type="submit">✨ 发布应用</button>' +
            '</form>';
    }
    
    async function publishApp(e) {
        e.preventDefault();
        const categoryId = document.getElementById('publish_cat').value;
        const appData = {
            name: document.getElementById('publish_name').value,
            version: document.getElementById('publish_version').value || '版本：1.0',
            desc: document.getElementById('publish_desc').value || '暂无描述',
            icon: document.getElementById('publish_icon').value || '📦',
            downloadUrl: document.getElementById('publish_url').value || '请输入链接'
        };
        if (!appData.name) {
            showMessage('请填写应用名称', 'error');
            return;
        }
        await saveAction('add', categoryId, null, appData);
        document.getElementById('publish_name').value = '';
        document.getElementById('publish_version').value = '';
        document.getElementById('publish_desc').value = '';
    }
    
    async function editApp(catId, idx) {
        const appData = {
            name: document.getElementById('edit_name_' + idx).value,
            version: document.getElementById('edit_version_' + idx).value,
            desc: document.getElementById('edit_desc_' + idx).value,
            icon: document.getElementById('edit_icon_' + idx).value,
            downloadUrl: document.getElementById('edit_url_' + idx).value
        };
        await saveAction('edit', catId, idx, appData);
    }
    
    async function deleteApp(catId, idx) {
        if (confirm('确定删除此应用？')) {
            await saveAction('delete', catId, idx, null);
        }
    }
    
    function downloadApp(url, name) {
        if (!url || url === '请输入链接') {
            alert('[' + name + '] 下载链接尚未配置！');
            return;
        }
        if (!url.startsWith('http')) {
            alert('链接格式无效');
            return;
        }
        window.open(url, '_blank');
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // 初始化主题
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light');
    }
    
    loadData();
</script>
</body>
</html>`;
}