----------------------
|agency.txt|	Required|	One or more transit agencies that provide the data in this feed.|
|stops.txt|	Required|	Individual locations where vehicles pick up or drop off passengers.|
|routes.txt|	Required|	Transit routes. A route is a group of trips that are displayed to riders as a single service.|
|trips.txt|	Required|	Trips for each route. A trip is a sequence of two or more stops that occurs at specific time.|
|stop_times.txt|Required|	Times that a vehicle arrives at and departs from individual stops for each trip.|
|calendar.txt|	Required|	Dates for service IDs using a weekly schedule. Specify when service starts and ends, as well as days of the week where service is available.|
|calendar_dates.txt|	Optional|	Exceptions for the service IDs defined in the calendar.txt file. If calendar_dates.txt includes ALL dates of service, this file may be specified instead of calendar.txt.|
|shapes.txt|	Optional|	Rules for drawing lines on a map to represent a transit organization's routes.|
|frequencies.txt|	Optional|	Headway (time between trips) for routes with variable frequency of service.|
---------------------------

From https://developers.google.com/transit/gtfs/reference#trips_fields


## Problems

Repeated poles for a route

## stops.txt

## stop_times.txt

## trips.txt

A trip is a sequence of two or more stops that occurs at specific time. 
Since we use frequencies.txt, we need just the first trip of the day.

| property    | mapping                      |
----------------------------------------------------------
| route_id    | OSM master route relation id            |
| service_id  | W, NW, SW                               |
| trip_id     | UUID(*)    |
| shape_id    | OSM route relation id                   |
----------------------------------------------------------

(*) trip_id should be different for different services, we need to create multiple entries in tables where trip_id is a foreign key


## frequencies.txt

Modify the following values by hand checking on Miccolis timetables

__START_TIME_
The time is measured from "noon minus 12h"

__END_TIME_
The time is measured from "noon minus 12h"

__60

## calendar

W working days
NW non working days
S-W summer working days

Note: some lines might not serve at sundays. 
Please verify on Miccolis timetables and remove the corresponding row.

## calendar_dates