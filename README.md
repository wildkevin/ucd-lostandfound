# UC Davis Lost&Found

Ye Wang, Shuqing Li

## General flow
In the very beginning, it has a login page for the user. If you use the non-ucd email, 
it will bring you back to the login page and pop up an alert message. After login in with
the ucd email, it will bring you to the user website or the main website.

The founder and seeker use the same html and css file, but there are some function in the js
file to switch the background or the text in each page based on the URL (http//...?type=found/lost)

In the info1.html page, you will need to enter the required information: title, category, and description,
but photo is optional. After that, you can hit next to fill in the rest information. At this point,
the information you have just entered will be inserted into the database. In the info2.html, you will
need to fill in all other required field: date and location. If you leave anything blank, there will
be an alert box poping up.

After filling in all the information, you could hit submit. Then, you will get an alert box saying 
you have successfully submitted the item, and bring back you to the main page.

If at anypoint, you hit the search bar at the bottom of the page, it will bring you to the search page.
In the search page, you are required to fill in at least one field: date or category or location. Otherwise,
there will be an alert box poping up. Besides, once you want to fill in the date field, you are required to
fill in all the date and time. Otherwise, there will be an alert box.

Once you hit the search, it will bring you to the display page based on the information you just entered.
All of these items are collapsible items, hit MORE or LESS to show or hide the infos. Some of them include
images, but some do not. There is also an "edit search" button that brings back you to the search page and
you could re-search agagin.

Lastly, the UC Davis Lost&Found logo on the top right in each page is also a button that brings you back
to the main page.

## Design and Style

The search bar is just a button that could not enter input. The image will be uploaded to ecs162.org and
once you uploaded the image, it will only show the name of the image instead of showing the image itself.

Instead of filling the page entired, we leave some space in each side for a better view in all mobile, 
laptop, ipad version.

There are no big difference among versions, only the size, flex-direction, and texts. In the last display
page, it is showing in rows in desktop and ipad versions, but in columns in mobile versions, in order
to display the image better.

## Tech

In the map, we use the reverse geocoding instead. Thus, you could choose location from the fixed list, or
click any points on the map and it will bring you the exact address back to the location field, or you could
just type anything you want. In the category field, you could either choose one from the given list, or type
anything you want.

The searching method we use is that based on the date, category, and location you provide, we will search
the database use "OR". In other words, it is something like "SELECT * FROM LostFoundTable WHERE type="found" AND
(date = XXX OR category = XXX OR location = XXX)" because we believe that it will bring more related results back
to the user. While using "AND" will be too restricted and in real world, it usually will not be a good choice too.

