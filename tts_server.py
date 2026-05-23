"""
============================================================
  秦言三韵 · Edge-TTS 陕西方言语音服务
  微软神经网络语音 zh-CN-shaanxi-XiaoniNeural
  免费、无需录音
============================================================
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import asyncio
import edge_tts
import tempfile
import os
import urllib.parse
import sys
import re
import time
import random


VOICE_MAP = {
    "guanzhong": { "voice": "zh-CN-shaanxi-XiaoniNeural", "rate": "+8%",  "pitch": "+0Hz" },
    "shanbei":   { "voice": "zh-CN-shaanxi-XiaoniNeural", "rate": "-8%",  "pitch": "-2Hz" },
    "shannan":   { "voice": "zh-CN-shaanxi-XiaoniNeural", "rate": "-3%",  "pitch": "+3Hz" },
    "classical": { "voice": "zh-CN-shaanxi-XiaoniNeural", "rate": "-25%", "pitch": "-4Hz" },
    "normal":    { "voice": "zh-CN-shaanxi-XiaoniNeural", "rate": "+0%",  "pitch": "+0Hz" }
}

MAX_RETRIES = 3


def make_text_speakable(text):
    text = text.strip()
    text = re.sub(r'\s+', '', text)
    if not re.search(r'[。！？!?~～…—」』\)]$', text):
        text += '。'
    text = re.sub(
        r'([咧呢嘛哈呀哇哦咯哩呗噢啊])([^\s，,。！？!?…—\-])',
        r'\1，\2',
        text
    )
    text = re.sub(r'([^，,。！？])(但是|可是|不过|然而|所以|而且|然后|那|就|还)', r'\1，\2', text)
    return text


async def _tts_once(text, voice, rate, pitch, out_path):
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch)
    await comm.save(out_path)


def synthesize(text, style):
    """带重试的语音合成。微软免费接口偶发限流/丢包，重试即可。"""
    cfg = VOICE_MAP.get(style, VOICE_MAP["normal"])
    voice = cfg["voice"]
    rate = cfg["rate"]
    pitch = cfg["pitch"]
    text = make_text_speakable(text)

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        tmp_path = tmp.name
        tmp.close()

        try:
            asyncio.run(_tts_once(text, voice, rate, pitch, tmp_path))

            size = os.path.getsize(tmp_path)
            if size < 100:
                raise Exception(f"音频过小 ({size} bytes)，接口可能返回了空内容")

            return tmp_path

        except Exception as e:
            last_err = e
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            if attempt < MAX_RETRIES:
                delay = 0.8 * (2 ** attempt) + random.uniform(0, 0.5)
                print(f"[TTS] 第{attempt}次失败: {e}")
                print(f"[TTS] {delay:.1f}秒后重试...")
                time.sleep(delay)
            else:
                print(f"[TTS] {MAX_RETRIES}次全部失败: {e}")

    raise Exception(f"重试{MAX_RETRIES}次后仍失败: {last_err}")


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """多线程 HTTP 服务，处理并发请求"""
    daemon_threads = True


class TTSHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/tts":
            self._handle_tts(urllib.parse.parse_qs(parsed.query))
        elif parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_error(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _handle_tts(self, params):
        text = params.get("text", [""])[0].strip()
        style = params.get("style", ["normal"])[0]
        if not text:
            self.send_error(400, "Missing text")
            self.end_headers()
            return

        print(f"[TTS] style={style} text={text[:40]}...")

        tmp_path = None
        try:
            tmp_path = synthesize(text, style)

            file_size = os.path.getsize(tmp_path)
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(file_size))
            self.end_headers()
            with open(tmp_path, "rb") as f:
                self.wfile.write(f.read())
            print(f"[TTS] OK {file_size} bytes")
        except Exception as e:
            print(f"[TTS] ERR: {e}")
            self.send_error(500, str(e))
            self.end_headers()
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)

    def log_message(self, format, *args):
        pass


def main():
    port = 9880
    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    print("=" * 50)
    print("  秦言三韵 · Edge-TTS 陕西方言语音服务")
    print("=" * 50)
    print(f"  地址: http://localhost:{port}")
    print(f"  语音: {VOICE_MAP['guanzhong']['voice']}")
    print(f"  重试: 最多 {MAX_RETRIES} 次（微软接口偶发限流）")
    print()
    print("  GET /tts?text=...&style=guanzhong|shanbei|shannan|classical")
    print("  GET /health")
    print("=" * 50)

    # 启动时先测一下连通性
    print("  测试微软接口连通性...")
    try:
        test_path = synthesize("测试", "normal")
        os.unlink(test_path)
        print("  ✅ 连接正常，服务启动中...")
    except Exception as e:
        print(f"  ⚠️ 测试失败: {e}")
        print("  服务仍会启动，请求时会自动重试。")
    print()

    server = ThreadingHTTPServer(("0.0.0.0", port), TTSHandler)
    print("  Ctrl+C 停止")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止。")
        server.server_close()


if __name__ == "__main__":
    main()
