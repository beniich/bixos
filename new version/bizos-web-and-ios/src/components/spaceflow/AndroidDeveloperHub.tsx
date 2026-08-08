import React, { useState } from 'react';
import { 
  Smartphone, Code, FileCode, Cpu, Download, Copy, Check, 
  ExternalLink, Layers, ShieldCheck, Terminal, BookOpen, Sparkles
} from 'lucide-react';

export const AndroidDeveloperHub: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'mainActivity' | 'buildGradleApp' | 'buildGradleProject' | 'manifest' | 'googleServices' | 'readme'>('mainActivity');
  const [copied, setCopied] = useState<boolean>(false);

  const fileContents = {
    mainActivity: {
      filename: 'android/app/src/main/java/com/bizos/gmao/MainActivity.kt',
      language: 'kotlin',
      code: `package com.bizos.gmao

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class SiteLocation(
    val id: String = "",
    val name: String = "",
    val city: String = "",
    val status: String = "operational",
    val activeFailure: String = ""
)

class MainActivity : ComponentActivity() {
    private lateinit var firestore: FirebaseFirestore
    private val _sites = MutableStateFlow<List<SiteLocation>>(emptyList())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        firestore = FirebaseFirestore.getInstance()

        // Realtime Firestore Snapshot Listener
        firestore.collection("sites").addSnapshotListener { snapshot, _ ->
            if (snapshot != null) {
                _sites.value = snapshot.documents.mapNotNull { doc ->
                    doc.toObject(SiteLocation::class.java)?.copy(id = doc.id)
                }
            }
        }

        setContent {
            MaterialTheme(colorScheme = darkColorScheme(background = Color(0xFF140826))) {
                BizOSAndroidDashboard(_sites.collectAsState())
            }
        }
    }
}`
    },
    buildGradleApp: {
      filename: 'android/app/build.gradle',
      language: 'groovy',
      code: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'com.google.gms.google-services'
}

android {
    namespace 'com.bizos.gmao'
    compileSdk 34

    defaultConfig {
        applicationId "com.bizos.gmao"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildFeatures {
        compose true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation platform('androidx.compose:compose-bom:2024.02.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'

    // Firebase SDKs
    implementation platform('com.google.firebase:firebase-bom:32.7.2')
    implementation 'com.google.firebase:firebase-auth-ktx'
    implementation 'com.google.firebase:firebase-firestore-ktx'
}`
    },
    buildGradleProject: {
      filename: 'android/build.gradle',
      language: 'groovy',
      code: `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        classpath 'com.google.gms:google-services:4.4.0'
    }
}`
    },
    manifest: {
      filename: 'android/app/src/main/AndroidManifest.xml',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:label="BizOS GMAO"
        android:theme="@style/Theme.BizOSGMAO">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
    },
    googleServices: {
      filename: 'android/app/google-services.json',
      language: 'json',
      code: `{
  "project_info": {
    "project_number": "326625297127",
    "project_id": "tribal-domain-j9v0l",
    "storage_bucket": "tribal-domain-j9v0l.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:326625297127:android:bizosgmaonativeclient001",
        "android_client_info": {
          "package_name": "com.bizos.gmao"
        }
      },
      "api_key": [
        {
          "current_key": "AIzaSyC9sNmvPQW83Ov6qD-Wxt8yhS87X8Zq9-A"
        }
      ]
    }
  ],
  "configuration_version": "1"
}`
    },
    readme: {
      filename: 'android/README_ANDROID.md',
      language: 'markdown',
      code: `# BizOS GMAO — Native Android App (Kotlin + Compose)

## ⚡ Real-Time Firebase Sync
All entries and declarations made by the Admin or Collaborators on the web are instantly transmitted to the Android app via Firestore.

## 🛠 Compilation in Android Studio
1. Open Android Studio.
2. Select 'Open an existing project' and point to the '/android' folder.
3. Gradle will download the Firebase Kotlin dependencies.
4. Generate the APK or launch the Android emulator.`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-white font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-[0_0_30px_rgba(217,70,239,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d946ef]/30 to-[#8b5cf6]/40 border border-[#d946ef] flex items-center justify-center text-[#f472b6] shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase tracking-widest border border-purple-500/30">
                HUB CODE DÉVELOPPEUR ANDROID NATIVE
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Kotlin & Jetpack Compose</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Code Source & Configuration <span className="bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#fb923c] bg-clip-text text-transparent">App Android</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Dossier /android Intégré
          </span>
        </div>
      </div>

      {/* Main Code Viewer Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: File Explorer */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#140826]/90 border border-white/10 shadow-xl space-y-3">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#f472b6]" />
            <span>Fichiers Source Android</span>
          </h2>

          <div className="space-y-2 font-mono text-xs">
            
            <button
              onClick={() => setActiveFile('mainActivity')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'mainActivity'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#f472b6]" />
                <span>MainActivity.kt</span>
              </div>
              <span className="text-[10px] text-slate-400">Kotlin</span>
            </button>

            <button
              onClick={() => setActiveFile('buildGradleApp')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'buildGradleApp'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>app/build.gradle</span>
              </div>
              <span className="text-[10px] text-slate-400">Gradle</span>
            </button>

            <button
              onClick={() => setActiveFile('buildGradleProject')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'buildGradleProject'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>build.gradle (Project)</span>
              </div>
              <span className="text-[10px] text-slate-400">Gradle</span>
            </button>

            <button
              onClick={() => setActiveFile('manifest')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'manifest'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>AndroidManifest.xml</span>
              </div>
              <span className="text-[10px] text-slate-400">XML</span>
            </button>

            <button
              onClick={() => setActiveFile('googleServices')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'googleServices'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>google-services.json</span>
              </div>
              <span className="text-[10px] text-slate-400">JSON</span>
            </button>

            <button
              onClick={() => setActiveFile('readme')}
              className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeFile === 'readme'
                  ? 'bg-[#d946ef]/30 border border-[#f472b6] text-white font-bold shadow-lg'
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>README_ANDROID.md</span>
              </div>
              <span className="text-[10px] text-slate-400">Doc</span>
            </button>

          </div>
        </div>

        {/* Right Stage: Code View Window */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-xs text-[#f472b6] font-bold">
              {fileContents[activeFile].filename}
            </span>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#f472b6]" />}
              <span>{copied ? 'Copié !' : 'Copier le Code'}</span>
            </button>
          </div>

          <div className="bg-[#0b0416] p-4 rounded-2xl border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed custom-scrollbar">
            <pre><code>{fileContents[activeFile].code}</code></pre>
          </div>

        </div>

      </div>

    </div>
  );
};
{
  /* React End */
}
