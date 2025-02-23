#!/bin/sh

# יצירת קובץ env.js מהתבנית בעזרת envsubst
envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js

# הפעלת nginx
exec "$@"