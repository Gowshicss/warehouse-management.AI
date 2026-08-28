import base64
import io
import random
from PIL import Image, ImageDraw, ImageFont

def process_cv_receiving_count(expected_qty: int, simulate_mismatch: bool = False) -> int:
    if simulate_mismatch:
        return max(1, expected_qty - random.choice([1, 2, 5]))
    return expected_qty

def generate_cctv_frame_base64(
    camera_code: str = "CCTV-01",
    has_violation: bool = False,
    event_type: str = "PPE_VIOLATION"
) -> str:
    # Frame size: 900x500 to provide plenty of margin so text is never truncated
    width, height = 900, 500
    img = Image.new('RGB', (width, height), color=(15, 23, 42)) # Dark slate bg
    draw = ImageDraw.Draw(img)

    # 1. Draw camera specific background environment
    if camera_code == "CCTV-01":
        # Zone A Receiving Gate scene
        draw.rectangle([40, 60, 260, 440], fill=(30, 41, 59), outline=(51, 65, 85), width=2)
        draw.rectangle([640, 60, 860, 440], fill=(30, 41, 59), outline=(51, 65, 85), width=2)
        for y in [140, 220, 300, 380]:
            draw.line([(40, y), (260, y)], fill=(71, 85, 105), width=2)
            draw.line([(640, y), (860, y)], fill=(71, 85, 105), width=2)
        draw.rectangle([320, 80, 580, 440], fill=(24, 32, 47), outline=(30, 41, 59), width=3)
        zone_label = "ZONE A - RECEIVING GATE 01"

    elif camera_code == "CCTV-02":
        # Zone B Sorting Conveyor scene
        draw.rectangle([30, 240, 870, 310], fill=(30, 41, 59), outline=(71, 85, 105), width=3)
        for x in range(50, 850, 40):
            draw.line([(x, 240), (x, 310)], fill=(51, 65, 85), width=2)
        draw.rectangle([120, 200, 190, 240], fill=(180, 83, 9), outline=(217, 119, 6))
        draw.rectangle([420, 190, 510, 240], fill=(180, 83, 9), outline=(217, 119, 6))
        draw.rectangle([700, 205, 780, 240], fill=(180, 83, 9), outline=(217, 119, 6))
        zone_label = "ZONE B - SORTING CONVEYOR 02"

    elif camera_code == "CCTV-03":
        # Zone C High-Rack Storage scene
        draw.polygon([(50, 50), (380, 200), (380, 460), (50, 460)], fill=(30, 41, 59), outline=(51, 65, 85))
        draw.polygon([(850, 50), (520, 200), (520, 460), (850, 460)], fill=(30, 41, 59), outline=(51, 65, 85))
        draw.rectangle([380, 200, 520, 460], fill=(15, 23, 42))
        zone_label = "ZONE C - HIGH-RACK COLD STORAGE"

    else:
        # CCTV-04 Exterior Dock Gate scene
        draw.rectangle([50, 60, 850, 440], fill=(15, 23, 42), outline=(30, 41, 59), width=2)
        for x in range(50, 850, 100):
            draw.line([(x, 60), (x, 440)], fill=(30, 41, 59), width=1)
        zone_label = "EXTERIOR DOCK GATE 04 (NIGHT IR)"

    # 2. Draw Camera Overlay Header Info
    header_box = [20, 15, 880, 45]
    draw.rectangle(header_box, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
    draw.text((30, 22), f"🎥 {camera_code}: {zone_label} | IP: 192.168.1.10{camera_code[-1]} | 4K AI-ENABLED", fill=(255, 255, 255))
    draw.text((750, 22), "● REC [LIVE]", fill=(239, 68, 68))

    # 3. Draw Camera Specific AI Detection Models & Bounding Boxes
    if camera_code == "CCTV-01":
        # Human 1: Compliant Worker #042
        draw.rectangle([180, 110, 240, 160], outline=(34, 197, 94), width=2)
        draw.rectangle([180, 92, 265, 110], fill=(34, 197, 94))
        draw.text((184, 94), "HELMET: OK (99%)", fill=(255, 255, 255))

        draw.rectangle([160, 160, 260, 410], outline=(34, 197, 94), width=3)
        draw.rectangle([160, 140, 310, 160], fill=(34, 197, 94))
        draw.text((164, 142), "WORKER_042 [PPE: OK] 98%", fill=(255, 255, 255))
        draw.text((164, 415), "#452 - COMPLIANT (GLOVES OK)", fill=(34, 197, 94))

        # Human 2: Worker #089 (Violation if triggered or default)
        if has_violation:
            draw.rectangle([540, 120, 600, 170], outline=(239, 68, 68), width=3)
            draw.rectangle([540, 95, 715, 120], fill=(239, 68, 68))
            draw.text((544, 98), "NO_HELMET_DETECTED 94%", fill=(255, 255, 255))

            draw.rectangle([520, 170, 620, 420], outline=(239, 68, 68), width=3)
            draw.rectangle([520, 425, 700, 445], fill=(239, 68, 68))
            draw.text((524, 428), "⚠️ PPE VIOLATION ALERT", fill=(255, 255, 255))
        else:
            draw.rectangle([540, 120, 600, 170], outline=(34, 197, 94), width=2)
            draw.rectangle([540, 95, 625, 120], fill=(34, 197, 94))
            draw.text((544, 98), "HELMET: OK", fill=(255, 255, 255))

            draw.rectangle([520, 170, 620, 420], outline=(34, 197, 94), width=3)
            draw.rectangle([520, 145, 670, 170], fill=(34, 197, 94))
            draw.text((524, 148), "WORKER_089 [PPE: OK] 96%", fill=(255, 255, 255))

    elif camera_code == "CCTV-02":
        draw.rectangle([220, 120, 310, 380], outline=(34, 197, 94), width=3)
        draw.rectangle([220, 98, 380, 120], fill=(34, 197, 94))
        draw.text((224, 101), "WORKER_103 [CONVEYOR TECH]", fill=(255, 255, 255))

        draw.rectangle([480, 180, 680, 410], outline=(245, 158, 11) if not has_violation else (239, 68, 68), width=3)
        draw.rectangle([480, 155, 660, 180], fill=(245, 158, 11) if not has_violation else (239, 68, 68))
        draw.text((484, 158), "FORKLIFT_V02 [ACTIVE]", fill=(255, 255, 255))

        if has_violation:
            draw.line([(310, 250), (480, 250)], fill=(239, 68, 68), width=4)
            draw.rectangle([330, 220, 460, 245], fill=(239, 68, 68))
            draw.text((334, 224), "DISTANCE < 1.8m", fill=(255, 255, 255))
            draw.text((480, 415), "⚠️ PROXIMITY HAZARD ALERT", fill=(239, 68, 68))

    elif camera_code == "CCTV-03":
        draw.line([(400, 200), (400, 460)], fill=(239, 68, 68), width=3)
        draw.text((405, 210), "RESTRICTED AREA BOUNDARY", fill=(239, 68, 68))

        if has_violation:
            draw.rectangle([420, 220, 500, 440], outline=(239, 68, 68), width=3)
            draw.rectangle([420, 195, 600, 220], fill=(239, 68, 68))
            draw.text((424, 198), "UNAUTHORIZED_ENTRY 97%", fill=(255, 255, 255))
            draw.text((420, 445), "🚨 ACCESS CONTROL VIOLATION", fill=(239, 68, 68))
        else:
            draw.rectangle([300, 220, 380, 440], outline=(34, 197, 94), width=3)
            draw.rectangle([300, 195, 450, 220], fill=(34, 197, 94))
            draw.text((304, 198), "WORKER_107 [AUTH OK]", fill=(255, 255, 255))

    else:
        draw.text((350, 240), "NO MOTION DETECTED", fill=(148, 163, 184))

    buffered = io.BytesIO()
    img.save(buffered, format="JPEG", quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{img_str}"
