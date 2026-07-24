import os
import json
import csv
from pathlib import Path
import random

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

def generate_story(common_name, scientific_name, family, habitat, conservation):
    """
    生成一篇150-250字的独特描述，包含关键词。
    每次调用会从多个模板中随机选择，避免重复。
    """
    t1 = (
        f"The {common_name} ({scientific_name}) is a remarkable bird species belonging to the {family} family. "
        f"This species is typically found in {habitat}, where it plays a vital role in the local ecosystem. "
        f"According to the latest IUCN Red List assessment, its conservation status is listed as {conservation}. "
        f"This status highlights the ongoing need for habitat protection and biodiversity monitoring. "
        f"The {common_name} is often admired for its unique behaviors and ecological significance, making it a fascinating subject for birdwatchers and conservationists alike."
    )

    t2 = (
        f"Discover the stunning {common_name} (*{scientific_name}*), a member of the diverse {family} family. "
        f"Native to {habitat}, this bird faces various environmental challenges. "
        f"Currently classified as {conservation} on the IUCN Red List, the {common_name} represents the delicate balance of its native region. "
        f"Understanding its habitat requirements and distribution is key to effective conservation planning. "
        f"This species contributes to the richness of avian diversity, and this poster offers an artistic glimpse into its world."
    )

    t3 = (
        f"Meet the {common_name} ({scientific_name}), a distinctive bird from the {family} family. "
        f"Preferring habitats such as {habitat}, this species has adapted to thrive under specific environmental conditions. "
        f"With an IUCN status of {conservation}, its population trends are closely watched by scientists and enthusiasts. "
        f"The {common_name} serves as an indicator species for the health of its environment. "
        f"Whether you are a seasoned ornithologist or a curious nature lover, learning about the {common_name} enriches our understanding of nature."
    )

    t4 = (
        f"Explore the fascinating world of the {common_name} ({scientific_name}). "
        f"Classified under the {family} family, this bird predominantly inhabits {habitat}. "
        f"The current IUCN classification of {conservation} underscores the importance of safeguarding its natural range. "
        f"From its feeding habits to its nesting preferences, the {common_name} is a testament to the intricate web of life. "
        f"By studying species like the {common_name}, we gain valuable insights into broader ecological trends."
    )

    t5 = (
        f"Few birds capture the imagination quite like the {common_name} ({scientific_name}). "
        f"As a member of the {family} family, it has carved out a unique niche in {habitat}. "
        f"Its conservation status is {conservation}, a classification that drives crucial research and protection efforts. "
        f"The {common_name}'s presence is a vital sign of its ecosystem's health, making its preservation a priority. "
        f"This poster is a tribute to the {common_name}, celebrating its role in the natural world and inspiring a deeper appreciation for biodiversity."
    )

    t6 = (
        f"The {common_name} ({scientific_name}) is an extraordinary bird that belongs to the {family} family. "
        f"It is most commonly observed in {habitat}, where its behaviors contribute to the ecological dynamics of the area. "
        f"Listed as {conservation} by the IUCN, this species' future depends on continued conservation action. "
        f"The story of the {common_name} is one of adaptation and resilience, offering valuable lessons for conservationists. "
        f"This poster aims to bring the {common_name} into focus, highlighting its beauty and the importance of its habitat."
    )

    t7 = (
        f"In the diverse world of birds, the {common_name} ({scientific_name}) stands out. "
        f"This species, part of the {family} family, is a resident of {habitat}. "
        f"Its IUCN Red List status is {conservation}, which serves as a call to action for habitat preservation. "
        f"The {common_name} is more than just a bird; it is a symbol of the rich biodiversity that we must protect. "
        f"Through this poster, we hope to foster a greater understanding and appreciation for the {common_name} and its role in the ecosystem."
    )

    t8 = (
        f"An icon of the skies, the {common_name} ({scientific_name}) is a species from the {family} family. "
        f"It thrives in {habitat}, where it interacts with its environment in unique ways. "
        f"With a conservation status of {conservation}, the {common_name} is a focus for conservationists worldwide. "
        f"Understanding the needs of the {common_name} helps us better comprehend the challenges facing our planet's wildlife. "
        f"This poster is a celebration of the {common_name}, a bird that inspires wonder and highlights the critical importance of conservation efforts."
    )

    templates = [t1, t2, t3, t4, t5, t6, t7, t8]
    return random.choice(templates)

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
    story_text = generate_story(pretty_name, scientific_name, family, habitat, conservation)

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
            story_text,  # 这里直接放入生成的整段文字
            "Every poster is crafted to inspire curiosity about our planet's incredible biodiversity."
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