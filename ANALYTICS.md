# Настройка аналитики для Deadline-Guard

## Установленные системы аналитики

### Google Analytics 4 (GA4)
- **ID**: G-500412522
- **Статус**: ✅ Настроен
- **События**: Все пользовательские события отправляются в GA4

### Яндекс.Метрика
- **ID**: 103653140
- **Статус**: ✅ Настроен
- **Цели**: Все события отправляются как цели

## Отслеживаемые события

### Основные события

1. **`cta_click`** - Клик по любой CTA кнопке
   - Параметры: `location`, `action`
   - Примеры: `{location: "hero", action: "calculate"}`

2. **`calc_submit`** - Отправка калькулятора
   - Параметры: `orders`, `lateRate`, `reducePct`, `margin`, `penalty`, `plan`

3. **`utm_capture`** - Захват UTM-меток
   - Параметры: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

### Дополнительные события

4. **`page_view`** - Просмотр страницы
   - Параметры: `page_title`, `page_location`, `marketplace`

5. **`marketplace_select`** - Выбор маркетплейса через URL
   - Параметры: `marketplace`

6. **`marketplace_change`** - Изменение выбора маркетплейса
   - Параметры: `marketplace`

7. **`cta_tg_click`** - Клик по кнопке перехода в Telegram
   - Параметры: `from`

8. **`hero_cta`** - Клик по CTA в шапке
9. **`cta_hero_calc`** - Клик по кнопке калькулятора в hero
10. **`sticky_cta`** - Клик по фиксированной кнопке

## Настройка в GA4

### Создание целей (Goals)
1. Перейдите в GA4 → Admin → Events
2. Создайте следующие события как цели:
   - `cta_click`
   - `calc_submit`
   - `cta_tg_click`

### Настройка конверсий
1. Перейдите в GA4 → Admin → Conversions
2. Добавьте события как конверсии:
   - `cta_click` (любой клик по CTA)
   - `calc_submit` (использование калькулятора)
   - `cta_tg_click` (переход в Telegram)

## Настройка в Яндекс.Метрике

### Создание целей
1. Перейдите в Яндекс.Метрике → Настройки → Цели
2. Создайте следующие цели:

#### Цель "CTA Click"
- Тип: JavaScript событие
- Условие: `cta_click`

#### Цель "Calculator Submit"
- Тип: JavaScript событие
- Условие: `calc_submit`

#### Цель "Telegram Click"
- Тип: JavaScript событие
- Условие: `cta_tg_click`

#### Цель "UTM Capture"
- Тип: JavaScript событие
- Условие: `utm_capture`

### Настройка ecommerce (если нужно)
Для отслеживания конверсий можно настроить ecommerce события в GA4.

## Проверка работы

### В браузере
1. Откройте Developer Tools → Console
2. Кликните по любой CTA кнопке
3. Должны появиться логи:
   ```
   Track event: cta_click {location: "hero", action: "calculate"}
   Track event: hero_cta
   ```

### В GA4
1. Перейдите в GA4 → Reports → Realtime
2. Кликните по кнопкам на сайте
3. События должны появиться в реальном времени

### В Яндекс.Метрике
1. Перейдите в Яндекс.Метрике → Отчеты → В реальном времени
2. Кликните по кнопкам на сайте
3. Цели должны срабатывать

## UTM-метки

Система автоматически захватывает UTM-метки из URL и сохраняет их в localStorage:
- `utm_source`
- `utm_medium` 
- `utm_campaign`
- `utm_term`
- `utm_content`

Эти данные передаются в Telegram бота через параметр `start`.

## Отладка

Если аналитика не работает:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что блокировщики рекламы отключены
3. Проверьте, что ID GA4 и YM корректные
4. Убедитесь, что скрипты загружаются (проверьте Network tab)

## Полезные ссылки

- [GA4 Events Documentation](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Яндекс.Метрика JavaScript API](https://yandex.ru/support/metrica/code/counter-initialize.html)
