from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, Response, request, current_app
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from .models import User, Venue, Shows, Bookings
from datetime import datetime, timedelta
from .models import db
from weasyprint import HTML
import requests
import pandas as pd
from .tasks import generateReport

main = Blueprint("main", __name__)

login_manager = LoginManager()
bcrypt = Bcrypt()

isAdminLoggedIn = False

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
def venue_to_dict(venue):
    return {
        "id": venue.id,
        "name": venue.name,
        "place": venue.place,
        "totalSeats": venue.totalSeats,
    }
def show_to_dict(show):
    return {
        "id": show.id,
        "nameOfShow": show.nameOfShow,
        "tags": show.tags,
        "startTime": show.startTime,
        "endTime": show.endTime,
        "ticketPrice": show.ticketPrice,
        "bookedSeats": show.bookedSeats,
        "ratings": [int(x) for x in show.ratings.split(",")],
    }


@main.route("/")
def home():
    return render_template('home.html')

@main.route("/userLogin/")
def userLogin():
    return render_template('userlogin.html')

@main.route("/userloginAPI", methods=['POST'])
def userLoginAPI():
    data = request.json
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user:
        if bcrypt.check_password_hash(user.password, password):
            if user.admin:
                return jsonify({"error": "Please login as Admin"}), 401
            else:
                login_user(user)
                return jsonify({"message": "Login successful"})
        else:
            return jsonify({"error": "Incorrect Username or Password"}), 401
    else:
        return jsonify({"error": "No account found. Please register first to proceed"}), 404

@main.route("/adminlogin")
def adminLogin():
    if current_user.is_authenticated and isAdminLoggedIn:
        return render_template('adminDashboard.html')
    return render_template('adminLogin.html')

@main.route("/adminloginAPI", methods=['POST'])
def adminLoginAPI():
    global isAdminLoggedIn
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user:
        if bcrypt.check_password_hash(user.password, password) and user.admin:
            login_user(user)
            isAdminLoggedIn = True
            return jsonify({"message": "Login successful"})
        else:
            return jsonify({"error": "Incorrect credentials or user is not an admin"}), 401
    else:
        return jsonify({"error": "Incorrect credentials or user is not an admin"}), 404

@main.route("/register")
def register():
    return render_template('register.html')

@main.route("/registerAPI",methods=['POST'])
def registerAPI():
    data = request.json
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")

    if not email or not name or not password:
        return jsonify({"error": "Email, name, and password are required."}), 400

    existing_user_username = User.query.filter_by(email=email).first()
    if existing_user_username:
        return jsonify({"error": "Duplicate Account"}), 409

    hashedPassword = bcrypt.generate_password_hash(password)
    current_time = datetime.now()
    yesterday = current_time - timedelta(days = 1)

    yesterday = str(yesterday.year) + "-" + str(yesterday.month) + "-" + str(yesterday.day)
    print(yesterday)
    new_user = User(email=email, password=hashedPassword, admin=0, name=name, lastBooked = yesterday)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully."}), 201


@main.route("/adminDashboard", methods=['GET', 'POST'])
@login_required
def adminDashboard():
    if current_user.is_authenticated and isAdminLoggedIn:
        return render_template('adminDashboard.html')
    
    return redirect(url_for('main.adminLogin'))


@main.route("/generateReport/<int:venue_id>")
@login_required
def getReport(venue_id):
    if not isAdminLoggedIn:
        return jsonify({"message": "Unauthorized"}), 401
    
    generateReport.delay(venue_id)
    
    return jsonify({"message": "Successfully downloaded"}), 201

@main.route("/adminDashboardAPI", methods=['GET', 'POST'])
@login_required
def adminDashboardAPI():
    if not isAdminLoggedIn:
        return jsonify({"message": "Unauthorized"}), 401
    
    venues = Venue.query.all()

    shows = {}
    ratings = {}
    for venue in venues:
        if shows.get(venue.id) is None:
            shows[venue.id] = []
        all_shows_for_the_venue = Shows.query.filter_by(venueId=venue.id).all()
        shows[venue.id].extend(all_shows_for_the_venue)
        for show in all_shows_for_the_venue:
            if ratings.get(venue.id) is None:
                ratings[venue.id] = {}
            if ratings[venue.id].get(show.id) is None:
                ratings[venue.id][show.id] = []
            rating_list = show.ratings.split(",")
            if ratings.get(int(venue.id)) == None:
                ratings[int(venue.id)] = {}

            ratings[venue.id][show.id] = [int(x) for x in rating_list]

    data = {
        "venues": [venue_to_dict(venue) for venue in venues],
        "shows": {venue_id: [show_to_dict(show) for show in show_list] for venue_id, show_list in shows.items()},
        "ratings": ratings,
    }

    return jsonify(data)

@main.route("/addVenue/")
@login_required
def addVenue():
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    return render_template('addVenue.html')

@main.route("/addVenueAPI", methods=['POST'])
@login_required
def addVenueAPI():
    if not isAdminLoggedIn:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json
    venueName = data.get("venue")
    location = data.get("location")
    seat_capacity = data.get("seat_capacity")
    venueDetails = Venue.query.filter_by(name=venueName).first()
    if venueDetails:
        return jsonify({"message": "Duplicate Venue"}), 400
    else:
        entry = Venue(name=venueName, place=location, totalSeats=seat_capacity)
        db.session.add(entry)
        db.session.commit()
        db.session.close_all()
        return jsonify({"message": "Venue added successfully. You'll be redirected to dashboard in 5 seconds"}), 200

@main.route("/editVenue/<int:venue_id>")
@login_required
def editVenue(venue_id):
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    return render_template('editVenue.html',venue_id=venue_id)

@main.route("/editVenueAPI/<int:venue_id>", methods=['GET','POST'])
@login_required
def editVenueAPI(venue_id):
    if not isAdminLoggedIn:
        return jsonify({"message": "Unauthorized"}), 401

    venueDetails = Venue.query.filter_by(id=venue_id).first()
    if request.method == 'POST':
        data = request.get_json()
        location = data.get("location")
        venue_name = data.get("venue_name")
        seat_capacity = data.get("seat_capacity")

        venueDetails.name = venue_name
        venueDetails.place = location
        venueDetails.totalSeats = seat_capacity
        db.session.commit()
        db.session.close_all()
        return jsonify({"message": "Venue updated successfully. You'll be redirected to dashboard in 5 seconds"}), 200
    else:
        return jsonify({
            "venue_name": venueDetails.name,
            "location": venueDetails.place,
            "seat_capacity": venueDetails.totalSeats
        }), 200

@main.route("/deleteVenue/<int:venue_id>",methods=['GET','POST'])
@login_required
def deleteVenue(venue_id):
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    venueDetails = Venue.query.filter_by(id=venue_id).first()

    all_shows_for_the_venue = Shows.query.filter_by(venueId=venueDetails.id).all()
    for show in all_shows_for_the_venue:
        bookings = Bookings.query.filter_by(showId=show.id).all()
        for booking in bookings:
            db.session.delete(booking)
            db.session.commit()

        db.session.delete(show)
        db.session.commit()

    db.session.delete(venueDetails)
    db.session.commit()

    return redirect(url_for('main.adminLogin'))

@main.route("/addShow/<int:venue_id>")
@login_required
def addShow(venue_id):
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    return render_template('addShow.html',venue_id=venue_id)

@main.route("/addShowAPI/<int:venue_id>", methods=['POST'])
@login_required
def addShowAPI(venue_id):
    if not isAdminLoggedIn:
        return jsonify({"message": "Unauthorized"}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        nameOfShow = data.get("nameOfShow")
        ticketPrice = data.get("ticketPrice")
        startTime = data.get("startTime")
        endTime = data.get("endTime")
        tags = data.get("tags")

        startTime = datetime.strptime(startTime, "%H:%M").strftime("%I:%M %p")
        endTime = datetime.strptime(endTime, "%H:%M").strftime("%I:%M %p")
        showDetails = Shows.query.filter_by(nameOfShow=nameOfShow, venueId=venue_id).first()
        if showDetails:
            return jsonify({"message": "Duplicate Show"}), 400

        ratings = "0,0,0,0,0,0,0,0,0,0"
        newShow = Shows(nameOfShow=nameOfShow, ticketPrice=ticketPrice, venueId=venue_id,
                        startTime=startTime, endTime=endTime, tags=tags, ratings=ratings, bookedSeats=0)

        db.session.add(newShow)
        db.session.commit()
        return jsonify({"message": "Show added successfully. You'll be redirected to dashboard in 5 seconds"}), 201

    else:
        return jsonify({"message": "Method Not Allowed"}), 405
    

@main.route("/editShow/<int:show_id>",methods=['GET','POST'])
@login_required
def editShow(show_id):
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    return render_template('editShow.html',show_id=show_id)

@main.route("/editShowAPI/<int:show_id>", methods=['GET', 'POST'])
@login_required
def editShowAPI(show_id):
    if not isAdminLoggedIn:
        return jsonify({"error": "Unauthorized"}), 401

    showDetails = Shows.query.filter_by(id=show_id).first()
    print(showDetails.startTime,"  ",showDetails.endTime)
    startTime = datetime.strptime(showDetails.startTime, "%I:%M %p").strftime("%H:%M")
    endTime = datetime.strptime(showDetails.endTime, "%I:%M %p").strftime("%H:%M")

    if request.method == 'POST':
        data = request.get_json()
        name = data.get("name")
        ticketPrice = data.get("ticketPrice")
        startTime = data.get("startTime")
        endTime = data.get("endTime")
        tags = data.get("tags")

        startTime = datetime.strptime(startTime, "%H:%M").strftime("%I:%M %p")
        endTime = datetime.strptime(endTime, "%H:%M").strftime("%I:%M %p")

        showDetails.nameOfShow = name
        showDetails.ticketPrice = ticketPrice
        showDetails.startTime = startTime
        showDetails.endTime = endTime
        showDetails.tags = tags
        db.session.commit()
        db.session.close_all()

        return jsonify({"message": "Show details updated successfully. You'll be redirected to dashboard in 5 seconds"})
    else:
        show_data = {
            "nameOfShow": showDetails.nameOfShow,
            "ticketPrice": showDetails.ticketPrice,
            "startTime": startTime,
            "endTime": endTime,
            "tags": showDetails.tags,
        }
        return jsonify(show_data)
    
@main.route("/deleteShow/<int:show_id>",methods=['GET','POST'])
@login_required
def deleteShow(show_id):
    if not isAdminLoggedIn:
        return redirect(url_for('main.adminLogin'))
    
    showDetails = Shows.query.filter_by(id=show_id).first()

    bookings = Bookings.query.filter_by(showId=showDetails.id).all()
    for booking in bookings:
        db.session.delete(booking)
        db.session.commit()

    db.session.delete(showDetails)
    db.session.commit()
    return redirect(url_for('main.adminLogin'))

@main.route("/userDashboard/")
@login_required
def userDashboard():
    return render_template("userDashboard.html",user=current_user)

@main.route("/userDashboardAPI")
def userDashboardAPI():
    venues = Venue.query.all()
    user_dashboard_data = []
    shows = {}
    ratings = {}

    for venue in venues:
        if shows.get(venue.id) is None:
            shows[venue.id] = []
        all_shows_for_the_venue = Shows.query.filter_by(venueId=venue.id).all()
        shows[venue.id].extend(all_shows_for_the_venue)
        for show in all_shows_for_the_venue:
            if ratings.get(venue.id) is None:
                ratings[venue.id] = {}
            if ratings[venue.id].get(show.id) is None:
                ratings[venue.id][show.id] = []
            str = show.ratings.split(",")
            avgRating = 0
            count = 0
            for i in range(10):
                avgRating += (i+1)*int(str[i])
                count += int(str[i])
            if ratings.get(int(venue.id)) == None:
                ratings[int(venue.id)] = {}
            if count == 0:
                ratings[int(venue.id)][int(show.id)] = 0.0
            else:
                ratings[int(venue.id)][int(show.id)] = avgRating/count

    data = {
        "venues": [venue_to_dict(venue) for venue in venues],
        "shows": {venue_id: [show_to_dict(show) for show in show_list] for venue_id, show_list in shows.items()},
        "ratings": ratings,
    }
    return jsonify(data)

@main.route("/search/<string:query>")
@login_required
def search(query):
    query = "%{}%".format(query)
    showNames = Shows.query.filter(Shows.nameOfShow.like(query)).all()
    showTags = Shows.query.filter(Shows.tags.like(query)).all()
    venues = Venue.query.filter(Venue.name.like(query)).all()
    user_dashboard_data = []
    shows = {}
    ratings = {}

    for venue in venues:
        if shows.get(venue.id) is None:
            shows[venue.id] = []
        all_shows_for_the_venue = Shows.query.filter_by(venueId=venue.id).all()
        shows[venue.id].extend(all_shows_for_the_venue)
        for show in all_shows_for_the_venue:
            if ratings.get(venue.id) is None:
                ratings[venue.id] = {}
            if ratings[venue.id].get(show.id) is None:
                ratings[venue.id][show.id] = []
            str = show.ratings.split(",")
            avgRating = 0
            count = 0
            for i in range(10):
                avgRating += (i+1)*int(str[i])
                count += int(str[i])
            if ratings.get(int(venue.id)) == None:
                ratings[int(venue.id)] = {}
            if ratings[int(venue.id)].get(int(show.id)) == None:
                ratings[int(venue.id)][int(show.id)] = 0.0

            if count > 0:
                ratings[int(venue.id)][int(show.id)] = avgRating/count
    
    for show in showNames:
        if shows.get(show.venue.id) is None:
            shows[show.venue.id] = []
        if show in shows[show.venue.id]:
            continue

        shows[show.venue.id].append(show)

        str = show.ratings.split(",")
        avgRating = 0
        count = 0
        for i in range(10):
            avgRating += (i+1)*int(str[i])
            count += int(str[i])
        if ratings.get(int(show.venue.id)) == None:
            ratings[int(show.venue.id)] = {}
            venues.append(show.venue)

        if ratings[int(show.venue.id)].get(int(show.id)) == None:
            ratings[int(show.venue.id)][int(show.id)] = 0.0
        
        if count > 0:
            ratings[int(show.venue.id)][int(show.id)] = avgRating/count
    
    for show in showTags:
        if shows.get(show.venue.id) is None:
            shows[show.venue.id] = []

        if show in shows[show.venue.id]:
            continue
        shows[show.venue.id].append(show)

        str = show.ratings.split(",")
        avgRating = 0
        count = 0
        for i in range(10):
            avgRating += (i+1)*int(str[i])
            count += int(str[i])
        if ratings.get(int(show.venue.id)) == None:
            ratings[int(show.venue.id)] = {}
            venues.append(show.venue)
        
        if ratings[int(show.venue.id)].get(int(show.id)) == None:
            ratings[int(show.venue.id)][int(show.id)] = 0.0
        if count >0:
            ratings[int(show.venue.id)][int(show.id)] = avgRating/count
    data = {
        "venues": [venue_to_dict(venue) for venue in venues],
        "shows": {venue_id: [show_to_dict(show) for show in show_list] for venue_id, show_list in shows.items()},
        "ratings": ratings,
    }
    return jsonify(data)

@main.route("/bookings")
@login_required
def bookings():
    return render_template("showBookings.html",user=current_user)

@main.route("/bookingsAPI",methods=['POST'])
@login_required
def bookingsAPI():
    bookings = Bookings.query.filter_by(userId=current_user.id).all()


    bookings_data = []
    for booking in bookings:
        booking_data = {
            "id": booking.id,
            "venue_name": booking.show.venue.name,
            "show_name": booking.show.nameOfShow,
            "show_timing": f"{booking.show.startTime} to {booking.show.endTime}",
            "ticket_count": booking.count,
        }
        bookings_data.append(booking_data)

    return jsonify(bookings_data)

@main.route("/rateShow/<int:booking_id>")
@login_required
def rateShow(booking_id):
    bookings = Bookings.query.filter_by(id=booking_id).first()
    return render_template("rating.html",bookings=bookings,user=current_user)

@main.route("/rateShowAPI/<int:booking_id>", methods=['POST'])
@login_required
def rateShowAPI(booking_id):
    booking = Bookings.query.filter_by(id=booking_id).first()

    data = request.get_json()
    rating = data.get("rating")

    rating = int(rating)

    prev_rating = booking.userRating
    booking.userRating = rating

    ratings = booking.show.ratings.split(",")
    ratings[rating - 1] = int(ratings[rating - 1]) + 1
    if prev_rating > 0:
        ratings[prev_rating - 1] = int(ratings[prev_rating - 1]) - 1

    new_rating = ",".join(map(str, ratings))
    booking.show.ratings = new_rating

    db.session.commit()
    return jsonify({"message": "Rating updated successfully. You'll be redirected to dashboard in 5 seconds"}), 200

@main.route("/bookShow/<int:show_id>")
@login_required
def bookShow(show_id):
    show = Shows.query.filter_by(id=show_id).first()
    return render_template("bookShow.html",show=show,user=current_user)

@main.route("/bookShowAPI/<int:show_id>", methods=['GET','POST'])
@login_required
def bookShowAPI(show_id):
    data = request.get_json()
    ticket_count = int(data.get("ticketCount"))

    show = Shows.query.filter_by(id=show_id).first()

    if not isinstance(ticket_count, int) or ticket_count <= 0:
        return jsonify({"error": "Please book atleast one ticket"}), 400

    totalSeats = show.venue.totalSeats
    seats = show.bookedSeats
    if seats + ticket_count > totalSeats:
        return jsonify({"error": f"You cannot book more than {totalSeats-seats} seats"}), 400
    seats += ticket_count
    show.bookedSeats = seats

    current_time = datetime.now()
    today = str(current_time.year) + "-" + str(current_time.month) + "-" + str(current_time.day)
    current_user.lastBooked = today

    entry = Bookings(userId=current_user.id, showId=show_id, count=ticket_count, userRating=0)
    db.session.add(entry)
    db.session.commit()
    db.session.close_all()

    return jsonify({"message": "Show booked successfully. You'll be redirected to dashboard in 5 seconds"}), 200

@main.route("/logout",methods=['GET','POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.home'))
