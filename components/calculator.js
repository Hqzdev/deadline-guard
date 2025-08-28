// Deadline Guard Pro - Контроль остатков
// Глобальное состояние и типы

// Глобальное состояние
let skuList = [];
let skuHistory = {};
let reminders = {};
let settings = {
  defaultBuffer: 3,
  defaultPeriod: 30,
  darkTheme: false
};

// Автосохранение
let autoSaveTimer;

function saveData() {
  localStorage.setItem('deadlineGuard_skuList', JSON.stringify(skuList));
  localStorage.setItem('deadlineGuard_skuHistory', JSON.stringify(skuHistory));
  localStorage.setItem('deadlineGuard_reminders', JSON.stringify(reminders));
}

function saveSettings() {
  localStorage.setItem('deadlineGuard_settings', JSON.stringify(settings));
  showNotification('Настройки сохранены', 'success');
}

function loadData() {
  const savedSkuList = localStorage.getItem('deadlineGuard_skuList');
  const savedSkuHistory = localStorage.getItem('deadlineGuard_skuHistory');
  const savedReminders = localStorage.getItem('deadlineGuard_reminders');
  
  if (savedSkuList) skuList = JSON.parse(savedSkuList);
  if (savedSkuHistory) skuHistory = JSON.parse(savedSkuHistory);
  if (savedReminders) reminders = JSON.parse(savedReminders);
}

function loadSettings() {
  const savedSettings = localStorage.getItem('deadlineGuard_settings');
  if (savedSettings) {
    settings = { ...settings, ...JSON.parse(savedSettings) };
  }
  
  // Применяем настройки к UI
  const settingsBuffer = document.getElementById('settingsBuffer');
  const settingsPeriod = document.getElementById('settingsPeriod');
  const themeToggle = document.getElementById('themeToggle');
  
  if (settingsBuffer) settingsBuffer.value = settings.defaultBuffer.toString();
  if (settingsPeriod) settingsPeriod.value = settings.defaultPeriod.toString();
  
  if (settings.darkTheme) {
    document.body.classList.add('dark-theme');
    if (themeToggle) themeToggle.checked = true;
  }
}

// Уведомления
function showNotification(text, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  notification.innerHTML = `${icons[type]} ${text}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Навигация
function switchTab(tabId) {
  // Скрываем все панели
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Убираем активность со всех кнопок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Показываем нужную панель
  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  
  // Специальная логика для аналитики
  if (tabId === 'analytics') {
    updateAnalytics();
    updateReminders();
  }
}

// Калькулятор
function calculate() {
  const sku = document.getElementById('calcSku')?.value || '';
  const stock = parseFloat(document.getElementById('calcStock')?.value || '0') || 0;
  const sales = parseFloat(document.getElementById('calcSales')?.value || '0') || 0;
  const delivery = parseFloat(document.getElementById('calcDelivery')?.value || '0') || 0;
  const buffer = parseFloat(document.getElementById('calcBuffer')?.value || '0') || settings.defaultBuffer;
  const period = parseFloat(document.getElementById('calcPeriod')?.value || '0') || settings.defaultPeriod;
  const season = parseFloat(document.getElementById('calcSeason')?.value || '1') || 1;
  const color = document.getElementById('calcColor')?.value || '';

  // Валидация
  if (!stock || !sales || !delivery) {
    showNotification('Заполните все обязательные поля', 'error');
    return;
  }

  // Формулы
  const adjustedSales = sales * season;
  const daysLeft = Math.floor(stock / adjustedSales);
  const orderDay = Math.max(0, daysLeft - delivery - buffer);
  const recommend = Math.ceil(adjustedSales * period);

  // Даты
  const today = new Date();
  const zeroDate = new Date(today.getTime() + daysLeft * 24 * 60 * 60 * 1000);
  const orderDate = new Date(today.getTime() + orderDay * 24 * 60 * 60 * 1000);

  // Статусы
  let daysLeftStatus = 'success';
  if (daysLeft <= 7) daysLeftStatus = 'danger';
  else if (daysLeft <= 14) daysLeftStatus = 'warning';

  let orderDayStatus = 'success';
  if (orderDay <= 0) orderDayStatus = 'danger';
  else if (orderDay <= 3) orderDayStatus = 'warning';

  // Обновляем результаты
  const resultsDiv = document.getElementById('calcResults');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div class="results-grid">
        <div class="result-card ${daysLeftStatus}">
          <h3>Дней хватит</h3>
          <div class="result-value">${daysLeft}</div>
          <div class="result-date">${zeroDate.toLocaleDateString('ru-RU')}</div>
        </div>
        
        <div class="result-card ${orderDayStatus}">
          <h3>Когда заказывать</h3>
          <div class="result-value">${orderDay <= 0 ? 'СРОЧНО!' : `через ${orderDay} дней`}</div>
          <div class="result-date">${orderDate.toLocaleDateString('ru-RU')}</div>
        </div>
        
        <div class="result-card success">
          <h3>Рекомендовано заказать</h3>
          <div class="result-value">${recommend} шт</div>
          <div class="result-date">на ${period} дней</div>
        </div>
      </div>
      
      <div class="timeline">
        <div class="timeline-bar">
          <div class="timeline-zone success"></div>
          <div class="timeline-zone warning"></div>
          <div class="timeline-zone danger"></div>
          <div class="timeline-pointer" style="left: ${Math.max(0, Math.min(100, (1 - orderDay / daysLeft) * 100))}%"></div>
        </div>
      </div>
    `;
    
    resultsDiv.style.display = 'block';
  }
}

function clearCalc() {
  const elements = ['calcSku', 'calcStock', 'calcSales', 'calcDelivery', 'calcBuffer', 'calcPeriod', 'calcSeason', 'calcColor'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'calcBuffer') element.value = settings.defaultBuffer.toString();
      else if (id === 'calcPeriod') element.value = settings.defaultPeriod.toString();
      else if (id === 'calcSeason') element.value = '1';
      else element.value = '';
    }
  });
  
  const resultsDiv = document.getElementById('calcResults');
  if (resultsDiv) resultsDiv.style.display = 'none';
}

function toMonitor() {
  const sku = document.getElementById('calcSku')?.value || '';
  const stock = parseFloat(document.getElementById('calcStock')?.value || '0') || 0;
  const sales = parseFloat(document.getElementById('calcSales')?.value || '0') || 0;
  const delivery = parseFloat(document.getElementById('calcDelivery')?.value || '0') || 0;
  const period = parseFloat(document.getElementById('calcPeriod')?.value || '0') || settings.defaultPeriod;
  const color = document.getElementById('calcColor')?.value || '';

  if (!stock || !sales || !delivery) {
    showNotification('Сначала заполните обязательные поля и выполните расчёт', 'error');
    return;
  }

  // Переносим данные в мониторинг
  const monElements = ['monSku', 'monStock', 'monSales', 'monDelivery', 'monPeriod', 'monColor'];
  const values = [sku, stock.toString(), sales.toString(), delivery.toString(), period.toString(), color];
  
  monElements.forEach((id, index) => {
    const element = document.getElementById(id);
    if (element) element.value = values[index];
  });

  // Переключаемся на вкладку мониторинга
  switchTab('monitoring');
}

// Мониторинг
function addSku() {
  const name = document.getElementById('monSku')?.value || '';
  const stock = parseFloat(document.getElementById('monStock')?.value || '0') || 0;
  const sales = parseFloat(document.getElementById('monSales')?.value || '0') || 0;
  const delivery = parseFloat(document.getElementById('monDelivery')?.value || '0') || 0;
  const period = parseFloat(document.getElementById('monPeriod')?.value || '0') || settings.defaultPeriod;
  const color = document.getElementById('monColor')?.value || '';
  const notes = document.getElementById('monNotes')?.value || '';

  if (!name || !stock || !sales || !delivery) {
    showNotification('Заполните все обязательные поля', 'error');
    return;
  }

  const newSku = {
    id: Date.now(),
    name,
    stock,
    sales,
    delivery,
    period,
    color,
    notes,
    dateAdded: new Date().toISOString(),
    selected: false
  };

  skuList.push(newSku);
  
  // Добавляем в историю
  if (!skuHistory[newSku.id]) {
    skuHistory[newSku.id] = [];
  }
  skuHistory[newSku.id].push({
    date: new Date().toISOString(),
    stock
  });

  saveData();
  updateTable();
  updateHeaderStats();
  
  // Очищаем форму
  const monElements = ['monSku', 'monStock', 'monSales', 'monDelivery', 'monPeriod', 'monColor', 'monNotes'];
  monElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'monPeriod') element.value = settings.defaultPeriod.toString();
      else element.value = '';
    }
  });

  showNotification('SKU добавлен в мониторинг', 'success');
}

function updateTable() {
  const tbody = document.getElementById('skuTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  skuList.forEach(sku => {
    const daysLeft = Math.floor(sku.stock / sku.sales);
    const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
    const orderDate = new Date(Date.now() + orderDay * 24 * 60 * 60 * 1000);
    
    let status = 'В норме';
    let statusClass = 'success';
    if (orderDay <= 0) {
      status = 'Критично';
      statusClass = 'danger';
    } else if (orderDay <= 3) {
      status = 'Внимание';
      statusClass = 'warning';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" ${sku.selected ? 'checked' : ''} onchange="toggleSkuSelection(${sku.id})"></td>
      <td>
        <div class="sku-name">
          <span class="color-dot" style="background-color: ${sku.color || '#ccc'}"></span>
          ${sku.name}
          ${reminders[sku.id] ? '<span class="reminder-icon">⏰</span>' : ''}
        </div>
      </td>
      <td>${sku.stock}</td>
      <td>${sku.sales}</td>
      <td>${daysLeft}</td>
      <td>${orderDate.toLocaleDateString('ru-RU')}</td>
      <td>${sku.period}</td>
      <td><span class="status ${statusClass}">${status}</span></td>
      <td>${sku.notes}</td>
      <td>
        <button onclick="editSku(${sku.id})" class="btn-icon">✏️</button>
        <button onclick="addReminder(${sku.id})" class="btn-icon">⏰</button>
        <button onclick="deleteSku(${sku.id})" class="btn-icon">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function toggleSkuSelection(id) {
  const sku = skuList.find(s => s.id === id);
  if (sku) {
    sku.selected = !sku.selected;
    updateTable();
  }
}

function toggleSelectAll() {
  const checkbox = document.getElementById('selectAll');
  if (!checkbox) return;
  
  const isChecked = checkbox.checked;
  
  skuList.forEach(sku => {
    sku.selected = isChecked;
  });
  
  updateTable();
}

function editSku(id) {
  const sku = skuList.find(s => s.id === id);
  if (!sku) return;

  const newStock = prompt(`Введите новый остаток для ${sku.name}:`, sku.stock.toString());
  if (newStock !== null) {
    const stock = parseFloat(newStock) || 0;
    sku.stock = stock;
    
    // Добавляем в историю
    if (!skuHistory[id]) {
      skuHistory[id] = [];
    }
    skuHistory[id].push({
      date: new Date().toISOString(),
      stock
    });

    saveData();
    updateTable();
    updateHeaderStats();
    showNotification('Остаток обновлен', 'success');
  }
}

function addReminder(id) {
  const sku = skuList.find(s => s.id === id);
  if (!sku) return;

  const date = prompt(`Введите дату напоминания для ${sku.name} (дд.мм.гггг):`);
  if (date) {
    reminders[id] = date;
    saveData();
    updateTable();
    showNotification('Напоминание добавлено', 'success');
  }
}

function deleteSku(id) {
  const sku = skuList.find(s => s.id === id);
  if (!sku) return;

  if (confirm(`Удалить ${sku.name} из мониторинга?`)) {
    skuList = skuList.filter(s => s.id !== id);
    delete skuHistory[id];
    delete reminders[id];
    
    saveData();
    updateTable();
    updateHeaderStats();
    showNotification('SKU удален', 'success');
  }
}

function sortSkus() {
  skuList.sort((a, b) => {
    const aCritical = (a.stock / a.sales) - a.delivery - settings.defaultBuffer;
    const bCritical = (b.stock / b.sales) - b.delivery - settings.defaultBuffer;
    return aCritical - bCritical;
  });
  
  updateTable();
  showNotification('Список отсортирован по критичности', 'info');
}

function clearAll() {
  if (confirm('Очистить весь список SKU? Это действие нельзя отменить.')) {
    skuList = [];
    skuHistory = {};
    reminders = {};
    
    saveData();
    updateTable();
    updateHeaderStats();
    showNotification('Список очищен', 'success');
  }
}

function exportData() {
  const csvContent = [
    'SKU,Остаток,Продажи/день,Срок поставки,Период заказа,Дней до нуля,Заказать до,Статус,Заметки'
  ];

  skuList.forEach(sku => {
    const daysLeft = Math.floor(sku.stock / sku.sales);
    const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
    const orderDate = new Date(Date.now() + orderDay * 24 * 60 * 60 * 1000);
    
    let status = 'В норме';
    if (orderDay <= 0) status = 'Критично';
    else if (orderDay <= 3) status = 'Внимание';

    csvContent.push(`"${sku.name}",${sku.stock},${sku.sales},${sku.delivery},${sku.period},${daysLeft},"${orderDate.toLocaleDateString('ru-RU')}","${status}","${sku.notes}"`);
  });

  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `DeadlineGuard_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Данные экспортированы', 'success');
}

// Аналитика
function updateAnalytics() {
  let critical = 0;
  let warning = 0;
  let safe = 0;

  skuList.forEach(sku => {
    const daysLeft = Math.floor(sku.stock / sku.sales);
    const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
    
    if (orderDay <= 0) critical++;
    else if (orderDay <= 3) warning++;
    else safe++;
  });

  // Обновляем счетчики
  const totalElement = document.getElementById('analyticsTotal');
  const criticalElement = document.getElementById('analyticsCritical');
  const warningElement = document.getElementById('analyticsWarning');
  const safeElement = document.getElementById('analyticsSafe');

  if (totalElement) totalElement.textContent = skuList.length.toString();
  if (criticalElement) criticalElement.textContent = critical.toString();
  if (warningElement) warningElement.textContent = warning.toString();
  if (safeElement) safeElement.textContent = safe.toString();

  // Генерируем рекомендации
  const recommendationsDiv = document.getElementById('analyticsRecommendations');
  if (recommendationsDiv) {
    let recommendations = '';
    
    if (critical > 0) {
      recommendations += '<div class="recommendation critical">Критическая ситуация! Заказать сегодня</div>';
    }
    if (warning > 0) {
      recommendations += '<div class="recommendation warning">Требует внимания! Заказать в ближайшие 3 дня</div>';
    }
    if (safe === skuList.length && skuList.length > 0) {
      recommendations += '<div class="recommendation success">Отличная работа!</div>';
    }
    if (skuList.length === 0) {
      recommendations += '<div class="recommendation info">Начните мониторинг</div>';
    }
    
    recommendationsDiv.innerHTML = recommendations;
  }
}

function updateHeaderStats() {
  let critical = 0;
  let warning = 0;

  skuList.forEach(sku => {
    const daysLeft = Math.floor(sku.stock / sku.sales);
    const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
    
    if (orderDay <= 0) critical++;
    else if (orderDay <= 3) warning++;
  });

  const headerStats = document.getElementById('headerStats');
  if (headerStats) {
    headerStats.innerHTML = `📦 ${skuList.length} | 🚨 ${critical} | ⚠️ ${warning}`;
  }
}

// Напоминания
function updateReminders() {
  const today = new Date().toLocaleDateString('ru-RU');
  const todayReminders = [];

  skuList.forEach(sku => {
    if (reminders[sku.id] === today) {
      todayReminders.push(sku);
    }
  });

  const remindersDiv = document.getElementById('todayReminders');
  if (remindersDiv) {
    if (todayReminders.length === 0) {
      remindersDiv.innerHTML = '<p>На сегодня напоминаний нет</p>';
    } else {
      let html = '<h3>Напоминания на сегодня:</h3>';
      todayReminders.forEach(sku => {
        html += `<div class="reminder-item">⏰ ${sku.name}</div>`;
      });
      remindersDiv.innerHTML = html;
    }
  }
}

function checkReminders() {
  const today = new Date().toLocaleDateString('ru-RU');
  let count = 0;

  skuList.forEach(sku => {
    if (reminders[sku.id] === today) {
      count++;
    }
  });

  if (count > 0) {
    showNotification(`У вас ${count} напоминаний на сегодня`, 'info');
  }
}

// Настройки
function toggleTheme() {
  const checkbox = document.getElementById('themeToggle');
  if (!checkbox) return;

  if (checkbox.checked) {
    document.body.classList.add('dark-theme');
    settings.darkTheme = true;
  } else {
    document.body.classList.remove('dark-theme');
    settings.darkTheme = false;
  }
  
  saveSettings();
}

// Импорт/Экспорт
function importCSV(event) {
  const input = event.target;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const content = e.target?.result;
    const lines = content.split('\n');
    
    // Пропускаем заголовок
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(part => part.replace(/"/g, ''));
      if (parts.length < 4) continue;

      const [name, stock, sales, delivery, period, daysLeft, orderDate, status, notes] = parts;
      
      if (name && stock && sales && delivery) {
        const newSku = {
          id: Date.now() + i,
          name,
          stock: parseFloat(stock) || 0,
          sales: parseFloat(sales) || 0,
          delivery: parseFloat(delivery) || 0,
          period: parseFloat(period) || settings.defaultPeriod,
          color: '',
          notes: notes || '',
          dateAdded: new Date().toISOString(),
          selected: false
        };

        skuList.push(newSku);
        
        // Добавляем в историю
        if (!skuHistory[newSku.id]) {
          skuHistory[newSku.id] = [];
        }
        skuHistory[newSku.id].push({
          date: new Date().toISOString(),
          stock: newSku.stock
        });
      }
    }

    saveData();
    updateTable();
    updateHeaderStats();
    showNotification('Данные импортированы', 'success');
  };

  reader.readAsText(file);
}

function backupData() {
  const backup = {
    version: '1.0',
    date: new Date().toISOString(),
    skuList,
    skuHistory,
    reminders,
    settings
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `DeadlineGuard_Backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('Резервная копия создана', 'success');
}

function restoreData(event) {
  const input = event.target;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target?.result);
      
      if (backup.skuList && backup.skuHistory && backup.reminders && backup.settings) {
        skuList = backup.skuList;
        skuHistory = backup.skuHistory;
        reminders = backup.reminders;
        settings = { ...settings, ...backup.settings };
        
        saveData();
        loadSettings();
        updateTable();
        updateHeaderStats();
        showNotification('Данные восстановлены', 'success');
      } else {
        showNotification('Неверный формат файла', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при восстановлении данных', 'error');
    }
  };

  reader.readAsText(file);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadSettings();
  updateTable();
  updateHeaderStats();
  checkReminders();
  
  // Автосохранение каждые 30 секунд
  autoSaveTimer = setInterval(saveData, 30000);
  
  // Сохранение при закрытии
  window.addEventListener('beforeunload', saveData);
  
  // Быстрые вводы
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target.id?.startsWith('calc')) {
        calculate();
      } else if (target.id?.startsWith('mon')) {
        addSku();
      }
    }
  });
});
