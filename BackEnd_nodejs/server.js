const express = require('express');
const app = express();
const port = 8001;
const mysql = require('mysql2');

// 解析请求体中的 JSON 数据
app.use(express.json());

// 步骤1：先用无database连接，创建数据库
const poolNoDb = mysql.createPool({
  host: '212.129.244.183',
  user: 'root',
  password: 'Lili23307110',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
});

const DB_NAME = 'msg_servo_demo';

poolNoDb.query(
  "CREATE DATABASE IF NOT EXISTS `msg_servo_demo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  (err) => {
    if (err) {
      console.error('创建数据库失败:', err);
      return;
    }
    poolNoDb.end(); // 关闭无db连接池

    // 步骤2：用带database的连接池，创建表
    const pool = mysql.createPool({
      host: '212.129.244.183',
      user: 'root',
      password: 'Lili23307110',
      database: DB_NAME,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    global.pool = pool; // 挂到全局，供后续API使用

    const createTableSql = `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      time DATETIME NOT NULL
    )`;
    pool.query(createTableSql, (err) => {
      if (err) {
        console.error('创建留言表失败:', err);
      } else {
        console.log('留言表已准备好');
      }
    });
  }
);

// 内存存储留言
let messages = [];

// 获取所有留言
app.get('/messages', (req, res) => {
  res.json({ messages });
});

// 添加留言（写入MySQL）
app.post('/messages', (req, res) => {
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ error: 'user和content字段必填' });
  }
  const time = new Date();
  const sql = 'INSERT INTO messages (user, content, time) VALUES (?, ?, ?)';
  global.pool.query(sql, [user, content, time], (err, result) => {
    if (err) {
      console.error('插入留言失败:', err);
      return res.status(500).json({ error: '数据库写入失败' });
    }
    res.status(201).json({ message: '留言成功', id: result.insertId });
  });
});

// 设置根路由
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
