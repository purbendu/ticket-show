from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask import current_app
from sqlalchemy.orm import relationship

db = SQLAlchemy()

class User(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True,nullable=False)
    email = db.Column(db.String(100),nullable=False)
    password = db.Column(db.String(200),nullable=False)
    admin = db.Column(db.Boolean,nullable=False)
    name = db.Column(db.String(100),nullable=False)
    lastBooked = db.Column(db.String(100),nullable=False)

class Venue(db.Model):
    __tablename__ = 'venue'
    id = db.Column(db.Integer, primary_key=True,nullable=False)
    name = db.Column(db.String(100),nullable=False)
    place = db.Column(db.String(500),nullable=False)
    totalSeats = db.Column(db.Integer,nullable=False)


class Shows(db.Model):
    __tablename__ = 'shows'
    id = db.Column(db.Integer, primary_key=True,nullable=False)
    nameOfShow = db.Column(db.String(100),nullable=False)
    ticketPrice = db.Column(db.Integer,nullable=False)
    venueId = db.Column(db.Integer,db.ForeignKey('venue.id'),nullable=False)
    startTime = db.Column(db.String(50),nullable=False)
    endTime = db.Column(db.String(50),nullable=False)
    tags = db.Column(db.String(100))
    ratings = db.Column(db.String(100), nullable=False)
    bookedSeats = db.Column(db.Integer,nullable=False)

    venue = relationship('Venue', backref='shows', lazy = "subquery")
    
class Bookings(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    userId = db.Column(db.Integer,db.ForeignKey('user.id'), nullable=False)
    showId = db.Column(db.Integer,db.ForeignKey('shows.id'), nullable=False)
    count = db.Column(db.Integer, nullable=False)
    userRating = db.Column(db.Integer, nullable=False)
    show = relationship('Shows', backref='bookings', lazy = "subquery")
