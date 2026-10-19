plugins { id("com.android.library"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose") }
android { namespace="com.freezzz.earthdeck.design"; compileSdk=35; defaultConfig { minSdk=26 };
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }; buildFeatures { compose=true } }
dependencies { implementation(platform("androidx.compose:compose-bom:2025.03.00")); implementation("androidx.compose.material3:material3"); implementation("androidx.compose.ui:ui") }
