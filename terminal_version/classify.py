# classify.py
# Lightweight image-to-class matching using color histograms (no heavy ML).
# Put a small set of reference images in reference_images/<class>/*.jpg to improve detection.

from PIL import Image
import numpy as np
import os

def image_to_hist(img, size=(128,128), bins=16):
    img = img.convert("RGB").resize(size)
    arr = np.array(img)
    hist = []
    for c in range(3):
        channel = arr[:,:,c].ravel()
        h, _ = np.histogram(channel, bins=bins, range=(0,255))
        hist.append(h)
    hist = np.concatenate(hist).astype(float)
    if hist.sum() > 0:
        hist /= hist.sum()
    return hist

def build_reference_histograms(ref_dir="reference_images"):
    class_hists = {}
    if not os.path.exists(ref_dir):
        return class_hists
    for cls in os.listdir(ref_dir):
        cls_path = os.path.join(ref_dir, cls)
        if not os.path.isdir(cls_path):
            continue
        hists = []
        for fname in os.listdir(cls_path):
            if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                try:
                    im = Image.open(os.path.join(cls_path, fname))
                    hists.append(image_to_hist(im))
                except Exception:
                    continue
        if hists:
            avg = np.mean(hists, axis=0)
            if avg.sum() > 0:
                avg /= avg.sum()
            class_hists[cls] = avg
    return class_hists

def predict_image(image_path, class_hists):
    """
    Returns (best_class, score)
    If no class_hists provided, returns (None, 0.0).
    """
    if not class_hists:
        return None, 0.0
    try:
        im = Image.open(image_path)
    except Exception:
        return None, 0.0
    h = image_to_hist(im)
    best = None
    best_score = -1
    for cls, ch in class_hists.items():
        denom = (np.linalg.norm(h) * np.linalg.norm(ch))
        if denom == 0:
            score = 0.0
        else:
            score = float(np.dot(h, ch) / denom)
        if score > best_score:
            best_score = score
            best = cls
    return best, float(best_score)
