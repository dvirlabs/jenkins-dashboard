#!/bin/sh

# החלפת משתני סביבה בקובץ env.js.template
envsubst < /usr/share/nginx/html/env.js > /usr/share/nginx/html/env.js

# הרצת nginx
exec "$@"
