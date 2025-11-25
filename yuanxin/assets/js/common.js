// Common JS for Prototype

// Mock Navigation
function navigateTo(path) {
    window.location.href = path;
}

// Mock Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Add TabBar to pages (Simple injection for prototype)
function injectTabBar(activeTab) {
    const tabBarHtml = `
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50" style="max-width: 480px; margin: 0 auto;">
        <a href="/yuanxin/miniprogram/home/index.html" class="flex flex-col items-center ${activeTab === 'home' ? 'text-orange-500' : 'text-gray-500'}">
            <i class="iconfont icon-home text-xl mb-1"></i>
            <span class="text-xs">首页</span>
        </a>
        <a href="/yuanxin/miniprogram/community/index.html" class="flex flex-col items-center ${activeTab === 'community' ? 'text-orange-500' : 'text-gray-500'}">
            <i class="iconfont icon-community text-xl mb-1"></i>
            <span class="text-xs">社区</span>
        </a>
        <a href="/yuanxin/miniprogram/crowdfunding/index.html" class="flex flex-col items-center ${activeTab === 'crowdfunding' ? 'text-orange-500' : 'text-gray-500'}">
            <i class="iconfont icon-crowdfunding text-xl mb-1"></i>
            <span class="text-xs">众筹</span>
        </a>
        <a href="/yuanxin/miniprogram/user/index.html" class="flex flex-col items-center ${activeTab === 'user' ? 'text-orange-500' : 'text-gray-500'}">
            <i class="iconfont icon-user text-xl mb-1"></i>
            <span class="text-xs">我的</span>
        </a>
    </div>
    `;
    // Only inject if not already present
    if (!document.querySelector('.fixed.bottom-0')) {
        document.body.insertAdjacentHTML('beforeend', tabBarHtml);
    }
}
