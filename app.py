# app.py
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/switchup"
mongo = PyMongo(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    users = mongo.db.users
    
    if users.find_one({"email": data['email']}):
        return jsonify({"error": "Email already exists"}), 400
    
    user_id = users.insert_one({
        "email": data['email'],
        "password": data['password']  # In production, hash this!
    }).inserted_id
    
    return jsonify({
        "id": str(user_id),
        "email": data['email']
    })


@app.route('/api/listings', methods=['GET', 'POST'])
def handle_listings():
    if request.method == 'GET':
        listings = list(mongo.db.listings.find({}))
        return jsonify([{
            'id': str(listing['_id']),
            'title': listing['title'],
            'description': listing['description'],
            'category': listing['category'],
            'image': listing.get('image_url', '')
        } for listing in listings])
    
    elif request.method == 'POST':
        # Handle file upload
        image = request.files.get('image')
        image_url = ''
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join('static/uploads', filename))
            image_url = f'/static/uploads/{filename}'
        
        listing = {
            'title': request.form['title'],
            'description': request.form['description'],
            'category': request.form['category'],
            'user_id': request.form['userId'],
            'image_url': image_url,
            'created_at': datetime.utcnow()
        }
        
        listing_id = mongo.db.listings.insert_one(listing).inserted_id
        return jsonify({'id': str(listing_id)})

if __name__ == '__main__':
    app.run(debug=True)