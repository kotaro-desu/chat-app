require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5001;
const SECRET_KEY = "secretKey"; // JWTのシークレットキー

// SQLite データベースの接続
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("SQLite接続エラー:", err.message);
  } else {
    console.log("SQLiteデータベースに接続しました");
  }
});

// 初回実行時にテーブル作成
db.serialize(() => {
  // FOREIGN KEY 制約を有効化
  db.get("PRAGMA foreign_keys = ON");

  // users テーブルの作成
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`
  );

  // questions テーブルの作成
  db.run(
    `CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      userId TEXT NOT NULL,
      userRole TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`
  );

  // replies テーブルの作成
  db.run(
    `CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL,
      content TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (questionId) REFERENCES questions (id)
    )`
  );
});



app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // すべてのオリジンを許可（必要に応じて特定のドメインに制限）
    methods: ["GET", "POST", "PUT", "DELETE"], // 許可するHTTPメソッド
    allowedHeaders: ["Content-Type", "Authorization"], // 許可するヘッダー
  })
);

// 返信投稿API
app.post("/questions/:id/replies", authenticateToken, (req, res) => {
  const questionId = req.params.id;
  const { content } = req.body;
  const { id: userId, role: userRole } = req.user; // ユーザーのロールを取得

  if (!content) {
    console.error("返信内容が空です");
    return res.status(400).json({ message: "返信内容を入力してください" });
  }

  db.run(
    "INSERT INTO replies (questionId, content, userId, userRole, createdAt) VALUES (?, ?, ?, ?, ?)",
    [questionId, content, userId, userRole, new Date().toISOString()],
    function (err) {
      if (err) {
        console.error("返信投稿エラー:", err);
        return res.status(500).json({ message: "返信投稿に失敗しました", error: err.message });
      }
      res.status(201).json({
        message: "返信が投稿されました",
        reply: {
          id: this.lastID,
          questionId,
          content,
          userId,
          userRole,
          createdAt: new Date().toISOString(),
        },
      });
    }
  );
});



// 返信取得API
app.get("/questions/:id/replies", authenticateToken, (req, res) => {
  const questionId = req.params.id;

  db.all(
    "SELECT * FROM replies WHERE questionId = ?",
    [questionId],
    (err, rows) => {
      if (err) {
        console.error("返信取得エラー:", err);
        return res.status(500).json({ message: "返信の取得に失敗しました" });
      }
      res.json(rows);
    }
  );
});


// JWTトークン検証ミドルウェア
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("トークンが提供されていません");
    return res.status(401).json({ message: "認証エラー: トークンが必要です" });
  }

  jwt.verify(token, "secretKey", (err, user) => {
    if (err) {
      console.log("トークンの検証に失敗しました:", err.message);
      return res.status(403).json({ message: "認証エラー: トークンが無効です" });
    }

    console.log("トークンが認証されました:", user);
    req.user = user;
    next();
  });
}



// 生徒登録API
app.post("/register", async (req, res) => {
  const { id, password } = req.body;

  db.get("SELECT * FROM users WHERE id = ?", [id], async (err, row) => {
    if (err) return res.status(500).json({ message: "データベースエラー" });
    if (row) return res.status(400).json({ message: "このIDは既に登録されています" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (id, password, role) VALUES (?, ?, ?)", [id, hashedPassword, "student"], (err) => {
      if (err) return res.status(500).json({ message: "登録に失敗しました" });
      res.status(201).json({ message: "生徒登録成功" });
    });
  });
});

// ログインAPI
app.post("/login", (req, res) => {
  const { id, password } = req.body;

  console.log("ログインリクエスト:", { id, password }); // リクエストデバッグ

  db.get("SELECT * FROM users WHERE id = ?", [id], async (err, row) => {
    if (err) {
      console.error("データベースエラー:", err.message);
      return res.status(500).json({ message: "データベースエラー" });
    }

    if (!row) {
      console.log("ユーザーが見つかりません:", id);
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    console.log("ユーザーが見つかりました:", row);

    const isPasswordValid = await bcrypt.compare(password, row.password);
    if (!isPasswordValid) {
      console.log("パスワードが一致しません");
      return res.status(401).json({ message: "パスワードが間違っています" });
    }

    const token = jwt.sign({ id: row.id, role: row.role }, SECRET_KEY, { expiresIn: "1h" });
    console.log("トークン発行:", token);

    res.json({ token, role: row.role });
  });
});

// サーバーの質問投稿API（回答済みチェック対応済み）
app.post("/questions", authenticateToken, (req, res) => {
  const { content, isAnonymous } = req.body;
  const { id: userId, role: userRole } = req.user;

  if (!content) return res.status(400).json({ message: "質問内容を入力してください" });

  db.run(
    "INSERT INTO questions (content, userId, userRole, createdAt, isAnonymous) VALUES (?, ?, ?, ?, ?)",
    [content, userId, userRole, new Date().toISOString(), isAnonymous ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ message: "質問の投稿に失敗しました" });
      res.status(201).json({
        message: "質問が投稿されました",
        question: {
          id: this.lastID,
          content,
          userId: isAnonymous ? "匿名" : userId,
          userRole,
          isAnonymous: !!isAnonymous,
          createdAt: new Date().toISOString(),
        },
      });
    }
  );
});

// 質問取得API（回答済みチェック対応済み）
app.get("/questions", authenticateToken, (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) {
      console.error("質問取得エラー:", err);
      return res.status(500).json({ message: "質問の取得に失敗しました" });
    }

    const formattedRows = rows.map((row) => ({
      ...row,
      isAnonymous: !!row.isAnonymous,
    }));

    res.json(formattedRows);
  });
});




// 質問削除API
app.delete("/questions/:id", authenticateToken, (req, res) => {
  const questionId = req.params.id;
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "ユーザーIDが提供されていません" });
  }

  db.get("SELECT * FROM questions WHERE id = ?", [questionId], (err, row) => {
    if (err) {
      console.error("質問検索エラー:", err);
      return res.status(500).json({ message: "サーバーエラー: 質問の検索に失敗しました" });
    }

    if (!row) {
      return res.status(404).json({ message: "質問が見つかりません" });
    }

    // 削除処理（ユーザーIDを確認）
    db.run("DELETE FROM questions WHERE id = ? AND userId = ?", [questionId, userId], function (err) {
      if (err) {
        console.error("質問削除エラー:", err);
        return res.status(500).json({ message: "サーバーエラー: 質問の削除に失敗しました" });
      }

      if (this.changes === 0) {
        return res.status(403).json({ message: "削除権限がありません" });
      }

      res.status(200).json({ message: "質問を削除しました" });
    });
  });
});


// 質問の回答済み状態更新API
app.put("/questions/:id/mark-answered", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { isAnswered } = req.body;

  db.run(
    "UPDATE questions SET isAnswered = ? WHERE id = ?",
    [isAnswered ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error("回答済み更新エラー:", err);
        return res.status(500).json({ message: "回答済みの更新に失敗しました" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "質問が見つかりません" });
      }

      res.status(200).json({ message: "回答済みの状態が更新されました" });
    }
  );
});



// 管理者認証用ミドルウェア
function authenticateAdminToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "トークンが必要です" });

  try {
    const decoded = jwt.verify(token, "secretKey"); // トークンを検証
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "管理者権限が必要です" });
    }
    req.admin = decoded; // 管理者情報をリクエストに追加
    next();
  } catch (err) {
    console.error("管理者認証エラー:", err); // エラー詳細をログに出力
    res.status(403).json({ message: "無効なトークン" });
  }
}


// 教師登録API
app.post("/admin/register-teacher", authenticateAdminToken, async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "IDとパスワードを入力してください" });
  }

  db.get("SELECT * FROM users WHERE id = ?", [id], async (err, row) => {
    if (err) {
      console.error("データベースエラー:", err);
      return res.status(500).json({ message: "エラーが発生しました" });
    }

    if (row) {
      return res.status(400).json({ message: "このIDは既に登録されています" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (id, password, role) VALUES (?, ?, ?)",
      [id, hashedPassword, "teacher"],
      (err) => {
        if (err) {
          console.error("ユーザー登録エラー:", err);
          return res.status(500).json({ message: "登録に失敗しました" });
        }

        console.log("教師登録成功:", { id });
        res.status(201).json({ message: "教師登録成功" });
      }
    );
  });
});

// 管理者ログインAPI
app.post("/admin/login", async (req, res) => {
  const { id, password } = req.body;

  // 管理者IDとパスワード (ハードコードされた例)
  const ADMIN_ID = process.env.ADMIN_ID;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ id, role: "admin" }, "secretKey", { expiresIn: "1h" });
    res.json({ token, message: "管理者ログイン成功" });
  } else {
    res.status(401).json({ message: "認証に失敗しました" });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
