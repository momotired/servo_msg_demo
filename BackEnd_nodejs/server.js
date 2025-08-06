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

console.log('🚀 开始连接数据库并初始化...');
poolNoDb.query(
  "CREATE DATABASE IF NOT EXISTS `msg_servo_demo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  (err) => {
    if (err) {
      console.error('❌ 创建数据库失败:', err);
      return;
    }
    console.log('✅ 数据库 msg_servo_demo 创建/确认成功');
    poolNoDb.end(); // 关闭无db连接池

    // 步骤2：用带database的连接池，创建表
    console.log('🔗 创建带数据库名的连接池...');
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

    // 测试连接池是否正常
    pool.query('SELECT 1', (err, result) => {
      if (err) {
        console.error('❌ 连接池测试失败:', err);
        return;
      }
      console.log('✅ 连接池测试成功:', result);
      
      global.pool = pool; // 挂到全局，供后续API使用

      const createTableSql = `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        time DATETIME NOT NULL
      )`;
      console.log('📝 执行创建表SQL:', createTableSql);
      pool.query(createTableSql, (err) => {
        if (err) {
          console.error('❌ 创建留言表失败:', err);
        } else {
          console.log('✅ 留言表已准备好');
          
          // 验证表是否真的存在
          pool.query('SHOW TABLES', (err, tables) => {
            if (err) {
              console.error('❌ 查询表列表失败:', err);
            } else {
              console.log('📋 当前数据库中的表:', tables);
            }
          });
          
          // 验证表结构
          pool.query('DESCRIBE messages', (err, structure) => {
            if (err) {
              console.error('❌ 查询表结构失败:', err);
            } else {
              console.log('🏗️ messages表结构:', structure);
            }
          });
        }
      });
    });
  }
);

// 移除内存存储留言（已改用MySQL）
// let messages = [];

// 获取所有留言（从MySQL读取）
app.get('/messages', (req, res) => {
  if (!global.pool) {
    return res.status(500).json({ error: '数据库连接未就绪' });
  }
  console.log('📖 正在从数据库读取留言...');
  global.pool.query('SELECT * FROM messages ORDER BY time DESC', (err, results) => {
    if (err) {
      console.error('❌ 查询留言失败:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }
    console.log('✅ 成功查询到', results.length, '条留言');
    res.json({ messages: results });
  });
});

// 添加留言（写入MySQL）
app.post('/messages', (req, res) => {
  if (!global.pool) {
    return res.status(500).json({ error: '数据库连接未就绪' });
  }
  console.log('📝 收到POST请求，req.body:', req.body);
  
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ error: 'user和content字段必填' });
  }
  
  const time = new Date();
  const sql = 'INSERT INTO messages (user, content, time) VALUES (?, ?, ?)';
  console.log('💾 正在插入留言:', { user, content, time });
  
  global.pool.query(sql, [user, content, time], (err, result) => {
    if (err) {
      console.error('❌ 插入留言失败:', err);
      return res.status(500).json({ error: '数据库写入失败' });
    }
    console.log('✅ 留言插入成功，ID:', result.insertId);
    
    // 插入后立即查询验证
    global.pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId], (err, rows) => {
      if (err) {
        console.error('❌ 验证查询失败:', err);
      } else {
        console.log('🔍 插入后验证查询结果:', rows);
      }
    });
    
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
