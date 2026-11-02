/* Presentation only. guess-game.js remains byte-for-byte the legacy game script. */
(() => {
  const feedback = document.getElementById('gameFeedback');
  new MutationObserver(() => {
    if (feedback.style.display === 'none' || !feedback.classList.contains('game-feedback-correct') || feedback.querySelector('.answer-cheki')) return;
    const clue = document.getElementById('gameDesc').textContent;
    const staff = staffData.find(person => person.clue === clue);
    if (!staff) return;
    const card = document.createElement('a');
    card.className = 'cheki answer-cheki'; card.href = 'staff.html#staff-' + staff.index;
    const slot = document.createElement('span'); slot.className = 'img-slot'; slot.style.aspectRatio = '3/5'; slot.dataset.fail = '这只肥的照片暂时没有加载出来';
    const image = new Image(360,600); image.alt = staff.name; image.decoding='async'; image.src=FEIFEI.staffAsset(staff.image,'standee');
    slot.append(image); card.append(slot);
    const caption=document.createElement('span'); caption.className='cheki__cap'; caption.textContent=staff.name; card.append(caption); feedback.append(card);
  }).observe(feedback,{childList:true,attributes:true,attributeFilter:['style','class']});
  const modal = document.getElementById('comboModal');
  const content = modal.querySelector('.combo-modal-content');
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label','三连击，啦哩吼！');
  let previousFocus;
  const main = document.getElementById('main');
  // The original combo modal is inside main. Only sibling content becomes inert.
  const section = document.getElementById('gameSection');
  new MutationObserver(()=>{
    const open=modal.classList.contains('active');
    section.inert=open; document.querySelector('.topbar').inert=open; document.querySelector('.site-footer').inert=open;
    if(open){previousFocus=document.activeElement;document.getElementById('comboContinueBtn').focus();}
    else previousFocus?.focus();
  }).observe(modal,{attributes:true,attributeFilter:['class']});
  modal.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();content.querySelector('button').focus();}});
})();
