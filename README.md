## Marc Reardon | marcuscop | Practice Evaluator

Practice Evaluator

#Background:
The "COX Orb" is a mechanical device that records location and time, similar to a GPS. The WPI Rowing Team uses the COX Orb to record practice data. The full list of the data it records is here:
  1. Longitude
  2. Latitude
  3. Time of Day
  4. Elapsed time
  5. Speed (split/500meters)
  6. Speed (meters/second)
  7. Total Distance
  8. Distance per Stroke
  9. Strokes per minute
  10. Check Factor (smoothness of stoke)
  11. Total Stroke Count

#Problem:
This data is viewable via .csv and .gpx files which are extracted from the COX Orb, but there is no graphical way to visualize the data so it is difficult to analyze after practice.

#Solution:
To solve this problem, the "Practice Evaluator" will
  1. Parse the .gpx and .csv files and store the data.
  2. Plot the longitude and latitude points on a google maps path.
  3. Show speed, and other information, at every point on the path.

#Notes:
1. The Practice Evaluator shows only one path at a time.
2. Press the Reset button if a file is uploaded in the wrong spot (gpx as csv, csv as gpx).
3. There are sample .GPX and .CSV files in the SAMPLE_FILES folder. (They contain actual data from WPI Rowings' races this season!!)
   - A single .GPX file corresponds to a single .CSV. They must be used together.
      - Riverfront.gpx -> Riverfront.csv
      - Snake.gpx -> Snake.csv

## Technical Achievements
- **Tech Achievement 1**: Complex algorithms:
Using an algorithm in server.js, the app parses any .gpx and .csv files and sorts and stores the data in the DB.
Using an algorihtm in insert.js, gpx data is linked to csv data to match a point on the path to the data that corresponds to it.
- **Tech Achievement 3**: Pooling:
The server uses pooling on its queries so that the csv and gpx data can be retrieved almost simultaneously, instead of waiting for each client to go through a handshake process.

### Design/Evaluation Achievements
- **Design Achievement 1**: Google Maps API:
The Practice Evaluator is able to plot a course anywhere on the world, allowing users to analyze data from any regatta. I tested the application with 4 users (coaches and coxswains), finding that they liked how the map automatically snapped to the beginning of the path. I also changed the application per request to only have only a few stats on each point on the path, instead of listing all the stats for each point.
