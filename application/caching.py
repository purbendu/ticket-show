from .models import User,Venue, Shows, Bookings
from . import cache

@cache.memoize()
def getShowsByVenue(id):
    show = Shows.query.filter_by(venueId=id).all()
    return show

@cache.memoize
def getBookingsByUser(id):
    bookings = Bookings.query.filter_by(userId=id).all()
    return bookings

@cache.memoize
def getBookingsByShow(id):
    bookings = Bookings.query.filter_by(showId=id).all()
    return bookings

@cache.memoize
def getBookingsById(id):
    bookings = Bookings.query.filter_by(id=id).first()
    return bookings

@cache.memoize()
def getUserByEmail(email):
    user = User.query.filter_by(email=email).first()
    return user

@cache.memoize
def getShowById(id):
    show = Shows.query.filter_by(id=id).first()
    return show

@cache.memoize
def getVenueByName(name):
    venue = Venue.query.filter_by(name=name).first()
    return venue

@cache.memoize
def getVenueById(id):
    venueDetails = Venue.query.filter_by(id=id).first()
    return venueDetails

@cache.memoize
def getVenueDetailsForSearch(query):
    showNames = Shows.query.filter(Shows.nameOfShow.like(query)).all()
    showTags = Shows.query.filter(Shows.tags.like(query)).all()
    venues = Venue.query.filter(Venue.name.like(query)).all()

    return showNames,showTags,venues