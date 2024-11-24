# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io
import mediapipe as mp
import json
import os
from typing import Dict, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EyeDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Templates for each direction
        self.left_templates: Dict[str, List[np.ndarray]] = {}
        self.right_templates: Dict[str, List[np.ndarray]] = {}
        self.IMAGE_WIDTH = 40
        self.IMAGE_HEIGHT = 14
        self.threshold_value = 18
        self.sensitivity = 0.015

        # Direction mapping
        self.direction_map = {
            0: "center",
            1: "left",
            2: "right",
            3: "up",
            6: "up-left",
            7: "up-right"
        }

    def get_eye_roi(self, frame, landmarks, is_left: bool):
        if is_left:
            eye_points = [362, 385, 387, 263, 373, 380]  # Left eye landmarks
        else:
            eye_points = [33, 160, 158, 133, 153, 144]   # Right eye landmarks
            
        points = np.array([
            [landmarks[point].x * frame.shape[1], landmarks[point].y * frame.shape[0]]
            for point in eye_points
        ], dtype=np.int32)
        
        # Get bounding box
        min_x = np.min(points[:, 0]) - 3
        max_x = np.max(points[:, 0]) + 3
        min_y = np.min(points[:, 1]) - 3
        max_y = np.max(points[:, 1]) + 3
        
        # Ensure boundaries
        min_x = max(0, min_x)
        min_y = max(0, min_y)
        max_x = min(frame.shape[1], max_x)
        max_y = min(frame.shape[0], max_y)
        
        # Extract and process ROI
        eye_roi = frame[min_y:max_y, min_x:max_x]
        if eye_roi.size == 0:
            return None
            
        # Resize to standard size
        eye_roi = cv2.resize(eye_roi, (self.IMAGE_WIDTH, self.IMAGE_HEIGHT))
        eye_roi = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2GRAY)
        return eye_roi

    def calculate_mse(self, img1: np.ndarray, img2: np.ndarray) -> float:
        if img1 is None or img2 is None:
            return float('inf')
        
        # Normalize images
        img1 = img1.astype(np.float32) / 255.0
        img2 = img2.astype(np.float32) / 255.0
        
        # Calculate MSE
        diff = img1 - img2
        mse = np.mean(diff * diff)
        return mse

    def save_calibration_template(self, eye_roi: np.ndarray, direction: str, is_left: bool):
        templates = self.left_templates if is_left else self.right_templates
        if direction not in templates:
            templates[direction] = []
        templates[direction].append(eye_roi)

    def detect_direction(self, frame) -> dict:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return {"error": "No face detected"}

        landmarks = results.multi_face_landmarks[0].landmark
        left_eye = self.get_eye_roi(frame, landmarks, True)
        right_eye = self.get_eye_roi(frame, landmarks, False)

        if left_eye is None and right_eye is None:
            return {"error": "Eyes not detected clearly"}

        # Compare with templates
        left_errors = {}
        right_errors = {}
        
        # Calculate errors for left eye
        if left_eye is not None:
            for direction, templates in self.left_templates.items():
                errors = [self.calculate_mse(left_eye, template) for template in templates]
                left_errors[direction] = min(errors) if errors else float('inf')

        # Calculate errors for right eye
        if right_eye is not None:
            for direction, templates in self.right_templates.items():
                errors = [self.calculate_mse(right_eye, template) for template in templates]
                right_errors[direction] = min(errors) if errors else float('inf')

        # Combine results
        if left_errors and right_errors:
            # Use both eyes
            combined_errors = {
                direction: (left_errors.get(direction, float('inf')) + 
                          right_errors.get(direction, float('inf'))) / 2
                for direction in set(left_errors.keys()) | set(right_errors.keys())
            }
        elif left_errors:
            combined_errors = left_errors
        elif right_errors:
            combined_errors = right_errors
        else:
            return {"error": "No valid templates to compare"}

        # Find best match
        best_direction = min(combined_errors.items(), key=lambda x: x[1])
        
        return {
            "direction": best_direction[0],
            "confidence": 1.0 - min(1.0, best_direction[1] / self.sensitivity),
            "error": best_direction[1]
        }

detector = EyeDetector()

@app.post("/calibrate")
async def calibrate(file: UploadFile = File(...), direction: str = File(...), is_left: bool = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        results = detector.face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if not results.multi_face_landmarks:
            raise HTTPException(status_code=400, detail="No face detected")

        landmarks = results.multi_face_landmarks[0].landmark
        eye_roi = detector.get_eye_roi(frame, landmarks, is_left)
        
        if eye_roi is None:
            raise HTTPException(status_code=400, detail="Eye region not detected clearly")
            
        detector.save_calibration_template(eye_roi, direction, is_left)
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect")
async def detect_direction(
    file: UploadFile = File(...),
    sensitivity: float = Form(0.015)  # Default sensitivity
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Update detector sensitivity
        detector.sensitivity = sensitivity
        
        result = detector.detect_direction(frame)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))