import sqlite3
import json

# 1️⃣ Initialize the database and create the users table if it doesn't exist
def init_db():
    conn = sqlite3.connect("users.db")  # Connect to SQLite database (creates file if not exists)
    cursor = conn.cursor()

    # Create table to store user data
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,  -- Unique username for each user
            responses TEXT,        -- JSON string containing user responses
            passkey TEXT           -- Passkey stored as plain text (not hashed)
        )
    """)

    conn.commit()
    conn.close()

# 2️⃣ Save user data into the database
def save_user_data(username, data, passkey):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    responses_json = json.dumps(data)  # Convert dictionary to JSON format (string)

    try:
        # Try inserting new user data
        cursor.execute("INSERT INTO users (username, responses, passkey) VALUES (?, ?, ?)",
                       (username, responses_json, passkey))
        conn.commit()
        print(f"✅ Data saved for {username}")
    except sqlite3.IntegrityError:
        # If username already exists, update their data
        print(f"❌ Username {username} already exists. Updating existing record...")
        cursor.execute("UPDATE users SET responses = ?, passkey = ? WHERE username = ?",
                       (responses_json, passkey, username))
        conn.commit()
    except Exception as e:
        print(f"❌ Error saving data: {e}")

    conn.close()

# 3️⃣ Retrieve all users' data from the database
def get_all_users():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("SELECT username, responses FROM users")  # Fetch all users
    users = cursor.fetchall()
    conn.close()

    user_list = []
    for username, responses in users:
        user_data = json.loads(responses)  # Convert JSON string back to a Python dictionary
        user_data["username"] = username  # Add username to the dictionary
        user_list.append(user_data)

    return user_list  # Return list of users with their responses

# 4️⃣ Get matching users based on shared interests, hobbies, and traits
def get_matching_users(username):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Fetch the current user's responses
    cursor.execute("SELECT responses FROM users WHERE username = ?", (username,))
    user_data = cursor.fetchone()
    
    if not user_data:
        return []  # Return empty list if user is not found

    user_data = json.loads(user_data[0])  # Convert JSON back to dictionary
    all_users = get_all_users()  # Fetch all stored users

    # Remove the current user from the matching list
    all_users = [u for u in all_users if u["username"] != username]

    # Matching logic
    matches = []
    for u in all_users:
        score = 0
        total_possible_matches = 0

        # Compare interests, hobbies, subreddits, and traits
        for key in ['interests', 'hobbies', 'subreddits', 'traits']:
            if key in user_data and key in u:
                total_possible_matches += max(len(user_data[key]), len(u[key]))  # Max possible matches
                common_items = len(set(user_data[key]) & set(u[key]))  # Count actual matches
                score += common_items

        # Convert score to percentage (1-100)
        if total_possible_matches > 0:
            score = round((score / total_possible_matches) * 100, 1)  # Normalize to percentage

        if score > 10:  # Only consider strong matches
            matches.append({'username': u['username'], 'score': score})

    matches.sort(key=lambda x: x['score'], reverse=True)  # Sort highest matches first

    return matches  # Return sorted list of matches