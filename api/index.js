// api/index.js  Модульный роутер для /api
// Экспортирует фабрику: createApiRouter({ prefix, protected, logger })

const express = require('express')

module.exports = function createApiRouter({ prefix = '', protected = false, logger = true } = {}) {
  const router = express.Router()

  //  Middleware: логирование (если включено)
  if (logger) {
    router.use((req, res, next) => {
      const tag = protected ? '[API/secure]' : '[API]'
      console.log(`${tag} ${req.method} ${prefix}${req.path}`)
      next()
    })
  }

  //  Middleware: защита маршрута (если включена)
  if (protected) {
    router.use((req, res, next) => {
      // В реальном проекте здесь проверка JWT/сессии
      if (req.currentUser?.role === 'admin' || req.accessGranted) {
        next()
      } else {
        res.status(403).json({ error: 'Доступ запрещён', message: 'Требуется авторизация' })
      }
    })
  }

  // 
  //  МАРШРУТЫ
  // 

  // Корень API
  router.get('/', (req, res) => {
    res.json({
      message: 'Привет, мир! ',
      port: process.env.PORT || 3336,
      requestId: req.requestId,
      prefix,
      protected
    })
  })

  // Health check (опционально  раскомментируйте, если нужно)
  // router.get('/health', (req, res) => {
  //   res.json({
  //     status: 'ok',
  //     service: `api${prefix}`,
  //     timestamp: new Date().toISOString(),
  //     requestId: req.requestId
  //   })
  // })

  // Пример: получение данных пользователя
  router.get('/user', (req, res) => {
    res.json({
      user: req.currentUser,
      clientIP: req.clientIP,
      requestId: req.requestId
    })
  })

  // Пример: POST-эндпоинт с валидацией
  router.post('/echo', express.json(), (req, res) => {
    const { message, data } = req.body
    if (!message) {
      return res.status(400).json({ error: 'Поле "message" обязательно' })
    }
    res.json({
      received: message,
      data: data || null,
      timestamp: new Date(req.requestId).toISOString(),
      requestId: req.requestId
    })
  })

  // Пример: вычисления
  router.get('/calc/:op/:a/:b', (req, res) => {
    const { op, a, b } = req.params
    const numA = parseFloat(a), numB = parseFloat(b)
    
    if (isNaN(numA) || isNaN(numB)) {
      return res.status(400).json({ error: 'Параметры должны быть числами' })
    }

    let result
    switch(op) {
      case 'add': result = numA + numB; break
      case 'sub': result = numA - numB; break
      case 'mul': result = numA * numB; break
      case 'div': 
        if (numB === 0) return res.status(400).json({ error: 'Деление на ноль' })
        result = numA / numB; break
      default: return res.status(400).json({ error: `Неизвестная операция: ${op}` })
    }

    res.json({
      operation: `${numA} ${op} ${numB}`,
      result,
      requestId: req.requestId
    })
  })

  //  Обработчик 404 для этого роутера
  router.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден', path: `${prefix}${req.path}` })
  })

  return router
}
