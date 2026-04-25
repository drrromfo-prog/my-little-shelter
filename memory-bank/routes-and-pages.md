# Routes And Pages

Server routes:

- `GET /`
  - serves the main application shell
- `GET /stats`
  - serves the standalone dashboard page
- `GET /healthz`
  - Railway healthcheck endpoint

Data APIs:

- `GET /api/items`
- `POST /api/items`
- `POST /api/items/import`
- `PUT /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`
- `DELETE /api/items`

Stats APIs:

- `GET /stats/summary`
- `GET /stats/monthly-trend`
- `GET /stats/category-distribution`
- `GET /stats/tag-distribution`

Import / proxy APIs:

- `GET /api/fetch-douban`
- `GET /api/image-proxy`

Current main-page views inside `/`:

- 全部
- 电影
- 电视剧
- 动漫
- 纪录片
- 书籍
- 待看 / 待读
- 正在进行
- 已看 / 已读
- 金句
- 心情日历
- 统计

Removed views:

- 时间线: removed in the latest simplification pass
- 关于: removed earlier from the left navigation and main shell
