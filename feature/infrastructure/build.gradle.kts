plugins { id("com.android.library"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose") }
android { namespace="com.freezzz.earthdeck.feature.infrastructure"; compileSdk=35; defaultConfig { minSdk=26 }; buildFeatures { compose=true } }
dependencies { implementation(platform("androidx.compose:compose-bom:2025.03.00")); implementation("androidx.compose.material3:material3"); implementation("androidx.compose.ui:ui"); implementation(project(":core:domain")); implementation(project(":core:common")); implementation(project(":core:ui")) }
