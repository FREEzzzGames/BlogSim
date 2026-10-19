plugins { id("com.android.library"); id("org.jetbrains.kotlin.android") }
android { namespace="com.freezzz.earthdeck.sync"; compileSdk=35; defaultConfig { minSdk=26 } compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 } }
dependencies { implementation("androidx.work:work-runtime-ktx:2.10.0"); implementation("androidx.core:core-ktx:1.15.0") }
