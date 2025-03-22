from flask import Flask, render_template, request, jsonify
from database import init_db, save_user_data, get_matching_users, get_all_users
from matching import match_users  # Import matching logic

app = Flask(__name__)
init_db()  # Initialize the database

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    save_user_data(username, data, None)  # Save without passkey
    return jsonify({'message': 'Data saved successfully'})

@app.route('/match/<username>', methods=['GET'])
def match(username):
    users = get_all_users()  # Fetch all users
    current_user = next((u for u in users if u["username"] == username), None)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    matches = match_users(current_user, users)  # Compute match scores
    return render_template('match.html', username=username, matches=matches)

if __name__ == '__main__':
    app.run(debug=True)