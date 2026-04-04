// api2/index.js  Роутер для API v2 (/api/v2)
// Экспортирует фабрику: createApi2Router({ version })

const express = require('express')

module.exports = function createApi2Router({ version = '2.0' } = {}) {
  const router = express.Router()

  //  Middleware: добавляем версию в каждый ответ
  router.use((req, res, next) => {
    res.setHeader('X-API-Version', version)
    next()
  })

  //  Middleware: логирование
  router.use((req, res, next) => {
    console.log(`[API/v${version}] ${req.method} ${req.path}`)
    next()
  })

  // 
  //  МАРШРУТЫ API v2
  // 

  // Корень API v2
  router.get('/', (req, res) => {
    res.json({
      api: 'Express Task API',
      version,
      endpoints: [
        { path: '/', method: 'GET', description: 'Информация об API' },
        { path: '/status', method: 'GET', description: 'Статус сервиса' },
        { path: '/echo', method: 'POST', description: 'Эхо-тест' }
      ],
      timestamp: new Date().toISOString()
    })
  })

  // Статус сервиса
  router.get('/status', (req, res) => {
    res.json({
      status: 'operational',
      version,
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024 | 0, // MB
      requestId: req.requestId
    })
  })

  // Эхо-тест с расширенными данными
  router.post('/echo', express.json(), (req, res) => {
    res.json({
      apiVersion: version,
      received: req.body,
      meta: {
        method: req.method,
        path: req.path,
        clientIP: req.clientIP,
        timestamp: new Date(req.requestId).toISOString(),
        requestId: req.requestId
      }
    })
  })

  // Пример: пагинация
  router.get('/items', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const items = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      name: `Item #${(page - 1) * limit + i + 1}`,
      version
    }))

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total: 100, // пример
        pages: 10
      },
      apiVersion: version
    })
  })

  //  Обработчик 404
  router.use((req, res) => {
    res.status(404).json({ 
      error: 'Endpoint not found', 
      apiVersion: version,
      path: req.path 
    })
  })

  return router
}
