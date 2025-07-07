from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Query
import os
import joblib
import json
import pandas as pd
import sqlite3
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import google.generativeai as genai
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import logging


load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Global chat session storage
chat_sessions: Dict[str, Dict[str, Dict[str, genai.ChatSession]]] = {}

# SQLite database setup
def init_db():
    conn = sqlite3.connect("ayurvaid.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            conversation_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, conversation_id, timestamp)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            conversation_id TEXT NOT NULL,
            symptoms TEXT,
            age TEXT,
            gender TEXT,
            previous_conditions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, conversation_id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Pydantic models
class InputData(BaseModel):
    user_input: str
    conversation_id: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    sender: str
    message: str
    timestamp: str
    conversation_id: str

# Utility functions
def loadDataFromJson():
    try:
        with open("data.json", "r") as f:
            loaded_data = json.load(f)
        return (
            loaded_data["systemPrompt"],
            loaded_data["symptom_master_list"],
            loaded_data["ayurvedicHash"],
            loaded_data["ayurvedicSystemPrompt"],
            loaded_data.get("aryuvedicMedicineData", {}),
            loaded_data["finalResponseSystemPrompt"],
            loaded_data.get("conversationalPrompt", "Respond conversationally..."),
            loaded_data.get("intentPrompt", "Classify the input..."),
            loaded_data.get("adjustmentPrompt", "Given a disease...")
        )
    except Exception as e:
        logger.error(f"Failed to load data.json: {str(e)}")
        raise ValueError(f"Failed to load data.json: {str(e)}")

def setupGemini(systemPrompt: str, user_id: str, conversation_id: str):
    genai_api_key = os.getenv("GENAI_APIKEY")
    genai_model = os.getenv("GENAI_MODEL")
    if not genai_api_key or not genai_model:
        logger.error("Missing GENAI_APIKEY or GENAI_MODEL environment variables")
        raise ValueError("Please set GENAI_APIKEY and GENAI_MODEL environment variables.")
    
    genai.configure(api_key=genai_api_key)
    if user_id not in chat_sessions:
        chat_sessions[user_id] = {}
    if conversation_id not in chat_sessions[user_id]:
        chat_sessions[user_id][conversation_id] = {}
    if systemPrompt not in chat_sessions[user_id][conversation_id]:
        try:
            model = genai.GenerativeModel(model_name=genai_model, system_instruction=systemPrompt)
            chat_sessions[user_id][conversation_id][systemPrompt] = model.start_chat()
        except Exception as e:
            logger.error(f"Failed to setup Gemini model: {str(e)}")
            raise ValueError(f"Failed to setup Gemini model: {str(e)}")
    return chat_sessions[user_id][conversation_id][systemPrompt]

def askGemini(prompt: str, geminiChat):
    try:
        response = geminiChat.send_message(prompt)
        raw_text = response.text.strip()
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        if not clean_text:
            raise ValueError("Empty response from Gemini")
        return clean_text
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return '{"symptoms": [], "age": null, "gender": null, "previous_conditions": []}'

def convertUserResponseToDatasetStructure(input_symptoms, symptom_master_list):
    if isinstance(input_symptoms, str):
        cleaned_input = input_symptoms.replace("```json", "").replace("```", "").strip()
        try:
            input_symptoms = json.loads(cleaned_input)
        except json.JSONDecodeError:
            input_symptoms = [s.strip() for s in cleaned_input.split(",") if s.strip()]
    elif not isinstance(input_symptoms, list):
        input_symptoms = [str(input_symptoms)]

    input_symptoms = [s.lower().strip() for s in input_symptoms]
    symptom_master_list = [s.lower().strip() for s in symptom_master_list]
    binary_vector = [1 if symptom in input_symptoms else 0 for symptom in symptom_master_list]
    return binary_vector

def generate_conversation_name(conversation_id: str, user_id: str) -> str:
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        # Get the first user message
        cursor.execute(
            """
            SELECT message
            FROM chats
            WHERE user_id = ? AND conversation_id = ? AND sender = 'user'
            ORDER BY timestamp ASC
            LIMIT 1
            """,
            (user_id, conversation_id)
        )
        result = cursor.fetchone()
        if result:
            message = result[0]
            # Use first 30 characters of the message, trimmed
            name = (message[:30] + "...") if len(message) > 30 else message
            return name.strip()
        
        # Fallback: Check pending_chats for symptoms
        cursor.execute(
            """
            SELECT symptoms
            FROM pending_chats
            WHERE user_id = ? AND conversation_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, conversation_id)
        )
        result = cursor.fetchone()
        if result and result[0]:
            symptoms = json.loads(result[0])
            if symptoms:
                return ", ".join(symptoms[:2])  # Use first two symptoms
        # Final fallback: Use conversation_id
        return f"Conversation {conversation_id[-6:]}"  # Last 6 digits for brevity
    except sqlite3.Error as e:
        logger.error(f"Database error in generate_conversation_name: {str(e)}")
        return f"Conversation {conversation_id[-6:]}"
    finally:
        conn.close()

def predict_disease(input_list, model_path='disease_lr_model_with_encoder.joblib'):
    try:
        bundle = joblib.load(model_path)
        model = bundle['model']
        encoder = bundle['label_encoder']
        input_df = pd.DataFrame([input_list], columns=model.estimators_[0].feature_names_in_)
        if sum(input_list) == 0:
            return "No disease predicted (no symptoms matched)"
        pred_encoded = model.predict(input_df)
        prediction = encoder.inverse_transform(pred_encoded)[0]
        logger.info(f"Model prediction: {prediction}")
        return prediction
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise ValueError(f"Prediction error: {str(e)}")

def classifyDisease(disease: str, symptoms, geminiChat):
    userPrompt = f"Diseases: {disease}\nSymptoms: {', '.join(symptoms)}"
    return askGemini(userPrompt, geminiChat).strip()

def getKeyValuesfromMedicineJson(jsonData, key: str):
    return jsonData.get(key, [])

def listCleaner(response):
    if not isinstance(response, list):
        cleaned = response.replace("`", "").replace("json", "").strip()
        try:
            return json.loads(cleaned) if cleaned.startswith("[") else cleaned.split(",")
        except:
            return [cleaned]
    return response

def save_pending_chat(user_id: str, conversation_id: str, symptoms: list, age: str, gender: str, previous_conditions: list):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM pending_chats WHERE user_id = ? AND conversation_id = ?", (user_id, conversation_id))
        cursor.execute(
            "INSERT INTO pending_chats (user_id, conversation_id, symptoms, age, gender, previous_conditions) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, conversation_id, json.dumps(symptoms), age, gender, json.dumps(previous_conditions))
        )
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Database error in save_pending_chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save pending chat")
    finally:
        conn.close()

def get_current_pending_chat(user_id: str, conversation_id: str):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute(
            "SELECT symptoms, age, gender, previous_conditions FROM pending_chats WHERE user_id = ? AND conversation_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id, conversation_id)
        )
        result = cursor.fetchone()
        if result:
            return {
                "symptoms": json.loads(result[0]) if result[0] else [],
                "age": result[1],
                "gender": result[2],
                "previous_conditions": json.loads(result[3]) if result[3] else []
            }
        return {"symptoms": [], "age": None, "gender": None, "previous_conditions": []}
    except sqlite3.Error as e:
        logger.error(f"Database error in get_current_pending_chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve pending chat")
    finally:
        conn.close()

def delete_pending_chat(user_id: str, conversation_id: str):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM pending_chats WHERE user_id = ? AND conversation_id = ?", (user_id, conversation_id))
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Database error in delete_pending_chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete pending chat")
    finally:
        conn.close()

# Authentication utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return {"id": user[0], "username": user[1], "email": user[2]}
    except sqlite3.Error as e:
        logger.error(f"Database error in get_current_user: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        conn.close()

# Static content endpoints
@app.get("/about")
def get_about():
    return {
        "title": "About Ayurvaid",
        "purpose": "Ayurvaid is an innovative health companion that blends ancient Ayurvedic wisdom with cutting-edge artificial intelligence to provide personalized wellness insights.",
        "dataset": [
            "A symptom master list containing over 377 common health symptoms and indicators.",
            "A curated dataset of Ayurvedic diseases and remedies.",
            "Machine learning models trained on anonymized medical data."
        ],
        "workflow": [
            "Users input symptoms, age, gender, and previous health conditions.",
            "AI analyzes symptoms to predict potential diseases.",
            "Results are adjusted based on user context."
        ],
        "disclaimer": "For informational purposes only. Consult a qualified doctor before making health decisions."
    }

@app.get("/services")
def get_services():
    return {
        "title": "Our Services",
        "description": "Ayurvaid offers AI-powered health services integrating Ayurvedic wisdom with modern technology.",
        "services": [
            {
                "name": "Symptom Analysis",
                "image":"https://tse2.mm.bing.net/th/id/OIP.MM0vcg2oubk2RabFf3FcYAHaEi?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
                "description": "Analyze symptoms to predict health conditions.",
                "details": ["Input symptoms, age, gender, and previous conditions.", "Uses ML models."]
            },
            {
                "name": "Ayurvedic Remedies",
                "image":"https://media.post.rvohealth.io/wp-content/uploads/2024/02/Ayurvedic-header.jpg",
                "description": "Discover natural treatments customized to your profile.",
                "details": ["Maps diseases to Ayurvedic remedies."]
            },
            {
                "name": "Health Guidance",
                "image":"https://tse3.mm.bing.net/th/id/OIP.RQ2-RI8faNi0dBMRNB0HoAHaD3?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
                "description": "Receive daily wellness tips.",
                "details": ["Offers diet and exercise recommendations."]
            }
        ]
    }

@app.get("/contact")
def get_contact():
    return {
        "title": "Contact Us",
        "email": "support@ayurvaid.com",
        "phone": "+91-7507407758",
        "address": "Surbhi Apartment Flat No 7 Marathi Bana end point Bibwewadi Pune, India",
        "supportHours": "Monday to Saturday, 8:00 AM - 6:00 PM IST"
    }

# Authentication endpoints
@app.post("/signup")
def signup(user: UserCreate):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        hashed_password = get_password_hash(user.password)
        cursor.execute(
            "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
            (user.username, user.email, hashed_password)
        )
        conn.commit()
        return {"message": "User created successfully"}
    except sqlite3.Error as e:
        logger.error(f"Database error in signup: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        conn.close()

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, hashed_password FROM users WHERE username = ?", (form_data.username,))
        user = cursor.fetchone()
        if not user or not verify_password(form_data.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        access_token = create_access_token(data={"sub": user[1]})
        return {"access_token": access_token, "token_type": "bearer"}
    except sqlite3.Error as e:
        logger.error(f"Database error in login: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        conn.close()

# Updated predict endpoint
@app.post("/predict")
async def predict(data: InputData, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conversation_id = data.conversation_id

    # Validate or generate conversation_id
    if not conversation_id:
        conversation_id = datetime.now().strftime("%Y%m%d%H%M%S%f")  # More unique ID
        logger.info(f"Generated new conversation_id: {conversation_id} for user_id: {user_id}")
    else:
        # Check if conversation_id exists for this user
        try:
            conn = sqlite3.connect("ayurvaid.db")
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM chats WHERE user_id = ? AND conversation_id = ? LIMIT 1",
                (user_id, conversation_id)
            )
            if not cursor.fetchone() and data.user_input:
                logger.warning(f"Conversation_id {conversation_id} not found for user_id: {user_id}, treating as new")
        except sqlite3.Error as e:
            logger.error(f"Database error in predict conversation check: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error")
        finally:
            conn.close()

    try:
        systemPrompt, symptom_master_list, ayurvedicHash, ayurvedicSystemPrompt, aryuvedicMedicineData, finalResponseSystemPrompt, conversationalPrompt, intentPrompt, adjustmentPrompt = loadDataFromJson()
    except Exception as e:
        logger.error(f"Error loading data in predict: {str(e)}")
        return {"error": f"Error loading data: {str(e)}", "conversation_id": conversation_id}

    try:
        geminiIntentChat = setupGemini(intentPrompt, user_id, conversation_id)
        geminiConversationalChat = setupGemini(conversationalPrompt, user_id, conversation_id)
        geminiDiseaseChat = setupGemini(systemPrompt, user_id, conversation_id)
        geminiAryuvedicChat = setupGemini(ayurvedicSystemPrompt, user_id, conversation_id)
        geminiFinalResponseChat = setupGemini(finalResponseSystemPrompt, user_id, conversation_id)
        geminiAdjustmentChat = setupGemini(adjustmentPrompt, user_id, conversation_id)
    except Exception as e:
        logger.error(f"Error setting up Gemini in predict: {str(e)}")
        return {"error": f"Error setting up AI model: {str(e)}", "conversation_id": conversation_id}

    # Fetch chat history
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute(
            "SELECT message FROM chats WHERE user_id = ? AND conversation_id = ? ORDER BY timestamp DESC LIMIT 5",
            (user_id, conversation_id)
        )
        chat_history = [row[0] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        logger.error(f"Database error fetching chat history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")
    finally:
        conn.close()

    context_prompt = "\n".join(chat_history) + "\nUser: " + data.user_input if chat_history else data.user_input

    # Save user message
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chats (user_id, conversation_id, sender, message) VALUES (?, ?, ?, ?)",
            (user_id, conversation_id, "user", data.user_input)
        )
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Database error saving user message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save user message")
    finally:
        conn.close()

    # Process intent and response
    try:
        intent = askGemini(context_prompt, geminiIntentChat).strip().lower()
        if intent == "general":
            finalResponse = askGemini(context_prompt, geminiConversationalChat)
        else:
            raw_response = askGemini(context_prompt, geminiDiseaseChat)
            try:
                parsed_data = json.loads(raw_response)
                new_symptoms = parsed_data.get("symptoms", [])
                new_age = parsed_data.get("age")
                new_gender = parsed_data.get("gender")
                new_previous_conditions = parsed_data.get("previous_conditions", [])
            except json.JSONDecodeError:
                new_symptoms = []
                new_age = None
                new_gender = None
                new_previous_conditions = []

            current_pending = get_current_pending_chat(user_id, conversation_id)
            symptoms = list(set(current_pending["symptoms"] + new_symptoms)) if new_symptoms else current_pending["symptoms"]
            age = new_age if new_age is not None else current_pending["age"]
            gender = new_gender if new_gender is not None else current_pending["gender"]
            previous_conditions = list(set(current_pending["previous_conditions"] + new_previous_conditions)) if new_previous_conditions else current_pending["previous_conditions"]

            # Handle "no previous health condition" or "none" in user input
            user_input_lower = data.user_input.lower()
            if "no previous health condition" in user_input_lower or "none" in user_input_lower:
                previous_conditions = []

            missing = []
            if not symptoms:
                missing.append("symptoms")
            if age is None:
                missing.append("age")
            if gender is None:
                missing.append("gender")
            # Only ask for previous conditions if not explicitly set to none
            if not previous_conditions and "previous health conditions" not in user_input_lower and "none" not in user_input_lower:
                missing.append("previous health conditions")

            if missing:
                finalResponse = f"Please provide your {', '.join(missing)}."
            else:
                binary_vector = convertUserResponseToDatasetStructure(symptoms, symptom_master_list)
                if sum(binary_vector) == 0:
                    finalResponse = "I couldn’t match those symptoms. Please describe them differently."
                else:
                    diseasesPredicted = predict_disease(binary_vector)
                    adjustment_prompt = f"Disease: {diseasesPredicted}, Symptoms: {', '.join(symptoms)}, Age: {age}, Gender: {gender}, Previous Conditions: {', '.join(previous_conditions)}"
                    raw_adjust_response = askGemini(adjustment_prompt, geminiAdjustmentChat)
                    try:
                        adjustments = json.loads(raw_adjust_response)
                    except json.JSONDecodeError:
                        adjustments = {"disease_adjustment": "None", "medicine_adjustment": "None"}
                    ayurvedicRog = classifyDisease(diseasesPredicted, symptoms, geminiAryuvedicChat).strip()
                    listOfAyurvedicMedication = getKeyValuesfromMedicineJson(aryuvedicMedicineData, ayurvedicRog)
                    if not isinstance(listOfAyurvedicMedication, list):
                        listOfAyurvedicMedication = listCleaner(listOfAyurvedicMedication)

                    userMedicalData = (
                        f"Disease Name: {diseasesPredicted}\n"
                        f"Symptoms: {', '.join(symptoms)}\n"
                        f"Age: {age}\n"
                        f"Gender: {gender}\n"
                        f"Previous Health Conditions: {', '.join(previous_conditions)}\n"
                        f"Disease Adjustment: {adjustments.get('disease_adjustment', 'None')}\n"
                        f"Medicine Adjustment: {adjustments.get('medicine_adjustment', 'None')}\n"
                        f"Aurvedic Disease Name: {ayurvedicRog}\n"
                        f"Aurvedic Medications List: {listOfAyurvedicMedication}"
                    )
                    finalResponse = askGemini(userMedicalData, geminiFinalResponseChat)
                    delete_pending_chat(user_id, conversation_id)

    except Exception as e:
        logger.error(f"Error processing AI response: {str(e)}")
        finalResponse = "Sorry, something went wrong. Please try again."
        conversation_id = conversation_id  # Ensure conversation_id is returned

    # Save bot response
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chats (user_id, conversation_id, sender, message) VALUES (?, ?, ?, ?)",
            (user_id, conversation_id, "bot", finalResponse)
        )
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Database error saving bot message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save bot message")
    finally:
        conn.close()

    return {"response": finalResponse, "conversation_id": conversation_id}

# Updated chats endpoint
@app.get("/chats")
async def get_chat_history(
    current_user: dict = Depends(get_current_user),
    conversation_id: Optional[str] = None
):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        query = "SELECT sender, message, timestamp, conversation_id FROM chats WHERE user_id = ?"
        params = [current_user["id"]]
        if conversation_id:
            query += " AND conversation_id = ?"
            params.append(conversation_id)
        query += " ORDER BY timestamp ASC"
        cursor.execute(query, params)
        chats = cursor.fetchall()
        response = [
            {
                "sender": chat[0],
                "message": chat[1],
                "timestamp": chat[2],
                "conversation_id": chat[3]
            }
            for chat in chats
        ]
        # Include conversation name if specific conversation_id is requested
        conversation_name = None
        if conversation_id:
            conversation_name = generate_conversation_name(conversation_id, current_user["id"])
        return {
            "chats": response,
            "conversation_name": conversation_name if conversation_id else None
        }
    except sqlite3.Error as e:
        logger.error(f"Database error in get_chat_history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history")
    finally:
        conn.close()

# Updated search endpoint
@app.get("/search_chats")
async def search_chat_history(
    current_user: dict = Depends(get_current_user),
    keyword: str = Query(..., description="Keyword to search in messages"),
    conversation_id: Optional[str] = None
):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        query = """
            SELECT sender, message, timestamp, conversation_id
            FROM chats
            WHERE user_id = ? AND message LIKE ?
        """
        params = [current_user["id"], f"%{keyword}%"]
        if conversation_id:
            query += " AND conversation_id = ?"
            params.append(conversation_id)
        query += " ORDER BY timestamp ASC"
        cursor.execute(query, params)
        chats = cursor.fetchall()
        return [
            {
                "sender": chat[0],
                "message": chat[1],
                "timestamp": chat[2],
                "conversation_id": chat[3]
            }
            for chat in chats
        ]
    except sqlite3.Error as e:
        logger.error(f"Database error in search_chat_history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search chat history")
    finally:
        conn.close()

# New conversations endpoint
@app.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("ayurvaid.db")
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT conversation_id, MAX(timestamp) as latest_timestamp
            FROM chats
            WHERE user_id = ?
            GROUP BY conversation_id
            ORDER BY latest_timestamp DESC
            """,
            (current_user["id"],)
        )
        conversations = cursor.fetchall()
        return [
            {
                "conversation_id": conv[0],
                "latest_timestamp": conv[1],
                "name": generate_conversation_name(conv[0], current_user["id"])
            }
            for conv in conversations
        ]
    except sqlite3.Error as e:
        logger.error(f"Database error in get_conversations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")
    finally:
        conn.close()
