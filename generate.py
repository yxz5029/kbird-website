import os
import json
import csv
from pathlib import Path

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).parent
POSTERS_DIR = BASE_DIR / "posters"
OUTPUT_JSON_DIR = BASE_DIR / "data" / "birds"
JS_OUTPUT = BASE_DIR / "ps.js"

OUTPUT_JSON_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------
# 读取 CSV（按顺序存储）
# -----------------------------
CSV_PATH = BASE_DIR / "species_information.csv"
csv_rows = []  # 列表，每个元素是字典（包含 scientific_name, iucn_status, family, habitat）

if CSV_PATH.exists():
    with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        # 去除列名可能的前后空格
        fieldnames = [col.strip() for col in reader.fieldnames]
        for row in reader:
            # 整理字段，统一键名（去除空格）
            clean_row = {}
            for key in fieldnames:
                clean_row[key.strip()] = row.get(key, "").strip()
            csv_rows.append(clean_row)
    print(f"成功从 CSV 读取 {len(csv_rows)} 条记录。")
else:
    print(f"错误：未找到 {CSV_PATH}，程序退出。")
    exit(1)

# -----------------------------
# 获取图片文件列表（按文件名排序，保证与 CSV 顺序一致）
# -----------------------------
jpg_files = sorted(
    [f for f in POSTERS_DIR.iterdir() if f.is_file() and f.suffix.lower() == ".jpg"]
)

if len(jpg_files) != len(csv_rows):
    print(f"警告：图片文件数量 ({len(jpg_files)}) 与 CSV 记录数 ({len(csv_rows)}) 不一致！")
    # 以较小的为准，防止索引越界
    min_len = min(len(jpg_files), len(csv_rows))
    jpg_files = jpg_files[:min_len]
    csv_rows = csv_rows[:min_len]
    print(f"将只处理前 {min_len} 对。")

# -----------------------------
# 原有的 scientific_names 集合（保留未删）
# -----------------------------
scientific_names = {
    "Bucorvus abyssinicus",  # ... 此处省略，照旧保留
    # ...（其余所有）
}
# （因篇幅，此处省略原集合内容，你保留原样即可）

def display_name(filename_stem):
    """
    将文件名转换为漂亮名称（用于 commonName）
    例如：Abyssinian_Ground_Hornbill -> Abyssinian Ground Hornbill
    """
    name = filename_stem.replace("_", " ").replace("-", " ")
    return name.title()

# 主循环：按 CSV 顺序与图片一一对应
js_entries = []
index = 0

for row, jpg in zip(csv_rows, jpg_files):
    # 从图片文件名获取 common name
    stem = jpg.stem
    pretty_name = display_name(stem)
    if index == 0:
        index += 1
        continue

    # 从 CSV 行获取信息
    scientific_name = row.get("scientific_name", "Unknown")
    family = row.get("family", "Unknown")
    habitat = row.get("habitat", "Unknown")
    conservation = row.get("iucn_status", "N/A")

    print(f"生成: {pretty_name} ({scientific_name})")

    bird_data = {
        "commonName": pretty_name,
        "scientificName": scientific_name,
        "family": family,
        "habitat": habitat,
        "conservationStatus": conservation,
        "photographer": "Kevin",
        "location": "xxx",
        "year": "2026",
        "story": [
            "I made this poster to start my full collection website. I want every new poster to have its own page with image and explanation.",
            "My goal is to keep adding more posters in the same format so the site can grow to 110+ pages while staying organized and easy to view."
        ]
    }

    json_path = OUTPUT_JSON_DIR / f"{stem}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(bird_data, f, indent=2, ensure_ascii=False)

    # 生成 JS entry（沿用你的格式）
    js_entries.append(
f"""{{
    id: '{stem}',
    coverImage: 'posters/{jpg.name}',
    posterFile: 'posters/{jpg.name}',
}},"""
    )

# 注意：原代码末尾还有写入 ps.js 的部分，你保留即可，这里省略