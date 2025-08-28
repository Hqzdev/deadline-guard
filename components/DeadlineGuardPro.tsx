"use client";

import React, { useEffect, useState } from 'react';

// Inline styles for the component
const styles = `
  .deadline-guard-pro {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .deadline-guard-pro .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .deadline-guard-pro .result-card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
    border: 1px solid #e2e8f0;
  }

  .deadline-guard-pro .result-card.success {
    background-color: #f0fdf4;
    border-color: #16a34a;
  }

  .deadline-guard-pro .result-card.warning {
    background-color: #fffbeb;
    border-color: #ca8a04;
  }

  .deadline-guard-pro .result-card.danger {
    background-color: #fef2f2;
    border-color: #dc2626;
  }

  .deadline-guard-pro .result-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .deadline-guard-pro .result-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .deadline-guard-pro .result-date {
    font-size: 0.875rem;
    color: #64748b;
  }

  .deadline-guard-pro .timeline {
    margin-top: 1rem;
  }

  .deadline-guard-pro .timeline-bar {
    position: relative;
    height: 8px;
    background-color: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .deadline-guard-pro .timeline-zone {
    position: absolute;
    height: 100%;
    top: 0;
  }

  .deadline-guard-pro .timeline-zone.success {
    background-color: #16a34a;
    left: 0;
    width: 60%;
  }

  .deadline-guard-pro .timeline-zone.warning {
    background-color: #ca8a04;
    left: 60%;
    width: 25%;
  }

  .deadline-guard-pro .timeline-zone.danger {
    background-color: #dc2626;
    left: 85%;
    width: 15%;
  }

  .deadline-guard-pro .timeline-pointer {
    position: absolute;
    top: -4px;
    width: 16px;
    height: 16px;
    background-color: #2563eb;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    transform: translateX(-50%);
  }

  .notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
  }

  .notification-success {
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #16a34a;
  }

  .notification-error {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #dc2626;
  }

  .notification-info {
    background-color: #f0f9ff;
    color: #0891b2;
    border: 1px solid #0891b2;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .deadline-guard-pro table {
    border-collapse: collapse;
    width: 100%;
  }

  .deadline-guard-pro th,
  .deadline-guard-pro td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  .deadline-guard-pro th {
    background-color: #f8fafc;
    font-weight: 600;
    font-size: 0.875rem;
    color: #475569;
  }

  .deadline-guard-pro tr:hover {
    background-color: #f1f5f9;
  }

  .deadline-guard-pro input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .deadline-guard-pro input[type="checkbox"]:checked {
    background-color: #4f46e5;
    border-color: #4f46e5;
  }
`;

// Types
interface SkuItem {
  id: number;
  name: string;
  stock: number;
  sales: number;
  delivery: number;
  period: number;
  color: string;
  notes: string;
  dateAdded: string;
  selected: boolean;
}

interface HistoryPoint {
  date: string;
  stock: number;
}

export default function DeadlineGuardPro() {
  // Global state
  const [skuList, setSkuList] = useState<SkuItem[]>([]);
  const [skuHistory, setSkuHistory] = useState<Record<number, HistoryPoint[]>>({});
  const [reminders, setReminders] = useState<Record<number, string>>({});
  const [settings, setSettings] = useState({
    defaultBuffer: 3,
    defaultPeriod: 30,
    darkTheme: false
  });
  const [activeTab, setActiveTab] = useState('calculator');

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('deadlineGuard_skuList', JSON.stringify(skuList));
    localStorage.setItem('deadlineGuard_skuHistory', JSON.stringify(skuHistory));
    localStorage.setItem('deadlineGuard_reminders', JSON.stringify(reminders));
  };

  // Load data from localStorage
  const loadData = () => {
    const savedSkuList = localStorage.getItem('deadlineGuard_skuList');
    const savedSkuHistory = localStorage.getItem('deadlineGuard_skuHistory');
    const savedReminders = localStorage.getItem('deadlineGuard_reminders');
    
    if (savedSkuList) setSkuList(JSON.parse(savedSkuList));
    if (savedSkuHistory) setSkuHistory(JSON.parse(savedSkuHistory));
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  };

  // Load settings
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('deadlineGuard_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsedSettings }));
    }
  };

  // Notifications
  const showNotification = (text: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    notification.innerHTML = `${icons[type]} ${text}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Switch tab
  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Calculator functions
  const calculate = () => {
    const sku = (document.getElementById('calcSku') as HTMLInputElement)?.value || '';
    const stock = parseFloat((document.getElementById('calcStock') as HTMLInputElement)?.value || '0') || 0;
    const sales = parseFloat((document.getElementById('calcSales') as HTMLInputElement)?.value || '0') || 0;
    const delivery = parseFloat((document.getElementById('calcDelivery') as HTMLInputElement)?.value || '0') || 0;
    const buffer = parseFloat((document.getElementById('calcBuffer') as HTMLInputElement)?.value || '0') || settings.defaultBuffer;
    const period = parseFloat((document.getElementById('calcPeriod') as HTMLInputElement)?.value || '0') || settings.defaultPeriod;
    const season = parseFloat((document.getElementById('calcSeason') as HTMLInputElement)?.value || '1') || 1;
    const color = (document.getElementById('calcColor') as HTMLInputElement)?.value || '';

    if (!stock || !sales || !delivery) {
      showNotification('Заполните все обязательные поля', 'error');
      return;
    }

    const adjustedSales = sales * season;
    const daysLeft = Math.floor(stock / adjustedSales);
    const orderDay = Math.max(0, daysLeft - delivery - buffer);
    const recommend = Math.ceil(adjustedSales * period);

    const today = new Date();
    const zeroDate = new Date(today.getTime() + daysLeft * 24 * 60 * 60 * 1000);
    const orderDate = new Date(today.getTime() + orderDay * 24 * 60 * 60 * 1000);

    let daysLeftStatus = 'success';
    if (daysLeft <= 7) daysLeftStatus = 'danger';
    else if (daysLeft <= 14) daysLeftStatus = 'warning';

    let orderDayStatus = 'success';
    if (orderDay <= 0) orderDayStatus = 'danger';
    else if (orderDay <= 3) orderDayStatus = 'warning';

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
  };

  const clearCalc = () => {
    const elements = ['calcSku', 'calcStock', 'calcSales', 'calcDelivery', 'calcBuffer', 'calcPeriod', 'calcSeason', 'calcColor'];
    elements.forEach(id => {
      const element = document.getElementById(id) as HTMLInputElement;
      if (element) {
        if (id === 'calcBuffer') element.value = settings.defaultBuffer.toString();
        else if (id === 'calcPeriod') element.value = settings.defaultPeriod.toString();
        else if (id === 'calcSeason') element.value = '1';
        else element.value = '';
      }
    });
    
    const resultsDiv = document.getElementById('calcResults');
    if (resultsDiv) resultsDiv.style.display = 'none';
  };

  const toMonitor = () => {
    const sku = (document.getElementById('calcSku') as HTMLInputElement)?.value || '';
    const stock = parseFloat((document.getElementById('calcStock') as HTMLInputElement)?.value || '0') || 0;
    const sales = parseFloat((document.getElementById('calcSales') as HTMLInputElement)?.value || '0') || 0;
    const delivery = parseFloat((document.getElementById('calcDelivery') as HTMLInputElement)?.value || '0') || 0;
    const period = parseFloat((document.getElementById('calcPeriod') as HTMLInputElement)?.value || '0') || settings.defaultPeriod;
    const color = (document.getElementById('calcColor') as HTMLInputElement)?.value || '';

    if (!stock || !sales || !delivery) {
      showNotification('Сначала заполните обязательные поля и выполните расчёт', 'error');
      return;
    }

    const monElements = ['monSku', 'monStock', 'monSales', 'monDelivery', 'monPeriod', 'monColor'];
    const values = [sku, stock.toString(), sales.toString(), delivery.toString(), period.toString(), color];
    
    monElements.forEach((id, index) => {
      const element = document.getElementById(id) as HTMLInputElement;
      if (element) element.value = values[index];
    });

    switchTab('monitoring');
  };

  // Monitoring functions
  const addSku = () => {
    const name = (document.getElementById('monSku') as HTMLInputElement)?.value || '';
    const stock = parseFloat((document.getElementById('monStock') as HTMLInputElement)?.value || '0') || 0;
    const sales = parseFloat((document.getElementById('monSales') as HTMLInputElement)?.value || '0') || 0;
    const delivery = parseFloat((document.getElementById('monDelivery') as HTMLInputElement)?.value || '0') || 0;
    const period = parseFloat((document.getElementById('monPeriod') as HTMLInputElement)?.value || '0') || settings.defaultPeriod;
    const color = (document.getElementById('monColor') as HTMLInputElement)?.value || '';
    const notes = (document.getElementById('monNotes') as HTMLTextAreaElement)?.value || '';

    if (!name || !stock || !sales || !delivery) {
      showNotification('Заполните все обязательные поля', 'error');
      return;
    }

    const newSku: SkuItem = {
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

    setSkuList(prev => [...prev, newSku]);
    
    setSkuHistory(prev => ({
      ...prev,
      [newSku.id]: [{
        date: new Date().toISOString(),
        stock
      }]
    }));

    const monElements = ['monSku', 'monStock', 'monSales', 'monDelivery', 'monPeriod', 'monColor', 'monNotes'];
    monElements.forEach(id => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
      if (element) {
        if (id === 'monPeriod') element.value = settings.defaultPeriod.toString();
        else element.value = '';
      }
    });

    showNotification('SKU добавлен в мониторинг', 'success');
  };

  // Action functions for monitoring
  const editSku = (id: number) => {
    const sku = skuList.find(s => s.id === id);
    if (!sku) return;

    const newStock = prompt(`Введите новый остаток для ${sku.name}:`, sku.stock.toString());
    if (newStock !== null) {
      const stock = parseFloat(newStock) || 0;
      
      setSkuList(prev => prev.map(s => 
        s.id === id ? { ...s, stock } : s
      ));
      
      // Add to history
      setSkuHistory(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), {
          date: new Date().toISOString(),
          stock
        }]
      }));

      showNotification('Остаток обновлен', 'success');
    }
  };

  const addReminder = (id: number) => {
    const sku = skuList.find(s => s.id === id);
    if (!sku) return;

    const date = prompt(`Введите дату напоминания для ${sku.name} (дд.мм.гггг):`);
    if (date) {
      setReminders(prev => ({
        ...prev,
        [id]: date
      }));
      showNotification('Напоминание добавлено', 'success');
    }
  };

  const deleteSku = (id: number) => {
    const sku = skuList.find(s => s.id === id);
    if (!sku) return;

    if (confirm(`Удалить ${sku.name} из мониторинга?`)) {
      setSkuList(prev => prev.filter(s => s.id !== id));
      
      // Remove from history and reminders
      setSkuHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[id];
        return newHistory;
      });
      
      setReminders(prev => {
        const newReminders = { ...prev };
        delete newReminders[id];
        return newReminders;
      });
      
      showNotification('SKU удален', 'success');
    }
  };

  // Group operations
  const toggleSelectAll = () => {
    const allSelected = skuList.every(sku => sku.selected);
    setSkuList(prev => prev.map(sku => ({ ...sku, selected: !allSelected })));
  };

  const sortSkus = () => {
    setSkuList(prev => [...prev].sort((a, b) => {
      const aCritical = (a.stock / a.sales) - a.delivery - settings.defaultBuffer;
      const bCritical = (b.stock / b.sales) - b.delivery - settings.defaultBuffer;
      return aCritical - bCritical;
    }));
    showNotification('Список отсортирован по критичности', 'info');
  };

  const clearAll = () => {
    if (confirm('Очистить весь список SKU? Это действие нельзя отменить.')) {
      setSkuList([]);
      setSkuHistory({});
      setReminders({});
      showNotification('Список очищен', 'success');
    }
  };

  const exportData = () => {
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
  };

  // Analytics functions
  const getAnalyticsData = () => {
    const critical = skuList.filter(sku => {
      const daysLeft = Math.floor(sku.stock / sku.sales);
      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
      return orderDay <= 0;
    });
    
    const warning = skuList.filter(sku => {
      const daysLeft = Math.floor(sku.stock / sku.sales);
      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
      return orderDay > 0 && orderDay <= 3;
    });
    
    const safe = skuList.filter(sku => {
      const daysLeft = Math.floor(sku.stock / sku.sales);
      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
      return orderDay > 3;
    });

    const totalValue = skuList.reduce((sum, sku) => sum + (sku.stock * sku.sales), 0);
    const criticalValue = critical.reduce((sum, sku) => sum + (sku.stock * sku.sales), 0);

    return {
      critical: critical.length,
      warning: warning.length,
      safe: safe.length,
      total: skuList.length,
      criticalValue,
      totalValue,
      criticalPercentage: skuList.length > 0 ? (critical.length / skuList.length) * 100 : 0
    };
  };

  const getTopCriticalSkus = () => {
    return skuList
      .filter(sku => {
        const daysLeft = Math.floor(sku.stock / sku.sales);
        const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
        return orderDay <= 0;
      })
      .sort((a, b) => {
        const aDays = Math.floor(a.stock / a.sales);
        const bDays = Math.floor(b.stock / b.sales);
        return aDays - bDays;
      })
      .slice(0, 5);
  };

  const getRecentHistory = () => {
    return Object.entries(skuHistory)
      .flatMap(([id, history]) => 
        history.slice(-3).map(point => ({
          id: parseInt(id),
          date: point.date,
          stock: point.stock,
          skuName: skuList.find(s => s.id === parseInt(id))?.name || 'Неизвестный SKU'
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  // Initialize
  useEffect(() => {
    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    loadData();
    loadSettings();
    
    // Auto-save every 30 seconds
    const timer = setInterval(saveData, 30000);
    
    // Save on beforeunload
    const handleBeforeUnload = () => saveData();
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Quick inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.id?.startsWith('calc')) {
          calculate();
        } else if (target.id?.startsWith('mon')) {
          addSku();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      // Remove styles on unmount
      styleElement.remove();
    };
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveData();
  }, [skuList, skuHistory, reminders]);

  return (
    <div className="deadline-guard-pro bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deadline Guard Pro</h1>
            <p className="text-indigo-100 mt-1">Контроль остатков и управление заказами</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100">Статистика</div>
            <div className="text-lg font-semibold">
              📦 {skuList.length} | 🚨 {skuList.filter(sku => {
                const daysLeft = Math.floor(sku.stock / sku.sales);
                const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                return orderDay <= 0;
              }).length} | ⚠️ {skuList.filter(sku => {
                const daysLeft = Math.floor(sku.stock / sku.sales);
                const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                return orderDay > 0 && orderDay <= 3;
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex">
          {['calculator', 'monitoring', 'analytics'].map(tab => (
            <button 
              key={tab}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              onClick={() => switchTab(tab)}
            >
              {tab === 'calculator' && '🧮 Калькулятор'}
              {tab === 'monitoring' && '📊 Мониторинг'}
              {tab === 'analytics' && '📈 Аналитика'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Calculator */}
        {activeTab === 'calculator' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Быстрый расчёт</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input type="text" id="calcSku" placeholder="Название товара" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Остаток *</label>
                <input type="number" id="calcStock" placeholder="0" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Продажи/день *</label>
                <input type="number" id="calcSales" placeholder="0" min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Срок поставки *</label>
                <input type="number" id="calcDelivery" placeholder="0" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Страховой запас</label>
                <input type="number" id="calcBuffer" placeholder="3" min="0" defaultValue={settings.defaultBuffer} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Период заказа</label>
                <input type="number" id="calcPeriod" placeholder="30" min="1" defaultValue={settings.defaultPeriod} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Рассчитать</button>
              <button onClick={clearCalc} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">Очистить</button>
              <button onClick={toMonitor} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">В мониторинг</button>
            </div>
            <div id="calcResults" className="mt-6 hidden"></div>
          </div>
        )}

        {/* Monitoring */}
        {activeTab === 'monitoring' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Мониторинг SKU</h2>
            
            {/* Add SKU Form */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Добавить SKU</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input type="text" id="monSku" placeholder="Название товара" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Остаток *</label>
                  <input type="number" id="monStock" placeholder="0" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Продажи/день *</label>
                  <input type="number" id="monSales" placeholder="0" min="0" step="0.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Срок поставки *</label>
                  <input type="number" id="monDelivery" placeholder="0" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Период заказа</label>
                  <input type="number" id="monPeriod" placeholder="30" min="1" defaultValue={settings.defaultPeriod} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Цвет</label>
                  <input type="color" id="monColor" className="w-full h-10 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Заметки</label>
                <textarea id="monNotes" placeholder="Дополнительная информация" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" rows={3}></textarea>
              </div>
              <button onClick={addSku} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Добавить SKU</button>
            </div>

            {/* Table Actions */}
            <div className="flex gap-3 mb-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={skuList.length > 0 && skuList.every(sku => sku.selected)}
                  onChange={toggleSelectAll}
                  className="mr-2"
                />
                Выбрать все
              </label>
              <button onClick={sortSkus} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm">Сортировать</button>
              <button onClick={clearAll} className="px-3 py-1 bg-red-200 text-red-700 rounded-lg hover:bg-red-300 transition-colors text-sm">Очистить всё</button>
              <button onClick={exportData} className="px-3 py-1 bg-green-200 text-green-700 rounded-lg hover:bg-green-300 transition-colors text-sm">Экспорт CSV</button>
            </div>

            {/* SKU Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={skuList.length > 0 && skuList.every(sku => sku.selected)}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">SKU</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Остаток</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Продажи/день</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Дней до нуля</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Заказать до</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Статус</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {skuList.map(sku => {
                    const daysLeft = Math.floor(sku.stock / sku.sales);
                    const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                    const orderDate = new Date(Date.now() + orderDay * 24 * 60 * 60 * 1000);
                    
                    let status = 'В норме';
                    let statusClass = 'bg-green-100 text-green-800';
                    if (orderDay <= 0) {
                      status = 'Критично';
                      statusClass = 'bg-red-100 text-red-800';
                    } else if (orderDay <= 3) {
                      status = 'Внимание';
                      statusClass = 'bg-yellow-100 text-yellow-800';
                    }

                    return (
                      <tr key={sku.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <input 
                            type="checkbox" 
                            checked={sku.selected}
                            onChange={() => {
                              setSkuList(prev => prev.map(s => 
                                s.id === sku.id ? { ...s, selected: !s.selected } : s
                              ));
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sku.color || '#ccc' }}></div>
                            {sku.name}
                            {reminders[sku.id] && <span className="text-yellow-600">⏰</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2">{sku.stock}</td>
                        <td className="px-3 py-2">{sku.sales}</td>
                        <td className="px-3 py-2">{daysLeft}</td>
                        <td className="px-3 py-2">{orderDate.toLocaleDateString('ru-RU')}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => editSku(sku.id)} 
                              className="p-1 hover:bg-slate-200 rounded" 
                              title="Редактировать остаток"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => addReminder(sku.id)} 
                              className="p-1 hover:bg-slate-200 rounded" 
                              title="Добавить напоминание"
                            >
                              ⏰
                            </button>
                            <button 
                              onClick={() => deleteSku(sku.id)} 
                              className="p-1 hover:bg-slate-200 rounded" 
                              title="Удалить SKU"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Аналитика</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Общая статистика</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">{getAnalyticsData().total}</div>
                    <div className="text-sm text-slate-600">Всего SKU</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {getAnalyticsData().critical}
                    </div>
                    <div className="text-sm text-red-600">Критично</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {getAnalyticsData().warning}
                    </div>
                    <div className="text-sm text-yellow-600">Внимание</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {getAnalyticsData().safe}
                    </div>
                    <div className="text-sm text-green-600">В норме</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-800">
                      {getAnalyticsData().criticalPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">SKU требуют внимания</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Рекомендации</h3>
                <div className="space-y-2">
                  {(() => {
                    const data = getAnalyticsData();
                    
                    return (
                      <>
                        {data.critical > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            🚨 Критическая ситуация! Заказать сегодня ({data.critical} SKU)
                          </div>
                        )}
                        {data.warning > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                            ⚠️ Требует внимания! Заказать в ближайшие 3 дня ({data.warning} SKU)
                          </div>
                        )}
                        {data.safe === data.total && data.total > 0 && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            ✅ Отличная работа! Все SKU в норме
                          </div>
                        )}
                        {data.total === 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                            📊 Начните мониторинг - добавьте первый SKU
                          </div>
                        )}
                        {data.total > 0 && (
                          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
                            💡 Общая стоимость остатков: {data.totalValue.toFixed(0)} у.е.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Топ критичных SKU</h3>
                <div className="space-y-2">
                  {getTopCriticalSkus().map(sku => {
                    const daysLeft = Math.floor(sku.stock / sku.sales);
                    return (
                      <div key={sku.id} className="flex justify-between items-center p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="font-medium">{sku.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-bold">{daysLeft} дней</div>
                          <div className="text-xs text-slate-500">{sku.stock} шт остаток</div>
                        </div>
                      </div>
                    );
                  })}
                  {getTopCriticalSkus().length === 0 && (
                    <div className="text-center text-slate-500 py-4">
                      ✅ Критичных SKU нет
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">История изменений</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getRecentHistory().map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium">{item.skuName}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-600 font-medium">{item.stock} шт</div>
                        <div className="text-xs text-slate-500">
                          {new Date(item.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getRecentHistory().length === 0 && (
                    <div className="text-center text-slate-500 py-4">
                      📝 История изменений пуста
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
