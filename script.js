// === (2) 單位換算 ===
const byInput = document.getElementById('byInput');
const myInput = document.getElementById('myInput');
const kyInput = document.getElementById('kyInput');

byInput.addEventListener('input', () => convertFrom('BY'));
myInput.addEventListener('input', () => convertFrom('MY'));
kyInput.addEventListener('input', () => convertFrom('KY'));

function convertFrom(unit) {
  let by, my, ky;
  if (unit === 'BY') {
    by = parseFloat(byInput.value);
    my = by * 1000;
    ky = by * 1000000;
  } else if (unit === 'MY') {
    my = parseFloat(myInput.value);
    by = my / 1000;
    ky = my * 1000;
  } else if (unit === 'KY') {
    ky = parseFloat(kyInput.value);
    my = ky / 1000;
    by = ky / 1000000;
  }
  if (!isNaN(by)) byInput.value = by;
  if (!isNaN(my)) myInput.value = my;
  if (!isNaN(ky)) kyInput.value = ky;
}

// === (3) 拖曳與翻轉（改良：手機/平板支援長按拖曳，不干擾滑動） ===
const cards = document.querySelectorAll('.card');
const slots = document.querySelectorAll('.image-slot');
let draggedCard = null;

// 桌面拖放
cards.forEach(card => {
  card.addEventListener('dragstart', e => {
    draggedCard = card;
    e.dataTransfer.setData('text/plain', card.dataset.num);
  });

  // 點擊翻轉（若為觸控後抑制點擊）
  card.addEventListener('click', e => {
    if (card._suppressClick) {
      card._suppressClick = false;
      return;
    }
    card.classList.toggle('flipped');
  });
});

// 放入圖片格（桌面拖放）
slots.forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', e => {
    e.preventDefault();
    if (draggedCard) dropToSlot(slot, draggedCard);
  });
});

// 手機／平板觸控拖曳
let touchDrag = false;
let touchCard = null;
let touchId = null;
let ghost = null;
let longPressTimer = null;
let lastTouchClient = { x: 0, y: 0 };
const LONG_PRESS_MS = 200; // 長按啟動拖曳的時間

function startTouchDrag(card, touch) {
  touchDrag = true;
  touchCard = card;
  draggedCard = card;

  // === 建立幽靈卡片（永遠顯示正面） ===
  const originalInner = card.querySelector('.card-inner');
  const ghostInner = originalInner.cloneNode(true);
  ghostInner.classList.remove('flipped');
  ghost = ghostInner;
  const scale = 0.5; // 幽靈卡片縮小比例
  ghost.style.position = 'fixed';
  ghost.style.left = (touch.clientX - 40) + 'px';
  ghost.style.top = (touch.clientY - 40) + 'px';
  ghost.style.width = (card.getBoundingClientRect().width * scale) + 'px';
  ghost.style.height = (card.getBoundingClientRect().height * scale) + 'px';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex = 9999;
  ghost.style.opacity = 0.9;
  ghost.style.transform = `scale(${scale})`;
  document.body.appendChild(ghost);

  card._suppressClick = true;
}

function moveGhost(touch) {
  if (!ghost) return;
  const offsetX = ghost.offsetWidth / 2;
  const offsetY = ghost.offsetHeight / 2;
  ghost.style.left = (touch.clientX - offsetX) + 'px';
  ghost.style.top = (touch.clientY - offsetY) + 'px';
}

function endTouchDrag(targetSlot) {
  if (targetSlot && touchCard) {
    dropToSlot(targetSlot, touchCard);
  }
  if (ghost && ghost.parentNode) ghost.remove();
  ghost = null;
  touchDrag = false;
  touchCard = null;
  draggedCard = null;
}

cards.forEach(card => {
  card.addEventListener('touchstart', e => {
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    touchId = t.identifier;
    lastTouchClient = { x: t.clientX, y: t.clientY };

    longPressTimer = setTimeout(() => {
      startTouchDrag(card, t);
    }, LONG_PRESS_MS);
  }, { passive: true });

  card.addEventListener('touchmove', e => {
    const t = Array.from(e.changedTouches).find(tt => tt.identifier === touchId);
    if (!t) return;

    const dx = Math.abs(t.clientX - lastTouchClient.x);
    const dy = Math.abs(t.clientY - lastTouchClient.y);
    const MOVE_CANCEL_THRESHOLD = 10;
    if (!touchDrag && (dx > MOVE_CANCEL_THRESHOLD || dy > MOVE_CANCEL_THRESHOLD)) {
      clearTimeout(longPressTimer);
    }

    if (!touchDrag) return;

    e.preventDefault();
    moveGhost(t);

    // 自動微幅捲動頁面
    const EDGE_MARGIN = 80;
    const SCROLL_STEP = 20;
    if (t.clientY < EDGE_MARGIN) {
      window.scrollBy(0, -SCROLL_STEP);
    } else if (t.clientY > window.innerHeight - EDGE_MARGIN) {
      window.scrollBy(0, SCROLL_STEP);
    }

    lastTouchClient = { x: t.clientX, y: t.clientY };
  }, { passive: false });

  // === 修正版 touchend（iOS 可放入 slot） ===
  card.addEventListener('touchend', e => {
    clearTimeout(longPressTimer);
    const t = Array.from(e.changedTouches).find(tt => tt.identifier === touchId) || e.changedTouches[0];
    if (!t && !touchDrag) return;

    if (!touchDrag) {
      touchId = null;
      return;
    }

    // 🔹 iOS Safari 修正：暫時隱藏幽靈卡片再取 elementFromPoint
    if (ghost) ghost.style.display = 'none';
    const target = document.elementFromPoint(t.clientX, t.clientY);
    if (ghost) ghost.style.display = '';

    const slot = target ? target.closest('.image-slot') : null;
    endTouchDrag(slot);
    touchId = null;
  }, { passive: false });

  card.addEventListener('touchcancel', e => {
    clearTimeout(longPressTimer);
    if (touchDrag) endTouchDrag(null);
    touchId = null;
  }, { passive: false });
});

// 放入圖片格（可重複使用）
function dropToSlot(slot, card) {
  slot.innerHTML = '';
  const imgNode = card.querySelector('.card-inner').cloneNode(true);
  imgNode.classList.remove('flipped'); // 放入時保持正面
  slot.appendChild(imgNode);
  slot.dataset.num = card.dataset.num;
}

// === (4) 比對正確順序 ===
const correctOrder = [3, 1, 2, 8, 4, 9, 12, 7, 6, 10, 5, 11];
document.getElementById('checkOrder').addEventListener('click', () => {
  const slots = document.querySelectorAll('.image-slot');
  slots.forEach((slot, i) => {
    if (parseInt(slot.dataset.num) === correctOrder[i]) {
      slot.classList.remove('wrong');
    } else {
      slot.classList.add('wrong');
    }
  });
});



