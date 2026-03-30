# Архитектурный аудит History Prism

**Дата:** 2026-03-27
**Аудитор:** Evil Martians (AI-assisted)
**Стек:** Rails 8.0.2, React 19.1, Inertia.js, PostgreSQL, Sidekiq, Vite

---

## Оглавление

1. [Критические проблемы безопасности](#1-критические-проблемы-безопасности)
2. [Протечки абстракций между слоями](#2-протечки-абстракций-между-слоями)
3. [N+1 запросы](#3-n1-запросы)
4. [Схема БД и целостность данных](#4-схема-бд-и-целостность-данных)
5. [Контроллеры](#5-контроллеры)
6. [Сервисный слой](#6-сервисный-слой)
7. [Воркеры](#7-воркеры)
8. [Сериализаторы](#8-сериализаторы)
9. [Политики (Pundit)](#9-политики-pundit)
10. [Фронтенд](#10-фронтенд)
11. [Тесты](#11-тесты)
12. [Зависимости](#12-зависимости)
13. [Сводная таблица и план исправлений](#13-сводная-таблица-и-план-исправлений)

---

**Статусы:**
- `✅` — исправлено
- `⚠️` — исправлено частично или скорректировано под фактические правила проекта

---

## 1. Критические проблемы безопасности

### ✅ 1.1 EventPolicy.Scope возвращает ВСЕ записи

**Файл:** `app/policies/event_policy.rb:5-7`

```ruby
class Scope < Scope
  def resolve
    scope.all  # CRITICAL: все события всех пользователей
  end
end
```

**Риск:** Любой авторизованный пользователь видит события из чужих GEDCOM-файлов и книг.

**Исправление:**
```ruby
def resolve
  scope.where(creator: user)
end
```

+ПРИМЕЧАНИЕ ОТ АВТОРА!+ Нужно показывать ВСЕ глобальные и локальные события с меткой word/local для всех, в том числе неавторизованых пользователей. А вот события персональные из Gedcom файлов должны быть спрятаны.

### ✅ 1.2 EventsController#index без авторизации

**Файл:** `app/controllers/events_controller.rb:6-11`

Контроллер вызывает `Event.includes(...)` без `policy_scope` и без `authorize`. В отличие от `TimelinesController`, который правильно использует `policy_scope(Timeline)`.

**Исправление:**
```ruby
def index
  @events = policy_scope(Event).includes(:creator, :source, :start_date, :end_date, :location, :people)
  # ...
end
```

### ✅ 1.3 Сессия permanent: true без TTL

**Файл:** `app/controllers/concerns/authentication.rb:41-46`

Сессионная кука ставится на ~20 лет (`permanent: true`). Нет механизма инвалидации.

**Исправление:** Установить разумный `expires:` (7-30 дней) и добавить ротацию токенов.

### ✅ 1.4 Timing attack на PasswordsController

**Файл:** `app/controllers/passwords_controller.rb:10-13`

Можно определить наличие email в системе по времени ответа (если пользователь не найден — быстрый ответ, если найден — отправка письма).

**Исправление:** Всегда выполнять одинаковый объём работы.

---

## 2. Протечки абстракций между слоями

Это главная архитектурная проблема проекта. Слои не изолированы.

### ✅ 2.1 Контроллер -> БД (бизнес-логика в контроллере)

**Файл:** `app/controllers/events_controller.rb:67-118`

Контроллер вручную создаёт `FuzzyDate`, управляет ассоциациями, обновляет JSONB-кеш таймлайнов:

```ruby
# Строки 95-105: прямое манипулирование JSONB-кешем в контроллере
current_events = timeline.cached_events_for_display[category_key] || []
timeline.update(
  cached_events_for_display: timeline.cached_events_for_display.merge(...)
)
```

**Риск:** Race condition при конкурентных запросах на обновление одного таймлайна. Бизнес-логика размазана между контроллером и моделью.

**Исправление:** Выделить `Events::CreateService` с транзакцией и блокировкой:

```ruby
class Events::CreateService
  def call(params:, user:)
    ActiveRecord::Base.transaction do
      event = build_event(params, user)
      create_fuzzy_dates!(event, params)
      event.save!
      update_timelines!(event)
      event
    end
  end
end
```

### ✅ 2.2 Контроллер -> SQL (raw SQL в контроллере)

**Файл:** `app/controllers/events_controller.rb:170-175`

```ruby
def apply_search(scope)
  scope.joins(:start_date)
       .where("events.title ILIKE :q OR ...", q: "%#{params[:search]}%")
end
```

Raw SQL и `Arel.sql` не должны жить в контроллере.

**Исправление:** Вынести в scope на модели или в Query Object.

### 2.3 Сериализатор -> БД (запросы в сериализаторе)

**Файл:** `app/serializers/timeline_serializer.rb:12-23`

```ruby
def categorized_events
  person_event_ids = object.cached_events_for_display["person"] || []
  # ...
  serialize_events(Event.where(id: person_event_ids).joins(:start_date).order(...))
end
```

Сериализатор выполняет SQL-запросы. Это нарушение SRP — сериализатор должен только трансформировать данные.

**Файл:** `app/serializers/person_serializer.rb:13-20`

```ruby
def birth_year
  object.events.find { |e| e.title == 'Birth' }&.start_date&.year
end
```

Ruby enumeration по loaded association для каждого Person. При 25 людях с 10 событиями = 250 итераций.

**Исправление:** Загружать данные в контроллере, передавать в сериализатор готовый результат.

### 2.4 EventSerializer <-> PersonSerializer — циклическая зависимость

**Файл:** `app/serializers/event_serializer.rb:9` и `app/serializers/person_serializer.rb`

- EventSerializer включает PersonSerializer для каждого person
- PersonSerializer включает все events для каждого person

При неосторожном includes это создаёт бесконечную рекурсию или гигантский payload.

**Исправление:** Использовать разные сериализаторы для вложенных контекстов:

```ruby
class EventSerializer < ActiveModel::Serializer
  has_many :people, serializer: PersonBriefSerializer  # только id, name
end
```

### 2.5 Воркеры напрямую обращаются к БД без авторизации

**Файл:** `app/workers/global_events_worker.rb:63-66`, `app/workers/gedcom/upload_worker.rb:8-10`

Воркеры получают ID записи и делают `find` без проверки, что вызывающий имел право на эту запись. Безопасно только если ID пришёл из авторизованного контекста контроллера, но нет гарантий.

### ✅ 2.6 Дублирование логики между воркерами

**Файл:** `app/workers/global_events_worker.rb:36-60` и `app/workers/local_events_worker.rb:34-54`

Метод `calculate_date_range` скопирован один в один.

**Исправление:** Выделить в shared concern или сервис.

---

## 3. N+1 запросы

| Место | Файл | Проблема | Severity |
|-------|-------|----------|----------|
| Events index | `events_controller.rb:7` | Не включает `:people`, `:end_date` | HIGH |
| People index (gedcom_files) | `people_controller.rb:13` | `gf.file.filename.to_s` — загрузка attachment на каждой итерации | HIGH |
| PersonSerializer.birth_year | `person_serializer.rb:13-16` | Ruby `.find` по events для каждого Person (250+ итераций на страницу) | HIGH |
| TimelineSerializer.categorized_events | `timeline_serializer.rb:19` | Три отдельных `Event.where(id:)` запроса | HIGH |
| BookSerializer.events_count | `book_serializer.rb:16` | `object.events.count` без counter_cache | MEDIUM |
| Timelines index | `timelines_controller.rb:7` | Не включает `:user` | MEDIUM |

**План исправлений:**

```ruby
# EventsController
Event.includes(:creator, :source, :start_date, :end_date, :location, :people)

# PeopleController
@gedcom_files = current_user.gedcom_files.with_attached_file

# Book — добавить counter_cache
add_column :books, :events_count, :integer, default: 0
```

---

## 4. Схема БД и целостность данных

### ✅ 4.1 Отсутствующие индексы

| Таблица | Колонка | Влияние |
|---------|---------|---------|
| events | creator_id | **CRITICAL** — фильтрация по автору |
| events | category | Фильтрация по типу события |
| people | first_name, last_name | Поиск и сортировка |
| fuzzy_dates | year | Запросы по диапазону дат |
| sessions | user_id | Поиск активных сессий |
| locations | place | Поиск по месту |

```ruby
class AddMissingIndexes < ActiveRecord::Migration[8.0]
  def change
    add_index :events, :creator_id
    add_index :events, :category
    add_index :people, [:first_name, :last_name]
    add_index :fuzzy_dates, :year
    add_index :sessions, :user_id
    add_index :locations, :place
  end
end
```

### ✅ 4.2 Inconsistent dependent strategy

| Модель | Стратегия | Проблема |
|--------|-----------|----------|
| Book | `dependent: :destroy` | OK |
| GedcomFile | `dependent: :nullify` | Осиротевшие события с `source_id=NULL` |

**Исправление:** Привести GedcomFile к `dependent: :destroy` или добавить cleanup job.

### ⚠️ 4.3 Отсутствующие NOT NULL constraints

- `fuzzy_dates.year` — можно создать запись без года
- `locations.place` — можно создать пустую локацию
- `sessions.user_id` — можно создать сессию без пользователя

Примечание: `locations.place` и `sessions.user_id` закрыты, а `fuzzy_dates.year` намеренно оставлен nullable, потому что по правилам проекта дата может быть без года.

### 4.4 Дубликаты Location

Нет unique constraint на `locations.place`. Два события в одном месте создают две записи Location.

**Исправление:**
```ruby
add_index :locations, :place, unique: true
# + Location.find_or_create_by!(place:)
```

### 4.5 Race condition в cached_events_for_display

`Timeline.cached_events_for_display` — JSONB-колонка, которая обновляется частями через `merge`. При конкурентных запросах данные теряются.

**Исправление долгосрочное:** Создать join-таблицу `timeline_events` вместо JSONB-кеша.

---

## 5. Контроллеры

### 5.1 Fat controller: EventsController

~200 строк с бизнес-логикой, raw SQL, FuzzyDate creation, timeline cache update. Нарушает SRP.

**План:** Выделить `Events::CreateService`, `Events::SearchQuery`, `Events::FilterQuery`.

### ✅ 5.2 Inconsistent авторизация

| Контроллер | policy_scope | authorize | Статус |
|------------|-------------|-----------|--------|
| TimelinesController | YES | YES | OK |
| PeopleController | NO | YES (show/update/destroy) | Partial |
| EventsController | NO | NO (index) | **BROKEN** |
| BooksController | NO | YES (show/update/destroy) | Partial |

### ✅ 5.3 Хардкод русского текста

**Файлы:** `passwords_controller.rb:21`, `confirmations_controller.rb:23`

```ruby
"Пароль успешно изменён"
```

Должно быть в I18n.

### 5.4 BooksController#show — redirect вместо render

GET /books/:id перенаправляет вместо показа ресурса. Нарушение REST.

---

## 6. Сервисный слой

### ⚠️ 6.1 Inconsistent инициализация

- `Gedcom::CreatePerson`, `Gedcom::CreateEvent` — `Dry::Initializer.define` с lambda
- `Books::DateParser` — классический `initialize`

Должен быть один паттерн.

Примечание: часть сервисов уже приведена к единому стилю, но пункт закрыт не полностью.

### ✅ 6.2 Books::CreateEvents — нет идемпотентности

**Файл:** `app/services/book/create_events.rb:14-17`

Повторный вызов с теми же данными создаёт дубликаты. Вызывается из внешнего API callback.

**Исправление:** Добавить `unique_by` или проверку `(source_type, source_id, page_number, title)`.

### ✅ 6.3 Gedcom::CreateEvent — race condition

**Файл:** `app/services/gedcom/create_event.rb:76`

```ruby
FuzzyDate.find_or_create_by!(original_text:)
```

Два конкурентных воркера с одной датой могут оба пройти `find` и оба вызвать `create!`.

**Исправление:** Добавить unique index на `fuzzy_dates.original_text` + `rescue ActiveRecord::RecordNotUnique`.

### ✅ 6.4 TimelinePdf::PdfGenerator — system call без timeout

**Файл:** `app/services/timeline_pdf/pdf_generator.rb:56-57`

`pdflatex` может зависнуть навсегда. Нет ограничения по времени или ресурсам.

**Исправление:** `Timeout.timeout(60) { system(...) }` или `Open3.capture3` с kill.

### 6.5 Нет иерархии кастомных ошибок

Сервисы либо поднимают стандартные AR-ошибки, либо молча возвращают nil. Нет `ApplicationError`, `ValidationError`, `ExternalApiError`.

---

## 7. Воркеры

### ✅ 7.1 Отсутствие error handling

| Воркер | rescue? | retry? | Logging? |
|--------|---------|--------|----------|
| Gedcom::UploadWorker | NO | NO | NO |
| Gedcom::CreatePersonWorker | NO | NO | NO |
| Books::UploadWorker | NO | NO | NO |
| Gedcom::TimelineWorker | NO | NO | NO |
| PdfGeneratorWorker | YES | YES (3) | YES |

Только `PdfGeneratorWorker` обрабатывает ошибки.

**Исправление:** Добавить базовый concern:

```ruby
module WorkerErrorHandling
  extend ActiveSupport::Concern

  included do
    sidekiq_retries_exhausted do |job, ex|
      Rails.logger.error("Worker #{job['class']} failed: #{ex.message}")
      Sentry.capture_exception(ex)
    end
  end
end
```

### ⚠️ 7.2 N API calls без batching

**Файл:** `app/workers/gedcom/create_person_worker.rb:9-10`

Один HTTP-запрос к GedcomApi на каждого person. 100 людей = 100 запросов. Нет rate limiting.

Примечание: job fan-out уже сокращён batching'ом на нашей стороне, но внешний API по-прежнему остаётся per-person.

### ✅ 7.3 Fire-and-forget без обратной связи

Пользователь запускает GEDCOM/PDF обработку и не может узнать статус. Нужен polling endpoint или WebSocket.

---

## 8. Сериализаторы

### 8.1 Запросы в сериализаторах (см. раздел 2.3)

### ✅ 8.2 TimelineSerializer — несуществующий атрибут

**Файл:** `app/serializers/timeline_serializer.rb:9`

```ruby
object.person&.given_name
```

В модели Person нет поля `given_name` — есть `first_name`. Либо баг, либо делегация не видна.

### ✅ 8.3 CreatorSerializer — избыточен

Возвращает только `id` и `email`. Можно заменить inline hash в родительском сериализаторе.

### ✅ 8.4 Нет тестов для 4 из 7 сериализаторов

PersonSerializer, CreatorSerializer, LocationSerializer, TimelineSerializer — без тестов.

---

## 9. Политики (Pundit)

### 9.1 Критическая проблема: EventPolicy (см. раздел 1.1)

### 9.2 Отсутствующие тесты политик

| Модель | Политика | Статус |
|--------|----------|--------|
| Event | EventPolicy | **BROKEN scope** |
| Person | PersonPolicy | Нет тестов |
| GedcomFile | GedcomFilePolicy | Нет тестов |
| Timeline | TimelinePolicy | OK |
| Book | BookPolicy | OK |
| Session | — | Нет политики |
| Location | — | Нет политики |

### 9.3 Inconsistent naming

- BookPolicy/EventPolicy: `record.creator_id == user.id`
- PersonPolicy: `record.user_id == user.id`

Разные FK-имена для одного паттерна ownership.

---

## 10. Фронтенд

### 10.1 God-компонент: Timelines/Show.jsx

**756 строк**. Включает:
- Рендер таймлайна
- Форму создания события (`CreateEventForm` определён внутри файла)
- Модальное окно деталей
- Удаление событий
- Вычисление вертикальных позиций

**Исправление:** Разбить на 5+ компонентов: `TimelineVisualization`, `CreateEventForm`, `EventDetailModal`, `EventCard`, `TimelineControls`.

### 10.2 Дублирование кода

| Что | Где дублируется |
|-----|-----------------|
| `buildPageNumbers()` | Events/Index.jsx, People/Index.jsx |
| Empty state pattern | Books/Index, Events/Index, People/Index |
| Error display | Books/Index, Events/Form, Registration |
| Delete confirmation | Books, Events, People, Timelines |
| Button styles | Все страницы |

**Исправление:** Создать UI-kit: `<Pagination>`, `<EmptyState>`, `<ErrorList>`, `<ConfirmDialog>`, `<Button>`.

### 10.3 Inconsistent формы

- `Books/Index.jsx` — manual FormData + `router.post()`
- `Events/Form.jsx` — Inertia `useForm` hook
- `People/Form.jsx` — Inertia `useForm` hook

**Исправление:** Стандартизировать на `useForm` везде.

### 10.4 Нет клиентской валидации

Все формы полагаются только на серверную валидацию. Нет `required`, `minLength`, `pattern` для критических полей (пароль, email).

### 10.5 Performance: отсутствие мемоизации

**Файл:** `app/frontend/pages/Timelines/Show.jsx`

- `handleEventClick` определяется внутри render без `useCallback`
- `groupEventsByYear` вызывается повторно без `useMemo`
- Event handlers в циклах создаются заново каждый рендер

### 10.6 Accessibility (a11y)

- Нет `aria-label` на icon-only кнопках
- Нет `aria-sort` на сортируемых заголовках таблиц
- Категории событий на таймлайне различаются только цветом (colorblind-unfriendly)
- Модальные окна не обрабатывают Escape
- Маленькие touch targets (кнопка удаления 4x4)

### 10.7 Yandex Maps — API key exposure

**Файл:** `app/frontend/components/YandexMapPicker.jsx:81`

API-ключ встраивается в URL скрипта на клиенте. Нет SRI (Subresource Integrity).

### 10.8 No code splitting

Все страницы загружаются в один бандл. Vite поддерживает dynamic imports — нужно использовать.

---

## 11. Тесты

### 11.1 Покрытие по слоям

| Слой | Файлов с тестами / Всего | Покрытие |
|------|--------------------------|----------|
| Models | 3 / 11 (2 пустых) | ~25% |
| Request specs | 8 / 17 контроллеров | ~47% |
| Policies | 4 / 8 | ~50% |
| Serializers | 3 / 7 | ~43% |
| Services | 3 / 7 | ~43% |
| Workers | 5 / 7 | ~71% |
| Mailers | 0 / 3 | 0% |
| Frontend | 0 | 0% |

### 11.2 Пустые spec-файлы

- `spec/models/user_spec.rb` — только `pending`
- `spec/models/create_fuzzy_date_spec.rb` — только `pending`

### 11.3 Полностью отсутствующие тесты

**Модели:** Person, Location, Session, FuzzyDate (поведение), Current
**Контроллеры:** SessionsController, ConfirmationsController, PasswordsController, HomeController, BaseController, ApplicationController
**Сервисы:** Gedcom::CreateEvent, Gedcom::CreatePerson, TimelinePdf::PdfGenerator, TimelinePdf::EventGrouper, TimelinePdf::LatexTemplate, FaradayClient
**Воркеры:** PdfGeneratorWorker (partial), GlobalEventsWorker
**Сериализаторы:** PersonSerializer, CreatorSerializer, LocationSerializer, TimelineSerializer
**Мейлеры:** UserMailer, PasswordsMailer, ApplicationMailer
**Политики:** PersonPolicy, GedcomFilePolicy

### 11.4 Сильные стороны тестов

- Date parsing: отличное покрытие (70+ кейсов для русских дат, 60+ для GEDCOM)
- Request specs: полный CRUD с проверкой авторизации
- Integration specs: правильное мокирование внешних API через WebMock
- Worker specs: корректное использование Sidekiq.testing.fake!

### 11.5 Нет фронтенд-тестов

Ни одного Jest/Vitest теста для React-компонентов.

---

## 12. Зависимости

| Gem | Текущая | Последняя | Риск |
|-----|---------|-----------|------|
| sidekiq | ~6.5 | 7.x | Performance improvements |
| active_model_serializers | ~0.10.0 | 0.10.15 | Bug fixes |
| faker | 1.9.1 | 19.x | **Очень устарел** |

**Рекомендация:** `faker` критически устарел (2019 vs 2026). `sidekiq` 7.x даёт лучшую производительность. AMS стоит рассмотреть замену на `alba` или `blueprinter` — AMS фактически не поддерживается.

---

## 13. Сводная таблица и план исправлений

### Приоритет 1 — Безопасность (неделя 1)

| # | Задача | Файл | Effort |
|---|--------|------|--------|
| 1.1 | Исправить EventPolicy.Scope | `event_policy.rb` | S |
| 1.2 | Добавить authorize в EventsController#index | `events_controller.rb` | S |
| 1.3 | Добавить policy_scope в PeopleController#index | `people_controller.rb` | S |
| 1.4 | Ограничить TTL сессии | `authentication.rb` | S |
| 1.5 | Добавить timing-safe comparison в PasswordsController | `passwords_controller.rb` | S |

### Приоритет 2 — Целостность данных (неделя 1-2)

| # | Задача | Effort |
|---|--------|--------|
| 2.1 | Миграция: добавить отсутствующие индексы (creator_id, category, etc.) | S |
| 2.2 | Миграция: unique index на locations.place | S |
| 2.3 | Исправить GedcomFile dependent: :nullify -> :destroy | S |
| 2.4 | Добавить идемпотентность в Books::CreateEvents | M |
| 2.5 | Исправить race condition в FuzzyDate.find_or_create_by! | S |

### Приоритет 3 — Протечки абстракций (неделя 2-3)

| # | Задача | Effort |
|---|--------|--------|
| 3.1 | Выделить Events::CreateService из контроллера | L |
| 3.2 | Выделить Events::SearchQuery из контроллера | M |
| 3.3 | Убрать SQL-запросы из сериализаторов (TimelineSerializer, PersonSerializer) | L |
| 3.4 | Разделить EventSerializer/PersonSerializer (разорвать цикл) | M |
| 3.5 | Выделить shared DateRangeCalculator из воркеров | S |

### Приоритет 4 — N+1 и Performance (неделя 2-3)

| # | Задача | Effort |
|---|--------|--------|
| 4.1 | Исправить includes в EventsController | S |
| 4.2 | Исправить N+1 в PeopleController (gedcom_files attachments) | S |
| 4.3 | Оптимизировать PersonSerializer.birth_year | M |
| 4.4 | Добавить counter_cache для Book.events_count | S |
| 4.5 | Добавить Timeout к pdflatex | S |

### Приоритет 5 — Воркеры (неделя 3)

| # | Задача | Effort |
|---|--------|--------|
| 5.1 | Добавить error handling concern для всех воркеров | M |
| 5.2 | Добавить retry strategy с backoff | M |
| 5.3 | Добавить rate limiting для внешних API | M |
| 5.4 | Добавить статус-эндпоинт для async операций | L |

### Приоритет 6 — Фронтенд (неделя 3-4)

| # | Задача | Effort |
|---|--------|--------|
| 6.1 | Разбить Timelines/Show.jsx на компоненты | L |
| 6.2 | Создать shared UI-kit (Pagination, Button, EmptyState, ErrorList) | L |
| 6.3 | Стандартизировать формы на useForm | M |
| 6.4 | Добавить code splitting (dynamic imports) | M |
| 6.5 | Исправить accessibility (aria-labels, keyboard nav, color+icon) | M |

### Приоритет 7 — Тесты (параллельно с остальным)

| # | Задача | Effort |
|---|--------|--------|
| 7.1 | Написать тесты для User model | S |
| 7.2 | Написать тесты для Person, FuzzyDate models | M |
| 7.3 | Написать тесты для всех Mailers | M |
| 7.4 | Написать тесты для untested Policies | M |
| 7.5 | Написать тесты для SessionsController, PasswordsController | M |
| 7.6 | Настроить Vitest для фронтенд-компонентов | L |
| 7.7 | Дописать тесты для сериализаторов | M |

### Приоритет 8 — Долгосрочные улучшения

| # | Задача | Effort |
|---|--------|--------|
| 8.1 | Заменить JSONB cached_events_for_display на join-таблицу timeline_events | XL |
| 8.2 | Заменить AMS на alba/blueprinter | L |
| 8.3 | Добавить иерархию кастомных ошибок | M |
| 8.4 | Добавить I18n вместо хардкода русского текста | M |
| 8.5 | Обновить sidekiq до 7.x, faker до 19.x | M |
| 8.6 | Добавить audit trail для изменений событий | L |

---

**Effort:** S = 1-2 часа, M = 3-8 часов, L = 1-3 дня, XL = 1+ неделя

**Общая оценка:** Проект имеет хорошую основу — правильный выбор стека, чистые модели, сильные тесты для date parsing. Основные проблемы: дырявая авторизация событий, протечки бизнес-логики из сервисов в контроллеры/сериализаторы, отсутствие error handling в воркерах, и монолитный фронтенд. Критические исправления безопасности (раздел 1) нужно внести немедленно.
