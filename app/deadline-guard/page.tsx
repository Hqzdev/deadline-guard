"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

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

export default function DeadlineGuardPage() {
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

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('deadlineGuard_skuList', JSON.stringify(skuList));
    localStorage.setItem('deadlineGuard_skuHistory', JSON.stringify(skuHistory));
    localStorage.setItem('deadlineGuard_reminders', JSON.stringify(reminders));
  };

  // Save settings
  const saveSettings = () => {
    localStorage.setItem('deadlineGuard_settings', JSON.stringify(settings));
    showNotification('Настройки сохранены', 'success');
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
      
      if (parsedSettings.darkTheme) {
        document.body.classList.add('dark-theme');
      }
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
    
    if (tabId === 'analytics') {
      updateAnalytics();
      updateReminders();
    }
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

  // Analytics functions
  const updateAnalytics = () => {
    // This will be implemented in the JSX
  };

  const updateReminders = () => {
    // This will be implemented in the JSX
  };

  // Initialize
  useEffect(() => {
    loadData();
    loadSettings();
    
    // Auto-save every 30 seconds
    const timer = setInterval(saveData, 30000);
    setAutoSaveTimer(timer);
    
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
    };
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveData();
  }, [skuList, skuHistory, reminders]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Deadline Guard Pro</h1>
        <div id="headerStats" className="header-stats">
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
      </header>

      {/* Navigation */}
      <nav className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => switchTab('calculator')}
        >
          Калькулятор
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => switchTab('monitoring')}
        >
          Мониторинг
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => switchTab('analytics')}
        >
          Аналитика
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => switchTab('settings')}
        >
          Настройки
        </button>
        <button 
          className={`tab-btn ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => switchTab('help')}
        >
          Помощь
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Calculator */}
        {activeTab === 'calculator' && (
          <div id="calculator" className="tab-panel active">
            <h2>Быстрый расчёт</h2>
            <div className="calculator-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="calcSku">SKU</label>
                  <input type="text" id="calcSku" placeholder="Название товара" />
                </div>
                <div className="form-group">
                  <label htmlFor="calcStock">Текущий остаток *</label>
                  <input type="number" id="calcStock" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="calcSales">Продажи/день *</label>
                  <input type="number" id="calcSales" placeholder="0" min="0" step="0.1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="calcDelivery">Срок поставки *</label>
                  <input type="number" id="calcDelivery" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="calcBuffer">Страховой запас</label>
                  <input type="number" id="calcBuffer" placeholder="3" min="0" defaultValue={settings.defaultBuffer} />
                </div>
                <div className="form-group">
                  <label htmlFor="calcPeriod">Период заказа</label>
                  <input type="number" id="calcPeriod" placeholder="30" min="1" defaultValue={settings.defaultPeriod} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="calcSeason">Сезонный коэффициент</label>
                  <input type="number" id="calcSeason" placeholder="1" min="0" step="0.1" defaultValue="1" />
                </div>
                <div className="form-group">
                  <label htmlFor="calcColor">Цвет</label>
                  <input type="color" id="calcColor" />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={calculate} className="btn btn-primary">Рассчитать</button>
                <button onClick={clearCalc} className="btn btn-secondary">Очистить</button>
                <button onClick={toMonitor} className="btn btn-success">В мониторинг</button>
              </div>
            </div>
            
            <div id="calcResults" className="calc-results" style={{ display: 'none' }}></div>
          </div>
        )}

        {/* Monitoring */}
        {activeTab === 'monitoring' && (
          <div id="monitoring" className="tab-panel active">
            <h2>Мониторинг SKU</h2>
            
            {/* Add SKU Form */}
            <div className="add-sku-form">
              <h3>Добавить SKU</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monSku">SKU *</label>
                  <input type="text" id="monSku" placeholder="Название товара" />
                </div>
                <div className="form-group">
                  <label htmlFor="monStock">Остаток *</label>
                  <input type="number" id="monStock" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="monSales">Продажи/день *</label>
                  <input type="number" id="monSales" placeholder="0" min="0" step="0.1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monDelivery">Срок поставки *</label>
                  <input type="number" id="monDelivery" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="monPeriod">Период заказа</label>
                  <input type="number" id="monPeriod" placeholder="30" min="1" defaultValue={settings.defaultPeriod} />
                </div>
                <div className="form-group">
                  <label htmlFor="monColor">Цвет</label>
                  <input type="color" id="monColor" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="monNotes">Заметки</label>
                <textarea id="monNotes" placeholder="Дополнительная информация"></textarea>
              </div>
              <button onClick={addSku} className="btn btn-primary">Добавить SKU</button>
            </div>

            {/* SKU Table */}
            <div className="sku-table-container">
              <div className="table-actions">
                <label>
                  <input type="checkbox" id="selectAll" /> Выбрать все
                </label>
                <button className="btn btn-secondary">Сортировать</button>
                <button className="btn btn-danger">Очистить всё</button>
                <button className="btn btn-success">Экспорт CSV</button>
              </div>
              
              <div className="table-wrapper">
                <table className="sku-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" id="selectAll" /></th>
                      <th>SKU</th>
                      <th>Остаток</th>
                      <th>Продажи/день</th>
                      <th>Дней до нуля</th>
                      <th>Заказать до</th>
                      <th>Период</th>
                      <th>Статус</th>
                      <th>Заметки</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody id="skuTableBody">
                    {skuList.map(sku => {
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

                      return (
                        <tr key={sku.id}>
                          <td>
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
                          <td>
                            <div className="sku-name">
                              <span 
                                className="color-dot" 
                                style={{ backgroundColor: sku.color || '#ccc' }}
                              />
                              {sku.name}
                              {reminders[sku.id] && <span className="reminder-icon">⏰</span>}
                            </div>
                          </td>
                          <td>{sku.stock}</td>
                          <td>{sku.sales}</td>
                          <td>{daysLeft}</td>
                          <td>{orderDate.toLocaleDateString('ru-RU')}</td>
                          <td>{sku.period}</td>
                          <td><span className={`status ${statusClass}`}>{status}</span></td>
                          <td>{sku.notes}</td>
                          <td>
                            <button className="btn-icon">✏️</button>
                            <button className="btn-icon">⏰</button>
                            <button className="btn-icon">🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div id="analytics" className="tab-panel active">
            <h2>Аналитика</h2>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Общая статистика</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{skuList.length}</div>
                    <div className="stat-label">Всего SKU</div>
                  </div>
                  <div className="stat-item critical">
                    <div className="stat-value">
                      {skuList.filter(sku => {
                        const daysLeft = Math.floor(sku.stock / sku.sales);
                        const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                        return orderDay <= 0;
                      }).length}
                    </div>
                    <div className="stat-label">Критично</div>
                  </div>
                  <div className="stat-item warning">
                    <div className="stat-value">
                      {skuList.filter(sku => {
                        const daysLeft = Math.floor(sku.stock / sku.sales);
                        const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                        return orderDay > 0 && orderDay <= 3;
                      }).length}
                    </div>
                    <div className="stat-label">Внимание</div>
                  </div>
                  <div className="stat-item success">
                    <div className="stat-value">
                      {skuList.filter(sku => {
                        const daysLeft = Math.floor(sku.stock / sku.sales);
                        const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                        return orderDay > 3;
                      }).length}
                    </div>
                    <div className="stat-label">В норме</div>
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <h3>Рекомендации</h3>
                <div id="analyticsRecommendations">
                  {(() => {
                    const critical = skuList.filter(sku => {
                      const daysLeft = Math.floor(sku.stock / sku.sales);
                      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                      return orderDay <= 0;
                    }).length;
                    
                    const warning = skuList.filter(sku => {
                      const daysLeft = Math.floor(sku.stock / sku.sales);
                      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                      return orderDay > 0 && orderDay <= 3;
                    }).length;
                    
                    const safe = skuList.filter(sku => {
                      const daysLeft = Math.floor(sku.stock / sku.sales);
                      const orderDay = Math.max(0, daysLeft - sku.delivery - settings.defaultBuffer);
                      return orderDay > 3;
                    }).length;

                    return (
                      <>
                        {critical > 0 && (
                          <div className="recommendation critical">Критическая ситуация! Заказать сегодня</div>
                        )}
                        {warning > 0 && (
                          <div className="recommendation warning">Требует внимания! Заказать в ближайшие 3 дня</div>
                        )}
                        {safe === skuList.length && skuList.length > 0 && (
                          <div className="recommendation success">Отличная работа!</div>
                        )}
                        {skuList.length === 0 && (
                          <div className="recommendation info">Начните мониторинг</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <div className="analytics-card">
                <h3>Напоминания</h3>
                <div id="todayReminders">
                  {(() => {
                    const today = new Date().toLocaleDateString('ru-RU');
                    const todayReminders = skuList.filter(sku => reminders[sku.id] === today);
                    
                    if (todayReminders.length === 0) {
                      return <p>На сегодня напоминаний нет</p>;
                    }
                    
                    return (
                      <>
                        <h3>Напоминания на сегодня:</h3>
                        {todayReminders.map(sku => (
                          <div key={sku.id} className="reminder-item">⏰ {sku.name}</div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div id="settings" className="tab-panel active">
            <h2>Настройки</h2>
            
            <div className="settings-grid">
              <div className="settings-card">
                <h3>Параметры по умолчанию</h3>
                <div className="form-group">
                  <label htmlFor="settingsBuffer">Страховой запас (дни)</label>
                  <input 
                    type="number" 
                    id="settingsBuffer" 
                    min="0" 
                    value={settings.defaultBuffer}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultBuffer: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settingsPeriod">Период заказа (дни)</label>
                  <input 
                    type="number" 
                    id="settingsPeriod" 
                    min="1" 
                    value={settings.defaultPeriod}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultPeriod: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <button onClick={saveSettings} className="btn btn-primary">Сохранить</button>
              </div>
              
              <div className="settings-card">
                <h3>Внешний вид</h3>
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox" 
                      id="themeToggle"
                      checked={settings.darkTheme}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, darkTheme: e.target.checked }));
                        if (e.target.checked) {
                          document.body.classList.add('dark-theme');
                        } else {
                          document.body.classList.remove('dark-theme');
                        }
                      }}
                    />
                    Тёмная тема
                  </label>
                </div>
              </div>
              
              <div className="settings-card">
                <h3>Импорт/Экспорт</h3>
                <div className="form-group">
                  <label htmlFor="importCSV">Импорт CSV</label>
                  <input type="file" id="importCSV" accept=".csv" />
                </div>
                <div className="form-group">
                  <label htmlFor="backupFile">Восстановление</label>
                  <input type="file" id="backupFile" accept=".json" />
                </div>
                <button className="btn btn-secondary">Создать бэкап</button>
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        {activeTab === 'help' && (
          <div id="help" className="tab-panel active">
            <h2>Помощь</h2>
            <div className="help-content">
              <h3>Как пользоваться</h3>
              <p><strong>Калькулятор</strong> - быстрый расчёт для одного товара. Заполните обязательные поля и нажмите "Рассчитать".</p>
              <p><strong>Мониторинг</strong> - управление списком товаров. Добавляйте SKU, отслеживайте остатки и получайте уведомления.</p>
              <p><strong>Аналитика</strong> - общая картина по всем товарам с рекомендациями.</p>
              
              <h3>Формулы</h3>
              <ul>
                <li><strong>Дней хватит</strong> = Остаток ÷ Продажи/день</li>
                <li><strong>Когда заказывать</strong> = Дней хватит - Срок поставки - Страховой запас</li>
                <li><strong>Рекомендуемый объём</strong> = Продажи/день × Период заказа</li>
              </ul>
              
              <h3>Статусы</h3>
              <ul>
                <li><span className="status danger">Критично</span> - заказывать срочно (≤ 0 дней)</li>
                <li><span className="status warning">Внимание</span> - заказывать в ближайшие 3 дня</li>
                <li><span className="status success">В норме</span> - всё в порядке</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
