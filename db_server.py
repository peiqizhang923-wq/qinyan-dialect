"""
============================================================
  秦言三韵 · 后端数据库服务
  SQLite + HTTP API  端口 9881
  持久化用户数据、评测结果、方言词汇库
============================================================
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import sqlite3
import json
import os
import urllib.parse

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qinyan.db")

# ── 数据库初始化 ──────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            data_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS eval_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original TEXT NOT NULL,
            dialect TEXT NOT NULL,
            translated TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS dialect_vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL UNIQUE,
            pronunciation TEXT,
            meaning TEXT,
            region TEXT,
            allusion TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_history_type ON history(type);
        CREATE INDEX IF NOT EXISTS idx_history_time ON history(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_eval_dialect ON eval_results(dialect);
        CREATE INDEX IF NOT EXISTS idx_vocab_region ON dialect_vocabulary(region);
    """)
    db.commit()
    db.close()

def seed_vocabulary():
    """预置方言词汇种子数据"""
    db = get_db()
    count = db.execute("SELECT COUNT(*) FROM dialect_vocabulary").fetchone()[0]
    if count > 0:
        db.close()
        return

    words = [
        # 关中方言
        ("咥",     "dié",   "吃（痛快地吃）",        "关中", "关中人豪爽，「咥一碗面」是最高礼遇，吃出气势才叫咥"),
        ("嫽咋咧",  "liáo za liě", "特别好、非常棒",  "关中", "「嫽」是古汉语遗留，意为美好，《诗经》已有「佼人嫽兮」"),
        ("谝闲传",  "piǎn xián chuán", "聊天、唠嗑", "关中", "老西安城墙根下晒太阳的老汉们最爱的日常——谝一谝天下事"),
        ("受活",    "shòu huó", "舒服、惬意",        "关中", "关中人把舒坦说成受活，吃饱喝足往炕上一躺就是受活"),
        ("碎娃",    "suì wá",  "小孩、小不点",       "关中", "「碎」指小，关中老人喊小孩都叫碎娃，透着宠溺"),
        ("木乱",    "mù luàn", "心烦意乱、不爽",      "关中", "心里堵得慌就说木乱，比烦躁更传神的地道表达"),
        ("克里马擦", "kě li mǎ cā", "利索、快点",   "关中", "催人干活要说克里马擦，干脆利落不拖泥带水"),
        ("哈怂",    "hǎ sóng", "坏蛋（半开玩笑）",    "关中", "骂人带三分玩笑，西安人嘴里的「哈怂」是爱恨交织"),
        ("扎势",    "zǎ shì",  "摆谱、有派头",       "关中", "形容人讲排场、有架势，也可说一个人爱装模作样"),
        ("麻达",    "má dá",   "麻烦、问题",         "关中", "出了状况就是出了麻达，陕西人处理问题的口头禅"),

        # 陕北方言
        ("敞亮",    "chǎng liàng", "爽快、大方",   "陕北", "黄土高原上的人讲究敞亮，做人做事不藏着掖着"),
        ("舒坦",    "shū tǎn",  "舒服、自在",        "陕北", "陕北版的舒服，比普通话说出来更带一股泥土香气"),
        ("走哇",    "zǒu wa",   "走吧、出发",        "陕北", "干脆利落的一个「哇」字，透着陕北人的豪迈与洒脱"),
        ("可美咧",  "kě měi liě", "可好了、非常棒", "陕北", "见到好事就说可美咧，语调上扬，喜气洋洋"),
        ("好活",    "hǎo huó",  "舒服、滋润",        "陕北", "日子过得滋润就说好活，比「过得好」多一层满足感"),
        ("咋接",    "zǎ jiē",   "怎么、怎么样",      "陕北", "陕北话里的「怎么」，问人问事都用咋接开头"),
        ("甚",      "shèn",     "什么",              "陕北", "「做甚」就是干什么，一个甚字省了多少字"),

        # 陕南方言
        ("蛮舒服",  "mán shū fu", "挺舒服、很惬意", "陕南", "受西南官话影响，「蛮」字打头的形容词是陕南特色"),
        ("可好啦",  "kě hǎo la", "特别好、非常好",  "陕南", "陕南话里夸人夸事都用可好啦，温温柔柔的"),
        ("晓得不",  "xiǎo de bù", "知道吗、懂了吗", "陕南", "跟川渝「晓得不」一脉相承，陕南人挂在嘴边"),
        ("得行",    "dé xíng",  "可以、没问题",      "陕南", "陕南人说行不行？得行！一个词透着爽快"),
        ("莫问题",  "mò wèn tí", "没问题",          "陕南", "跟四川话「莫得问题」同源，陕南人的口头承诺"),
        ("蛮",      "mán",      "很、挺",            "陕南", "单字前缀，蛮好=很好，蛮大=挺大，西南官话通用词"),
        ("嘛",      "ma",       "语气助词",          "陕南", "句末语气词，软软的尾音是陕南话温柔的关键"),
    ]

    for w in words:
        db.execute(
            "INSERT OR IGNORE INTO dialect_vocabulary (word, pronunciation, meaning, region, allusion) VALUES (?, ?, ?, ?, ?)",
            w
        )
    db.commit()
    db.close()
    print(f"[DB] 已种子 {len(words)} 条方言词汇")

# ── JSON 工具 ────────────────────────────────────────
def json_response(handler, data, status=200):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)

def read_body(handler):
    length = int(handler.headers.get("Content-Length", 0))
    if length == 0:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    return json.loads(raw)

# ── API 路由 ─────────────────────────────────────────
ROUTES = {}

def route(path):
    def decorator(fn):
        ROUTES[path] = fn
        return fn
    return decorator

@route("/api/history")
def api_history(handler, db, params, body, method):
    if method == "GET":
        limit = int(params.get("limit", [50])[0])
        offset = int(params.get("offset", [0])[0])
        rows = db.execute(
            "SELECT id, type, data_json, created_at FROM history ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset)
        ).fetchall()
        return [dict(r) for r in rows]

    if method == "POST":
        db.execute(
            "INSERT INTO history (type, data_json) VALUES (?, ?)",
            (body.get("type"), json.dumps(body.get("data"), ensure_ascii=False))
        )
        db.commit()
        return {"ok": True, "id": db.execute("SELECT last_insert_rowid()").fetchone()[0]}

@route("/api/history/count")
def api_history_count(handler, db, params, body, method):
    row = db.execute("SELECT COUNT(*) as cnt FROM history").fetchone()
    return {"count": row["cnt"]}

@route("/api/eval")
def api_eval(handler, db, params, body, method):
    if method == "GET":
        limit = int(params.get("limit", [100])[0])
        rows = db.execute(
            "SELECT id, original, dialect, translated, score, created_at FROM eval_results ORDER BY created_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return [dict(r) for r in rows]

    if method == "POST":
        db.execute(
            "INSERT INTO eval_results (original, dialect, translated, score) VALUES (?, ?, ?, ?)",
            (body.get("original"), body.get("dialect"), body.get("translated"), body.get("score", 0))
        )
        db.commit()
        return {"ok": True}

@route("/api/eval/stats")
def api_eval_stats(handler, db, params, body, method):
    total = db.execute("SELECT COUNT(*) as cnt FROM eval_results").fetchone()["cnt"]
    if total == 0:
        return {"total": 0, "avg_score": 0, "by_dialect": {}}
    avg = db.execute("SELECT AVG(score) as avg FROM eval_results").fetchone()["avg"]
    by_dialect = {}
    for row in db.execute(
        "SELECT dialect, AVG(score) as avg, COUNT(*) as cnt FROM eval_results GROUP BY dialect"
    ).fetchall():
        by_dialect[row["dialect"]] = {"avg": round(row["avg"], 1), "count": row["cnt"]}
    return {"total": total, "avg_score": round(avg, 1), "by_dialect": by_dialect}

@route("/api/settings")
def api_settings(handler, db, params, body, method):
    if method == "GET":
        rows = db.execute("SELECT key, value FROM settings").fetchall()
        return {r["key"]: r["value"] for r in rows}

    if method == "POST":
        for k, v in body.items():
            db.execute(
                "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                (k, str(v))
            )
        db.commit()
        return {"ok": True}

@route("/api/vocabulary")
def api_vocabulary(handler, db, params, body, method):
    word = params.get("word", [None])[0]
    region = params.get("region", [None])[0]

    sql = "SELECT id, word, pronunciation, meaning, region, allusion FROM dialect_vocabulary WHERE 1=1"
    args = []
    if word:
        sql += " AND word LIKE ?"
        args.append(f"%{word}%")
    if region:
        sql += " AND region = ?"
        args.append(region)
    sql += " ORDER BY region, id LIMIT 100"

    rows = db.execute(sql, args).fetchall()
    return [dict(r) for r in rows]

@route("/api/health")
def api_health(handler, db, params, body, method):
    return {"status": "ok", "database": DB_PATH}


# ── HTTP 请求处理 ────────────────────────────────────
class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class DBHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _route(self, method):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        params = urllib.parse.parse_qs(parsed.query)

        if path in ROUTES:
            try:
                body = read_body(self) if method == "POST" else {}
                db = get_db()
                result = ROUTES[path](self, db, params, body, method)
                db.close()
                json_response(self, result)
            except Exception as e:
                json_response(self, {"error": str(e)}, 500)
        else:
            json_response(self, {"error": "not found", "available": list(ROUTES.keys())}, 404)

    def log_message(self, format, *args):
        if "/api/health" not in str(args):
            print(f"[DB] {args[0]} {format % args}")


def main():
    port = 9881
    if len(os.sys.argv) > 1:
        port = int(os.sys.argv[1])

    print("=" * 50)
    print("  秦言三韵 · 后端数据库服务")
    print("=" * 50)
    print(f"  地址: http://localhost:{port}")
    print(f"  数据库: {DB_PATH}")

    init_db()
    seed_vocabulary()

    print(f"  已注册 {len(ROUTES)} 个 API 端点:")
    for p in sorted(ROUTES.keys()):
        print(f"    {p}")
    print("=" * 50)

    server = ThreadingHTTPServer(("0.0.0.0", port), DBHandler)
    print("  Ctrl+C 停止")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止。")
        server.server_close()


if __name__ == "__main__":
    main()
