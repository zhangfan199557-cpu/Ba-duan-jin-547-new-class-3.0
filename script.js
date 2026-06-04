let currentPage = 1;
const totalPages = 11; 

function updateUI() {
    document.getElementById('page-counter').innerText = `Page ${currentPage} / ${totalPages}`;
    document.getElementById('progress').style.width = `${(currentPage / totalPages) * 100}%`;
    
    const backBtn = document.getElementById('btn-back');
    const nextBtn = document.getElementById('btn-next');

    if (currentPage === 1) {
        // 封面页：隐藏后退和全局下一页按钮
        backBtn.style.visibility = 'hidden';
        nextBtn.style.display = 'none'; 
    } else if (currentPage === 2 || currentPage === 11) {
        // 预备式(2)和结语页(11)：没有测验，直接显示全局下一页按钮并放行
        backBtn.style.visibility = 'visible';
        nextBtn.style.display = 'block';
        enableNext();
    } else {
        // 🚨 第 1 到第 8 式 (Page 3 - 10)：隐藏全局下一页按钮！
        // 强制学生必须通过做题和打勾，使用专属的关卡解锁按钮前进
        backBtn.style.visibility = 'visible';
        nextBtn.style.display = 'none'; 
    }

    // 只有在最后一页时，全局按钮文字才变成 Finish
    if (currentPage === totalPages) {
        nextBtn.innerText = "Finish Lesson";
    } else {
        nextBtn.innerText = "Next Page";
    }
}

function disableNext() {
    const btn = document.getElementById('btn-next');
    btn.disabled = true;
    btn.style.opacity = "0.3";
    btn.style.cursor = "not-allowed";
}

function enableNext() {
    const btn = document.getElementById('btn-next');
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
}

function goNext() {
    if (currentPage < totalPages) {
        // 正常往后翻页
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage++;
        document.getElementById(`page-${currentPage}`).classList.add('active');
        updateUI();
        window.scrollTo(0, 0); // 翻页后自动滚动到页面顶部
    } else if (currentPage === totalPages) {
        // 🚨 终极闭环逻辑：当在最后一页点击 "Finish Lesson" 时
        alert("🌟 Congratulations! You have successfully completed the Ba Duan Jin Masterclass! 🌟");
        
        // 弹窗结束后，自动回到第一页（封面）
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage = 1;
        document.getElementById(`page-1`).classList.add('active');
        updateUI();
        window.scrollTo(0, 0);
    }
}

function goBack() {
    if (currentPage > 1) {
        document.getElementById(`page-${currentPage}`).classList.remove('active');
        currentPage--;
        document.getElementById(`page-${currentPage}`).classList.add('active');
        updateUI();
        window.scrollTo(0, 0);
    }
}

// 🌟 3.0 加强版答题逻辑：支持建构主义第一重门控（测验解锁教练）
function checkAnswer(btn, isCorrect, feedbackMessage, sectionNum) {
    const feedbackText = btn.parentElement.nextElementSibling;
    feedbackText.style.display = "block";

    if (isCorrect) {
        btn.classList.add('correct');
        // 插入星星动画和正确提示
        feedbackText.innerHTML = `<span class="badge-star">🌟</span> <b>Excellent!</b> <br> ${feedbackMessage}`;
        feedbackText.style.color = "#4a755e";
        
        // 🚨 触发第一重门控：如果传了关卡号，解锁对应的同伴教练清单！
        if (sectionNum) {
            const coachSection = document.getElementById('coach-sec' + sectionNum);
            if (coachSection) {
                coachSection.style.display = "block";
            }
        }
    } else {
        btn.classList.add('wrong');
        // 幽默/鼓励提示
        feedbackText.innerHTML = `❌ <b>Almost there!</b> <br> ${feedbackMessage}`;
        feedbackText.style.color = "#8a2522";
        // 给学生 1.5 秒阅读时间，然后恢复按钮颜色，允许重新尝试
        setTimeout(() => btn.classList.remove('wrong'), 1500);
    }
}

// 🚨 3.0 终极逻辑：支持建构主义第二重门控（监听打勾状态解锁下一关）
document.addEventListener('change', function(e) {
    // 检查被点击的元素是不是我们的教练复选框 (类名包含 'check-sec')
    if (e.target.classList.toString().includes('check-sec')) {
        
        // 用正则提取出当前是第几式 (例如从 'check-sec1' 中提取出 '1')
        let match = e.target.className.match(/check-sec(\d+)/);
        
        if (match) {
            let sectionNum = match[1];
            // 获取当前关卡的所有 3 个复选框
            let allCheckboxes = document.querySelectorAll('.check-sec' + sectionNum);
            // 获取当前关卡的下一页按钮容器
            let nextContainer = document.getElementById('next-container-sec' + sectionNum);
            
            // 验证是否 3 个全部打勾
            let allChecked = true;
            allCheckboxes.forEach(function(box) {
                if (!box.checked) {
                    allChecked = false;
                }
            });
            
            // 如果全部打勾，显示下一关按钮；只要取消一个勾，按钮又会消失
            if (allChecked) {
                nextContainer.style.display = "block";
            } else {
                nextContainer.style.display = "none";
            }
        }
    }
});

// 动态呼吸提示词逻辑：适配8个页面的不同动作文案
setInterval(() => {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const breathTexts = activePage.querySelectorAll('p[id="breath-text"]');
        breathTexts.forEach(breathText => {
            const currentText = breathText.innerText;
            // 智能切换 Inhale 和 Exhale，同时保留后面的具体动作指令 (例如 "Push Up" 或 "Draw Bow")
            if (currentText.includes("Inhale")) {
                breathText.innerText = currentText.replace("Inhale", "Exhale");
            } else if (currentText.includes("Exhale")) {
                breathText.innerText = currentText.replace("Exhale", "Inhale");
            }
        });
    }
}, 4000);

window.onload = () => updateUI();