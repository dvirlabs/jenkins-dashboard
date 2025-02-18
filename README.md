# Status Builds

פרויקט זה מציג סטטוס של בניות Jenkins בצורה נוחה באמצעות ממשק משתמש מבוסס React ושירות Backend המבוסס על FastAPI.

## הרצה באמצעות קונטיינרים

כדי להריץ את הפרויקט בעזרת Docker, יש להפעיל את הקונטיינרים הבאים:

### Backend

הפקודה הבאה תפעיל את ה-Backend בקונטיינר Docker, עם משתנים סביבתיים רלוונטיים:

```sh
docker run -d --rm --name backend -p 8000:8000 \
  -e JENKINS_URL=http://jenkins-url \
  -e JENKINS_USERNAME=jenkins-username \
  -e API_KEY=jenkins-api-token \
  -e MAIN_BRANCH=desired-branch \
  status-builds:backend-v2
```

#### הסבר על המשתנים:

- `JENKINS_URL` - כתובת ה-Jenkins ממנו נאסף המידע.
- `JENKINS_USERNAME` - שם המשתמש עבור Jenkins.
- `API_KEY` - מפתח הגישה ל-Jenkins.
- `MAIN_BRANCH` - ענף ברירת המחדל המשמש להשוואת בניות.

### Frontend

הפקודה הבאה תפעיל את ה-Frontend בקונטיינר Docker, עם משתנים סביבתיים מותאמים:

```sh
docker run -d --rm --name frontend -p 3000:3000 \
  -e REACT_APP_API_URL=http://backend-url:8000 \
  -e REACT_APP_BUILDS_PATH=jenkins-jobs-folder \
  -e REACT_APP_TEAM_NAME=team-name\
  -e REACT_APP_MAIN_BRANCH=desired-branch \
  status-builds:frontend-v2
```

#### הסבר על המשתנים:

- `REACT_APP_API_URL` - כתובת ה-Backend שממנה ה-Frontend יקבל מידע.
- `REACT_APP_BUILDS_PATH` - הנתיב שבו מאוחסנים נתוני הסטטוסים של הבניות.
- `REACT_APP_TEAM_NAME` - שם הצוות שמוצג בממשק המשתמש.
- `REACT_APP_MAIN_BRANCH` - ענף ברירת המחדל להצגת נתוני הבניות.

לאחר הרצת הפקודות, ניתן לגשת לממשק המשתמש בכתובת:

```
http://localhost:3000
```

