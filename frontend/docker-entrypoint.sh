#!/bin/sh

# החלפת משתני סביבה בקובץ env.js.template
envsubst '\$REACT_APP_API_URL \$REACT_APP_BUILDS_PATH \$REACT_APP_TEAM_NAME \$REACT_APP_MAIN_BRANCH' < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js

# הדפסה לבדיקת הפלט
cat /usr/share/nginx/html/env.js

# הרצת nginx
exec "$@"
