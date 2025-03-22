def match_users(user_data, users):
    matches = []
    
    for u in users:
        if u["username"] == user_data["username"]:  # Skip matching with self
            continue
        
        score = 0
        total_possible_matches = 0
        
        for key in ['interests', 'hobbies', 'subreddits', 'traits']:
            if key in user_data and key in u:
                total_possible_matches += max(len(user_data[key]), len(u[key]))  # Max possible matches
                common_items = len(set(user_data[key]) & set(u[key]))  # Count actual matches
                score += common_items
        
        # Scale to 1-100
        if total_possible_matches > 0:
            score = round((score / total_possible_matches) * 100, 1)  # Convert to percentage
        
        if score > 10:  # Adjust minimum threshold for better results
            matches.append({'username': u['username'], 'score': score})

    matches.sort(key=lambda x: x['score'], reverse=True)  # Sort by highest match score
    return matches
