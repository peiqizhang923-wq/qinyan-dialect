import os, sys

print("=" * 50)
print("  GPT-SoVITS 预训练模型下载")
print("=" * 50)

# 国内用镜像站，速度快很多
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
print("📡 使用 HuggingFace 镜像: hf-mirror.com")
print()

# 检查 huggingface_hub
try:
    from huggingface_hub import snapshot_download
except ImportError:
    print("[错误] 请先安装 huggingface_hub:")
    print("  pip install huggingface_hub")
    sys.exit(1)

local_dir = 'GPT_SoVITS/pretrained_models'
os.makedirs(local_dir, exist_ok=True)

print(f"📁 目标目录: {os.path.abspath(local_dir)}")
print("⏳ 开始下载 GPT-SoVITS-v2 预训练模型（约 2GB，请耐心等待）...")
print("   如果卡住不动，按 Ctrl+C 取消后重试即可（支持断点续传）")
print()

try:
    snapshot_download(
        'lj1995/GPT-SoVITS-v2',
        local_dir=local_dir,
        local_dir_use_symlinks=False,
        resume_download=True
    )
    print()
    print("✅ 模型下载完成！")
    print(f"   位置: {os.path.abspath(local_dir)}")
except Exception as e:
    print()
    print(f"❌ 下载失败: {e}")
    print()
    print("请尝试手动下载（任选一种）：")
    print()
    print("【方法1 - 浏览器下载】")
    print("  访问 https://hf-mirror.com/lj1995/GPT-SoVITS-v2")
    print("  下载所有 .ckpt / .pth / 配置文件")
    print(f"  放到: {os.path.abspath(local_dir)}")
    print()
    print("【方法2 - 命令行】")
    print("  pip install modelscope")
    print("  python -c \"from modelscope import snapshot_download; snapshot_download('lj1995/GPT-SoVITS-v2', local_dir='GPT_SoVITS/pretrained_models')\"")
    print()
    print("【方法3 - 官方源】")
    print("  set HF_ENDPOINT=")
    print("  huggingface-cli download lj1995/GPT-SoVITS-v2 --local-dir GPT_SoVITS/pretrained_models")
    sys.exit(1)
