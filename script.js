// =========================================
// Mastery Hub: Ba Duan Jin - 核心逻辑控制脚本 (V6.0)
// 特性：动态解耦、状态机路由、混合门控安全网
// =========================================

let currentPage = 1;
const totalPages = 11; // 1(封面) + 1(预备式) + 8(核心招式) + 1(结语反思)

/**
 * 核心全局 UI 状态机驱动中枢
 * 动态根据当前页面状态计算导航按钮的显示、隐藏、禁用与文本切换
 */
function updateUI() {
    // 1. 更新顶部全局页码计数器与进度条百分比
    document.getElementById('page-counter').innerText = `Page ${currentPage} / ${totalPages}`;
    document.getElementById('progress').style.width = `${(currentPage / totalPages) * 100}%`;
    
    const backBtn = document.getElementById('btn-back');
    const nextBtn = document.getElementById('btn-next');

    // 2. 路由分支控制网
    if (currentPage === 1) {
        // 封面页：隐藏全局后退与底部前进按钮（依靠卡片内大按钮激活）
        backBtn.style.visibility = 'hidden';
        nextBtn.style.display = 'none'; 
    } else if (currentPage === 2 || currentPage === 11) {
        // 预备式(Page 2) 与 结语反思页(Page 11)：属于无阻碍信息页，直接完全放行
        backBtn.style.visibility = 'visible';
        nextBtn.style.display = 'block';
        nextBtn.disabled = false;
    } else {
        // 核心学习页 (Page 3 到 10，对应招式 1 到 8)：启动严密的三重安全门控锁
        backBtn.style.visibility = 'visible';
        nextBtn.style.display = 'block'; 
        
        // 动态计算当前招式的编号 (例如 Page 3 对应 Section 1)
        let sectionNum = currentPage - 2;
        
        // 抓取当前页面下所有的同侪观察核对复选框
        const allBoxes = document.querySelectorAll(`.check-matrix-${sectionNum}`);
        
        if (allBoxes.length > 0) {
            // 核心计算：只有当所有复选框的 checked 状态都为 true 时，底部的 "Next Page" 才会解除禁用
            let allChecked = Array.from(allBoxes).every(box => box.checked);
            nextBtn.disabled = !allChecked;
        } else {
            nextBtn.disabled = true;
        }
    }

    // 3. 动态切换尾页按钮文本
    if (currentPage === totalPages) {
        nextBtn.innerText = "Finish Lesson";
    } else {
        nextBtn.innerText = "Next Page";
    }
}

/**
 * 全局多媒体止播中枢
 * 翻页时自动暂停并重置所有正在播放的音频，避免声音重叠导致的认知干扰
 */
function stopAllAudio() {
    document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

/**
 * 向前翻页路由控制
 */
function goNext() {
    if (currentPage < totalPages) {
        stopAllAudio();
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage++;
        document.getElementById(`page-${currentPage}`).classList.add('active');
        updateUI();
        // 丝滑滚动到屏幕顶部，提供完美的翻页视觉暗示
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // 当在最后一页点击 "Finish Lesson" 时的终极训练闭环逻辑
        alert("🌟 Congratulations! You have successfully completed the Ba Duan Jin Masterclass! 🌟");
        stopAllAudio();
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage = 1;
        document.getElementById(`page-1`).classList.add('active');
        updateUI();
        window.scrollTo(0, 0);
    }
}

/**
 * 向后翻页路由控制
 */
function goBack() {
    if (currentPage > 1) {
        stopAllAudio();
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage--;
        document.getElementById(`page-${currentPage}`).classList.add('active');
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * 门控一：混合式自主跟练验证中枢
 * @param {HTMLElement} checkbox - 触发事件的复选框元素
 * @param {string} targetId - 即将解锁显现的测试题盒子 ID
 */
function unlockElement(checkbox, targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        if (checkbox.checked) {
            target.style.display = 'block';
            // 视线平滑引导：自动滚动到展开的测试题区域
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        } else {
            target.style.display = 'none';
            // 逆向边界处理：如果用户取消了跟练打勾，必须连带隐藏其下方的测验和教练区，实现硬清空
            let sectionNum = targetId.replace('quiz-sec', '');
            const coachSec = document.getElementById('coach-sec' + sectionNum);
            const feedbackText = document.getElementById('feedback-sec' + sectionNum);
            if (coachSec) coachSec.style.display = 'none';
            if (feedbackText) feedbackText.style.display = 'none';
        }
    }
    // 重新校准导航状态
    updateUI();
}

/**
 * 门控二：认知测试交互与即时正负反馈引擎
 * @param {HTMLElement} btn - 当前被点击的选项按钮
 * @param {boolean} isCorrect - 选项是否正确
 * @param {string} feedbackMessage - 包含脚手架引导的诊断性评价文案
 * @param {number} sectionNum - 当前所处的招式小节关卡号
 */
function checkAnswer(btn, isCorrect, feedbackMessage, sectionNum) {
    // 抓取并清理当前测试题下所有按钮的历史对错状态样式
    const options = btn.parentElement.querySelectorAll('.opt-btn');
    options.forEach(opt => opt.classList.remove('correct', 'wrong'));
    
    const feedbackText = document.getElementById('feedback-sec' + sectionNum);
    if (!feedbackText) return;
    
    feedbackText.style.display = "block";

    if (isCorrect) {
        // 答对：赋予全局统一的成功绿视觉，并平滑解锁并推入第三步——同侪观察锦囊
        btn.classList.add('correct');
        feedbackText.style.background = "#eaf1e8";
        feedbackText.style.color = "#155724";
        feedbackText.innerHTML = `🌟 <b>Excellent!</b><br><span>${feedbackMessage}</span>`;
        
        const coachSec = document.getElementById('coach-sec' + sectionNum);
        if (coachSec) {
            coachSec.style.display = "block";
            setTimeout(() => coachSec.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        }
    } else {
        // 答错：赋予警告红，提示诊断信息，并动态关闭可能已开启的教练区（硬性认知卡点）
        btn.classList.add('wrong');
        feedbackText.style.background = "#fcedec";
        feedbackText.style.color = "#8a2522";
        feedbackText.innerHTML = `❌ <b>Almost there!</b><br><span>${feedbackMessage}</span>`;
        
        const coachSec = document.getElementById('coach-sec' + sectionNum);
        if (coachSec) coachSec.style.display = "none";
    }
    // 重新校准全局按钮可用状态
    updateUI();
}

/**
 * 多模态混合情境选项卡（Tabs）数据切换中心
 * @param {Event} event - 点击事件流
 * @param {string} descId - 需要被更新的目标文字描述容器 ID
 * @param {string} text - 对应场景下的最新教学行为引导词（精确适配录制、视导等动作描述）
 */
function switchTab(event, descId, text) {
    const tabs = event.target.parentElement.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const desc = document.getElementById(descId);
    if (desc) desc.innerText = text;
}

/**
 * 门控三：高级同侪观察矩阵动态总线监听
 * 监听全局范围内的所有 check-matrix 打勾动作，自动计算对应小节的报告生成与放行权限
 */
document.addEventListener('change', function(e) {
    if (e.target.className && e.target.className.match(/check-matrix-(\d+)/)) {
        let match = e.target.className.match(/check-matrix-(\d+)/);
        let sectionNum = match[1];
        
        // 抓取当前招式下的所有核对项，以及对应的成功绿提示框
        const allBoxes = document.querySelectorAll('.check-matrix-' + sectionNum);
        const successBox = document.getElementById('coach-success-' + sectionNum);
        
        // 核心计算：检查本小节的 3 个观察点是否全部被打勾
        let allChecked = Array.from(allBoxes).every(box => box.checked);
        
        if (allChecked) {
            if (successBox) {
                successBox.style.display = "block";
                setTimeout(() => successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
        } else {
            if (successBox) successBox.style.display = "none";
        }
        
        // 激活状态立即向上传递给全局 UI 状态机，解锁底部 Next Page 按钮
        updateUI();
    }
});

// 全局首屏初始化挂载
window.onload = () => updateUI();
