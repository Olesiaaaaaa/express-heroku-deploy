// server.js — ПРОСТАЯ ВЕРСИЯ, порт 3336
// 🌸 Теперь по главной ссылке открывается index.html с цветочками!

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3336 // 🔹 Только этот порт
const PUBLIC_DIR = path.join(__dirname, 'public')

// 🔹 Парсеры для JSON и форм
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🔹 Логирование запросов (просто в консоль)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`)
  next()
})

// 🔹 API маршруты (теперь на /api, чтобы не мешать статике)
app.get('/api', (req, res) => {
  res.json({ message: 'Привет, мир!', port: PORT })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

// 🔹 Раздача статики (файлы из папки public)
// ✅ Теперь при открытии / будет показан index.html
app.use(express.static(PUBLIC_DIR))

// 🔹 404 — если файл не найден
app.use((req, res) => {
  res.status(404).send(`❌ Страница не найдена: ${req.url}`)
})

// 🔹 Запуск сервера
app.listen(PORT, () => {
  console.log(`\n✅ Сервер: http://localhost:${PORT}`)
  console.log(`📁 Статика: ${PUBLIC_DIR}`)
  console.log(`🌸 Главная: http://localhost:${PORT}/ → index.html`)
  console.log(`🔗 API:    http://localhost:${PORT}/api\n`)
})
