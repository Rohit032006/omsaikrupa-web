# 🚀 Om Sai Krupa — 100% FREE Deployment Guide

हे संपूर्ण गाइड वापरून तुम्ही Frontend आणि Backend दोन्हींना **१ रूपयाही खर्च न करता (100% FREE)** २४/७ चालू ठेवू शकता.

---

## 🏗️ Deployment Architecture (मोफत सेटअप)

| Component | Platform | Plan | Cost |
|---|---|---|---|
| **Frontend (React + Vite)** | **Vercel** | Hobby Plan | **₹0 (Free)** |
| **Backend (Node.js API)** | **Render.com** | Free Web Service | **₹0 (Free)** |
| **Code Repository** | **GitHub** | Public/Private Repo | **₹0 (Free)** |
| **SSL Certificate (HTTPS)** | Automatic | Auto-renewing | **₹0 (Free)** |

---

## 📋 पायरी १: GitHub वर कोड पुश करणे (Push to GitHub)

तुमच्या कॉम्प्युटरवर `git` आधीच initialize केला आहे आणि सर्व फाइल्स commit केल्या आहेत.

1. **[github.com](https://github.com/)** वर जाऊन लॉगिन करा.
2. उजव्या कोपऱ्यात **`+` (New repository)** वर क्लिक करा.
3. नाव द्या: `omsaikrupa-web`
4. **Public** किंवा **Private** निवडा.
5. "Initialize with README" अनचेक ठेवा आणि **Create repository** दाबा.
6. तुमच्या VS Code किंवा Terminal मध्ये खालील कमांड्स रन करा:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/omsaikrupa-web.git
git branch -M main
git push -u origin main
```

*(टीप: `<YOUR_GITHUB_USERNAME>` च्या जागी तुमचे GitHub वापरकर्ता नाव टाका)*

---

## ⚙️ पायरी २: Backend Deploy करणे (Render.com वर Free)

1. **[dashboard.render.com](https://dashboard.render.com/)** वर जाऊन मोफत अकाउंट उघडा (GitHub ने साइन इन करा).
2. **New +** बटणावर क्लिक करून **"Web Service"** निवडा.
3. तुमची GitHub repository `omsaikrupa-web` सिलेक्ट करून **Connect** करा.
4. खालील सेटिंग्स भरा:
   - **Name:** `omsaikrupa-backend`
   - **Region:** `Singapore` (भारतासाठी सर्वात वेगवान)
   - **Root Directory:** `backend` ⚠️ *(फार महत्त्वाचे: `backend` टाका)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (₹0/month)

5. खाली स्क्रोल करून **Environment Variables** सेक्शनमध्ये हे ॲड करा:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `omsaikrupa_jwt_secret_key_2026_very_secure`
   - `JWT_EXPIRES_IN` = `7d`
   - `DB_PATH` = `./data/omsaikrupa.db`
   - `DEFAULT_UPI_ID` = `8080959502@kotakbank`
   - `DEFAULT_MERCHANT_NAME` = `Om Sai Krupa`
   - `DEFAULT_SUPPORT_PHONE` = `+91 8080959502`
   - `DEFAULT_SUPPORT_EMAIL` = `omsaikrupa@gmail.com`

6. **"Deploy Web Service"** वर क्लिक करा.
7. २-३ मिनिटांत तुमचा Backend लाईव्ह होईल!
8. Render वरून तुम्हाला एक URL मिळेल, जसे:
   👉 `https://omsaikrupa-backend.onrender.com`

---

## 🌐 पायरी ३: Frontend Deploy करणे (Vercel वर Free)

1. **[vercel.com](https://vercel.com/)** वर जाऊन मोफत अकाउंट तयार करा (GitHub ने लॉगिन करा).
2. **"Add New Project"** वर क्लिक करा.
3. तुमची `omsaikrupa-web` repository सिलेक्ट करा.
4. सेटिंग्स:
   - **Framework Preset:** `Vite` (आपोआप डिटेक्ट होते)
   - **Root Directory:** `./` (Default राहू द्या)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Environment Variables** सेक्शन उघडा आणि खालील व्हेरिएबल ॲड करा:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://omsaikrupa-backend.onrender.com/api`
   *(तुमच्या Render Backend च्या URL पुढे `/api` लावायला विसरू नका!)*

6. **"Deploy"** बटण दाबा.
7. फक्त १ मिनिटात तुमची संपूर्ण वेबसाईट लाईव्ह होईल आणि तुम्हाला एक मोफत कस्टम लिंक मिळेल, जसे:
   🎉 **`https://omsaikrupa-web.vercel.app`**

---

## 🔄 पायरी ४: शेवटी Render Backend मध्ये Frontend ची URL अपडेट करणे

Backend ला तुमच्या Vercel Frontend कडून येणाऱ्या सर्व Requests सुरक्षितपणे पास करता याव्यात म्हणून:
1. Render.com डॅशबोर्डवर जा → तुमच्या `omsaikrupa-backend` वर क्लिक करा.
2. डाव्या बाजूला **Environment** वर क्लिक करा.
3. `CORS_ORIGIN` किंवा `FRONTEND_URL` मध्ये तुमची Vercel URL टाका:
   - `FRONTEND_URL` = `https://omsaikrupa-web.vercel.app`
4. **Save Changes** दाबा. Render आपोआप रीस्टार्ट होईल.

---

## 🔑 ॲडमिन लॉगिन डिटेल्स (Production)

वेबसाईट लाईव्ह झाल्यावर तुम्ही ॲडमिन पॅनेलमध्ये खालील डिटेल्सने लगेच लॉगिन करू शकता:
- **URL:** `https://your-site.vercel.app/login`
- **Admin Email:** `admin@omsaikrupa.com`
- **Admin Password:** `Admin@123`

---

## ✅ सर्व काही तयार आहे!
- [x] Vercel SPA routing साठी `vercel.json` तयार केला आहे (पेज रीफ्रेश केल्यावर 404 येणार नाही).
- [x] `src/services/api.ts` मध्ये `import.meta.env.VITE_API_URL` डायनॅमिक केला आहे.
- [x] Backend मधील CORS सर्व Vercel डोमेन्स आणि प्रोडक्शन साठी कॉन्फिगर केले आहे.
- [x] Git Repository आणि Initial Clean Commit तयार आहे.
