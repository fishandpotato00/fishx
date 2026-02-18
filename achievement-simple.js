function renderAchievementCardsSimple() {
    var container = document.getElementById('achievements-grid');
    if (!container) return;
    
    console.log('=== renderAchievementCardsSimple START ===');
    console.log('achievements:', achievements.length);
    
    container.innerHTML = '';
    
    for (var i = 0; i < achievements.length; i++) {
        var ach = achievements[i];
        var unlocked = gameState.achievements && gameState.achievements.indexOf(ach.id) !== -1;
        
        var card = document.createElement('div');
        card.style.cssText = 'position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px 16px;background:' + (unlocked ? 'linear-gradient(180deg, rgba(99,102,241,0.1) 0%, #ffffff 100%)' : '#ffffff') + ';border:2px solid ' + (unlocked ? '#2563eb' : 'rgba(59,130,246,0.12)') + ';border-radius:16px;cursor:pointer;min-height:170px;box-sizing:border-box;visibility:visible;opacity:1;';
        card.dataset.id = ach.id;
        card.dataset.page = ach.targetPage || 'home';
        
        var badge = document.createElement('span');
        badge.textContent = unlocked ? '✓' : '🔒';
        badge.style.cssText = 'position:absolute;top:10px;right:10px;font-size:0.75rem;padding:2px 6px;border-radius:6px;font-weight:600;background:' + (unlocked ? '#10b981' : '#f1f5f9') + ';color:' + (unlocked ? '#ffffff' : '#94a3b8') + ';z-index:2;';
        card.appendChild(badge);
        
        var icon = document.createElement('div');
        icon.textContent = ach.icon;
        icon.style.cssText = 'font-size:2.75rem;margin-bottom:12px;line-height:1;position:relative;z-index:1;';
        card.appendChild(icon);
        
        var name = document.createElement('div');
        name.textContent = ach.name;
        name.style.cssText = 'font-size:0.9375rem;font-weight:600;text-align:center;margin-bottom:6px;color:#0f172a;position:relative;z-index:1;';
        card.appendChild(name);
        
        var desc = document.createElement('div');
        desc.textContent = ach.desc;
        desc.style.cssText = 'font-size:0.75rem;color:#475569;text-align:center;line-height:1.4;margin-bottom:8px;position:relative;z-index:1;flex-grow:1;';
        card.appendChild(desc);
        
        var footer = document.createElement('div');
        if (unlocked && gameState.achievementTimes && gameState.achievementTimes[ach.id]) {
            footer.textContent = '📅 ' + gameState.achievementTimes[ach.id];
            footer.style.cssText = 'font-size:0.6875rem;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:8px;margin-top:auto;position:relative;z-index:1;';
        } else if (!unlocked) {
            footer.textContent = '点击前往解锁 →';
            footer.style.cssText = 'font-size:0.6875rem;color:#2563eb;background:rgba(37,99,235,0.08);padding:4px 10px;border-radius:8px;margin-top:auto;font-weight:600;position:relative;z-index:1;';
        }
        card.appendChild(footer);
        
        (function(card, achId, targetPage, isUnlocked) {
            card.addEventListener('click', function() {
                if (!isUnlocked && targetPage) {
                    navigateTo(targetPage);
                } else if (isUnlocked) {
                    showAchievementDetail(achId);
                }
            });
        })(card, ach.id, ach.targetPage || 'home', unlocked);
        
        container.appendChild(card);
    }
    
    console.log('=== renderAchievementCardsSimple DONE ===');
    console.log('Cards rendered:', container.children.length);
    updateAchievementStats();
}