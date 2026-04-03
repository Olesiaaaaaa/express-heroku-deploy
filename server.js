// server.js  Express + модули + маршруты задания
const express = require('express')
const path = require('path')

// Импорт фабрик роутеров
const createApiRouter = require('./api/index.js')
const createApi2Router = require('./api2/index.js')

const app = express()
const PORT = process.env.PORT || 3336
const PUBLIC_DIR = path.join(__dirname, 'public')

// Глобальные парсеры
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Глобальный middleware: метаданные
app.use((req, res, next) => {
  req.requestId = Date.now()
  req.startTime = Date.now()
  req.clientIP = req.ip || req.connection?.remoteAddress || 'unknown'
  req.currentUser = { id: 1, name: 'Олеся', role: 'admin' }
  console.log(`\n [${req.requestId}] ${req.method} ${req.url} от ${req.clientIP}`)
  next()
})

// 
//  МАРШРУТЫ ЗАДАНИЯ (ОБЯЗАТЕЛЬНО ПЕРЕД СТАТИКОЙ!)
// 

// /login  возвращает логин в MOODLE (plain text)
app.get('/login', (req, res) => {
  res.type('text/plain')
  res.send('14121956vi')
})

// /deg/:x1/:x2  возведение в степень (plain text)
app.get('/deg/:x1/:x2', (req, res) => {
  const x1 = parseFloat(req.params.x1)
  const x2 = parseFloat(req.params.x2)
  const result = Math.pow(x1, x2)
  res.type('text/plain')
  res.send(String(result))
})

// 
//  ПОДКЛЮЧЕНИЕ МОДУЛЬНЫХ РОУТЕРОВ
// 

const apiRouter = createApiRouter({ prefix: '', protected: false, logger: true })
app.use('/api', apiRouter)

const apiProtectedRouter = createApiRouter({ prefix: '/secure', protected: true, logger: true })
app.use('/api', apiProtectedRouter)

const api2Router = createApi2Router({ version: '2.0' })
app.use('/api/v2', api2Router)

// 
//  СТАТИКА И 404 (ПОСЛЕ ВСЕХ МАРШРУТОВ!)
// 
app.use(express.static(PUBLIC_DIR))

app.use((req, res) => {
  console.warn(` [${req.requestId}] 404: ${req.url}`)
  res.status(404).send(` Страница не найдена: ${req.url}`)
})

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(` [${req.requestId}] Ошибка:`, err.message)
  res.status(500).json({ error: 'Внутренняя ошибка', message: err.message, requestId: req.requestId })
})

// Запуск
app.listen(PORT, () => {
  console.log(`\n Server: http://localhost:${PORT}`)
  console.log(` Task routes: /login, /deg/:x1/:x2\n`)
})
